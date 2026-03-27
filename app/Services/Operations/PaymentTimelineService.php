<?php

namespace App\Services\Operations;

use App\Models\AuditLog;
use App\Models\CapitatedMonthlyRecord;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PaymentTimelineService
{
    public function buildPaymentRows(?int $customerUserId = null, int $limit = 100): array
    {
        $query = CapitatedMonthlyRecord::query()
            ->with(['person', 'contract'])
            ->orderByDesc('coverage_month')
            ->orderByDesc('id')
            ->limit($limit);

        if ($customerUserId) {
            $customerDoc = User::query()
                ->with('customerProfile')
                ->find($customerUserId)?->customerProfile?->doc_number;

            if (!$customerDoc) {
                return [];
            }

            $query->whereHas('person', function ($personQuery) use ($customerDoc) {
                $personQuery->where('document_number', (string) $customerDoc);
            });
        }

        $records = $query->get();

        $recordIds = $records->pluck('id')->values();
        $eventsByRecord = $this->loadPaymentEvents($recordIds->all());

        return $records->map(function (CapitatedMonthlyRecord $record) use ($eventsByRecord) {
            $events = $eventsByRecord[$record->id] ?? [];
            $lastEvent = $events[0] ?? null;

            $status = $this->resolveStatus($record, $lastEvent);

            return [
                'id' => $record->id,
                'reference' => sprintf('PMR-%d', $record->id),
                'contract_reference' => $record->contract?->uuid,
                'customer_name' => $record->full_name,
                'coverage_month' => optional($record->coverage_month)->format('Y-m-01'),
                'amount' => (float) ($record->price_final ?? 0),
                'status' => $status,
                'method' => $this->resolveMethod($lastEvent),
                'sync_state' => $status === 'PROCESSING' ? 'pending_webhook' : 'synchronized',
                'last_event_at' => $lastEvent['created_at'] ?? optional($record->updated_at)->toDateTimeString(),
                'events' => array_slice($events, 0, 5),
            ];
        })->values()->all();
    }

    public function registerPaymentEvent(int $monthlyRecordId, string $action, array $context = []): array
    {
        $eventContext = array_merge($context, [
            'monthly_record_id' => $monthlyRecordId,
            'payment_reference' => sprintf('PMR-%d', $monthlyRecordId),
        ]);

        AuditLog::create([
            'actor_user_id' => Auth::id(),
            'target_user_id' => null,
            'realm' => session('realm') ?: 'admin',
            'action' => $action,
            'context_json' => $eventContext,
            'ip' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'created_at' => now(),
        ]);

        return [
            'payment_reference' => sprintf('PMR-%d', $monthlyRecordId),
            'status' => $this->statusFromAction($action),
            'sync_state' => in_array($action, [
                'payment.webhook.processed',
                'payment.webhook.succeeded',
                'payment.webhook.failed',
            ], true) ? 'synchronized' : 'pending_webhook',
        ];
    }

    public function registerWebhookEvent(int $monthlyRecordId, string $outcome, string $eventId = ''): array
    {
        if ($eventId !== '' && $this->isDuplicateWebhookEvent($monthlyRecordId, $eventId)) {
            $row = $this->resolvePaymentRowByRecordId($monthlyRecordId);

            return [
                'payment_reference' => sprintf('PMR-%d', $monthlyRecordId),
                'status' => $row['status'] ?? 'NO_RECONOCIDO',
                'sync_state' => $row['sync_state'] ?? 'synchronized',
                'event_id' => $eventId,
                'idempotent' => true,
            ];
        }

        $action = $outcome === 'success'
            ? 'payment.webhook.succeeded'
            : 'payment.webhook.failed';

        $result = $this->registerPaymentEvent($monthlyRecordId, $action, [
            'channel' => 'stripe',
            'event_id' => $eventId,
        ]);

        return array_merge($result, [
            'event_id' => $eventId,
            'idempotent' => false,
        ]);
    }

    protected function resolveMethod(?array $event): string
    {
        $channel = strtolower((string) ($event['context']['channel'] ?? ''));

        if ($channel === 'stripe') {
            return 'Stripe';
        }

        if ($channel === 'manual') {
            return 'Cobro manual';
        }

        return 'Pendiente';
    }

    protected function resolveStatus(CapitatedMonthlyRecord $record, ?array $lastEvent): string
    {
        if ($lastEvent) {
            return $this->statusFromAction((string) $lastEvent['action']);
        }

        $month = $record->coverage_month ? Carbon::parse($record->coverage_month)->startOfMonth() : null;
        $currentMonth = now()->startOfMonth();

        if (!$month) {
            return 'NO_RECONOCIDO';
        }

        if ($month->lt($currentMonth)) {
            return 'PAST_DUE';
        }

        return 'PROCESSING';
    }

    protected function statusFromAction(string $action): string
    {
        return match ($action) {
            'payment.checkout.started', 'payment.retry.started', 'payment.subscribe.started' => 'PROCESSING',
            'payment.webhook.processed', 'payment.webhook.succeeded', 'payment.checkout.succeeded' => 'PAID',
            'payment.webhook.failed', 'payment.checkout.failed' => 'FAILED',
            default => 'NO_RECONOCIDO',
        };
    }

    protected function isDuplicateWebhookEvent(int $monthlyRecordId, string $eventId): bool
    {
        if ($eventId === '') {
            return false;
        }

        $eventIdPattern = sprintf('%%"event_id":"%s"%%', addcslashes($eventId, '\\"'));
        $recordPattern = sprintf('%%"monthly_record_id":%d%%', $monthlyRecordId);

        return AuditLog::query()
            ->whereIn('action', [
                'payment.webhook.succeeded',
                'payment.webhook.failed',
                'payment.webhook.processed',
            ])
            ->where('context_json', 'like', $eventIdPattern)
            ->where('context_json', 'like', $recordPattern)
            ->exists();
    }

    protected function resolvePaymentRowByRecordId(int $monthlyRecordId): ?array
    {
        return collect($this->buildPaymentRows(null, 300))
            ->firstWhere('id', $monthlyRecordId);
    }

    protected function loadPaymentEvents(array $recordIds): array
    {
        if (!$recordIds) {
            return [];
        }

        $events = AuditLog::query()
            ->whereIn('action', [
                'payment.checkout.started',
                'payment.subscribe.started',
                'payment.retry.started',
                'payment.webhook.processed',
                'payment.webhook.succeeded',
                'payment.webhook.failed',
                'payment.checkout.succeeded',
                'payment.checkout.failed',
            ])
            ->orderByDesc('id')
            ->get(['id', 'action', 'context_json', 'created_at'])
            ->map(function (AuditLog $event) {
                $context = is_array($event->context_json) ? $event->context_json : [];

                return [
                    'id' => $event->id,
                    'action' => $event->action,
                    'context' => $context,
                    'record_id' => (int) ($context['monthly_record_id'] ?? 0),
                    'created_at' => optional($event->created_at)->toDateTimeString(),
                ];
            })
            ->filter(fn ($event) => in_array($event['record_id'], $recordIds, true))
            ->values();

        $grouped = [];

        foreach ($events as $event) {
            $recordId = $event['record_id'];
            $grouped[$recordId] = $grouped[$recordId] ?? [];
            $grouped[$recordId][] = $event;
        }

        return $grouped;
    }
}
