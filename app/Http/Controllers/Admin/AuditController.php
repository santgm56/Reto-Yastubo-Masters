<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index()
    {
        return view('admin.audit.index');
    }

    public function events(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = $perPage > 0 && $perPage <= 100 ? $perPage : 10;

        $query = AuditLog::query()->orderByDesc('id');

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . trim((string) $request->input('action')) . '%');
        }

        if ($request->filled('realm')) {
            $realm = trim((string) $request->input('realm'));
            if (in_array($realm, ['admin', 'customer'], true)) {
                $query->where('realm', $realm);
            }
        }

        if ($request->filled('actor_user_id')) {
            $query->where('actor_user_id', (int) $request->input('actor_user_id'));
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->input('from') . ' 00:00:00');
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->input('to') . ' 23:59:59');
        }

        $page = $query->paginate($perPage);

        $actorIds = $page->getCollection()->pluck('actor_user_id')->filter()->unique()->values();
        $actors = User::query()
            ->whereIn('id', $actorIds)
            ->get(['id', 'name', 'email'])
            ->keyBy('id');

        $rows = $page->getCollection()->map(function (AuditLog $item) use ($actors) {
            $actor = $item->actor_user_id ? $actors->get($item->actor_user_id) : null;

            return [
                'id' => $item->id,
                'action' => $item->action,
                'realm' => $item->realm,
                'actor_user_id' => $item->actor_user_id,
                'actor_name' => $actor?->name,
                'actor_email' => $actor?->email,
                'target_user_id' => $item->target_user_id,
                'ip' => $item->ip,
                'created_at' => optional($item->created_at)->toDateTimeString(),
                'context_json' => $item->context_json,
            ];
        })->values();

        return response()->json([
            'data' => [
                'rows' => $rows,
                'pagination' => [
                    'current_page' => $page->currentPage(),
                    'last_page' => $page->lastPage(),
                    'per_page' => $page->perPage(),
                    'total' => $page->total(),
                ],
            ],
            'request_id' => (string) str()->uuid(),
        ]);
    }
}
