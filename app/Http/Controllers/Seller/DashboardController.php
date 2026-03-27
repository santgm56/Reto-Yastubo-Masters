<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\CustomerProfile;
use App\Models\PlanVersion;
use App\Models\User;
use App\Services\Operations\PaymentTimelineService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected PaymentTimelineService $paymentTimelineService
    ) {
    }

    public function index()
    {
        return view('seller.home', [
            'section' => 'dashboard',
            'title' => 'Seller Dashboard',
        ]);
    }

    public function customers()
    {
        return view('seller.home', [
            'section' => 'customers',
            'title' => 'Seller Customers',
        ]);
    }

    public function sales()
    {
        return view('seller.home', [
            'section' => 'sales',
            'title' => 'Seller Sales',
        ]);
    }

    public function issuance()
    {
        return view('seller.issuance');
    }

    public function payments()
    {
        return view('seller.payments');
    }

    public function summary(Request $request)
    {
        $customersCount = CustomerProfile::query()->count();
        $activePlansCount = PlanVersion::query()->where('status', 'ACTIVE')->count();
        $auditTotal = AuditLog::query()->count();

        $recentCustomers = User::query()
            ->where('realm', 'customer')
            ->orderByDesc('id')
            ->limit(8)
            ->get(['id', 'name', 'email', 'status', 'created_at'])
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'created_at' => optional($user->created_at)->toDateTimeString(),
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'kpis' => [
                    'customers_total' => $customersCount,
                    'active_plans_total' => $activePlansCount,
                    'audit_events_total' => $auditTotal,
                ],
                'recent_customers' => $recentCustomers,
            ],
            'request_id' => (string) str()->uuid(),
        ]);
    }

    public function customersData(): \Illuminate\Http\JsonResponse
    {
        $rows = User::query()
            ->where('realm', 'customer')
            ->orderByDesc('id')
            ->limit(50)
            ->get(['id', 'name', 'email', 'status', 'created_at'])
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => (string) ($user->name ?? ''),
                    'email' => (string) ($user->email ?? ''),
                    'status' => (string) ($user->status ?? ''),
                    'created_at' => optional($user->created_at)->toDateTimeString(),
                ];
            })
            ->values();

        return response()->json([
            'data' => [
                'rows' => $rows,
                'total' => $rows->count(),
            ],
            'request_id' => (string) str()->uuid(),
        ]);
    }

    public function salesData(): \Illuminate\Http\JsonResponse
    {
        $rows = $this->paymentTimelineService->buildPaymentRows(null, 80);

        return response()->json([
            'data' => [
                'rows' => $rows,
                'total' => count($rows),
            ],
            'request_id' => (string) str()->uuid(),
        ]);
    }
}
