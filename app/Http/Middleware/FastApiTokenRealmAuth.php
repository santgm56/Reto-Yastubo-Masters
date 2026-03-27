<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Realm;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Http;

class FastApiTokenRealmAuth
{
    public function handle(Request $request, Closure $next)
    {
        $realm = Realm::current($request);
        if (!$realm) {
            return $next($request);
        }

        $guard = match ($realm) {
            Realm::CUSTOMER => 'customer',
            Realm::SELLER => 'seller',
            default => 'admin',
        };
        if (Auth::guard($guard)->check()) {
            return $next($request);
        }

        $accessToken = trim((string) $request->cookie('yastubo_access_token', ''));
        if ($accessToken === '') {
            return $next($request);
        }

        $me = $this->fetchFastApiMe($accessToken);
        if (!$me || !$this->isRoleAllowedForRealm((string) ($me['role'] ?? ''), $realm)) {
            $this->expireAccessTokenCookie();
            return $next($request);
        }

        $user = $this->resolveLocalUser($me, $realm);
        if (!$user) {
            $this->expireAccessTokenCookie();
            return $next($request);
        }

        Auth::guard($guard)->login($user);
        $request->session()->regenerate();

        return $next($request);
    }

    protected function fetchFastApiMe(string $accessToken): ?array
    {
        $baseUrl = trim((string) config('services.fastapi.base_url', ''));
        if ($baseUrl === '') {
            return null;
        }

        $url = rtrim($baseUrl, '/') . '/api/v1/auth/me';

        $response = Http::timeout(8)
            ->acceptJson()
            ->withToken($accessToken)
            ->get($url);

        if (!$response->ok()) {
            return null;
        }

        $payload = $response->json('data');
        return is_array($payload) ? $payload : null;
    }

    protected function isRoleAllowedForRealm(string $role, string $realm): bool
    {
        $normalizedRole = strtoupper(trim($role));

        if ($realm === Realm::CUSTOMER) {
            return $normalizedRole === 'CUSTOMER';
        }

        return in_array($normalizedRole, ['ADMIN', 'SELLER'], true);
    }

    protected function resolveLocalUser(array $me, string $realm): ?User
    {
        $query = User::query();

        if (!empty($me['id'])) {
            $query->where('id', (int) $me['id']);
        } elseif (!empty($me['email'])) {
            $query->where('email', (string) $me['email']);
        } else {
            return null;
        }

        if ($realm === Realm::CUSTOMER) {
            $query->where('realm', Realm::CUSTOMER);
        } else {
            $query->where('realm', '!=', Realm::CUSTOMER);
        }

        return $query->first();
    }

    protected function expireAccessTokenCookie(): void
    {
        Cookie::queue(Cookie::forget('yastubo_access_token', '/'));
    }
}
