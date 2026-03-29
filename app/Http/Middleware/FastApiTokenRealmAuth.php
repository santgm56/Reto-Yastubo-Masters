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

        $authGuard = Auth::guard($guard);

        $accessToken = $this->resolveCookieValue($request, 'yastubo_access_token');
        if ($accessToken === '') {
            if ($authGuard->check()) {
                $authGuard->logout();
            }

            return $next($request);
        }

        $me = $this->fetchFastApiMe($accessToken);
        if (!$me || !$this->isRoleAllowedForRealm((string) ($me['role'] ?? ''), $realm)) {
            if ($authGuard->check()) {
                $authGuard->logout();
            }

            $this->expireAccessTokenCookie();
            return $next($request);
        }

        $user = $this->resolveLocalUser($me, $realm);
        if (!$user) {
            if ($authGuard->check()) {
                $authGuard->logout();
            }

            $this->expireAccessTokenCookie();
            return $next($request);
        }

        // Auth request-scoped: no persistir sesión Laravel como fuente de verdad.
        $authGuard->setUser($user);
        Auth::shouldUse($guard);
        Auth::setUser($user);
        $request->setUserResolver(static fn () => $user);

        return $next($request);
    }

    protected function resolveCookieValue(Request $request, string $cookieName): string
    {
        $fromRequest = trim((string) $request->cookie($cookieName, ''));
        if ($fromRequest !== '') {
            return $fromRequest;
        }

        $rawCookieHeader = trim((string) $request->headers->get('cookie', ''));
        if ($rawCookieHeader === '') {
            return '';
        }

        foreach (explode(';', $rawCookieHeader) as $chunk) {
            [$name, $value] = array_pad(explode('=', $chunk, 2), 2, '');
            if (trim($name) !== $cookieName) {
                continue;
            }

            return trim(urldecode($value));
        }

        return '';
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
