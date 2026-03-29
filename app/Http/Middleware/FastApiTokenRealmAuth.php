<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use App\Models\User;
use App\Support\InteractsWithFastApiAccessToken;
use App\Support\Realm;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class FastApiTokenRealmAuth
{
	use InteractsWithFastApiAccessToken;

    public function handle(Request $request, Closure $next)
    {
        $realm = Realm::current($request);
        if (!$realm) {
            return $next($request);
        }

        $guard = Realm::guardName($realm);
        if (!$guard) {
            return $next($request);
        }

        $authGuard = Auth::guard($guard);

        $accessToken = $this->resolveCookieValue($request, 'yastubo_access_token');
        if ($accessToken === '') {
            return $this->redirectUnauthenticatedProtectedRequest($authGuard, $realm);
        }

        $me = $this->fetchFastApiMe($accessToken);
        if (!$me || !$this->isRoleAllowedForRealm((string) ($me['role'] ?? ''), $realm)) {
            return $this->redirectUnauthenticatedProtectedRequest($authGuard, $realm, true);
        }

        if ($this->shouldHandleActiveStatusInBridge($realm) && $this->isInactiveStatus($me['status'] ?? null)) {
            return $this->redirectInactiveAccount($request, $authGuard, $realm);
        }

        if ($this->shouldHandleAbsoluteSessionTimeoutInBridge($realm)) {
            $timedOutResponse = $this->redirectExpiredSessionIfNeeded($request, $authGuard, $realm);
            if ($timedOutResponse) {
                return $timedOutResponse;
            }
        }

        $user = $this->resolveLocalUser($me, $realm);
        if (!$user) {
            return $this->redirectUnauthenticatedProtectedRequest($authGuard, $realm, true);
        }

        if ($this->shouldHandleActiveStatusInBridge($realm) && $this->isInactiveStatus($user->status ?? null)) {
            return $this->redirectInactiveAccount($request, $authGuard, $realm);
        }

        if ($this->shouldHandleForcePasswordChangeInBridge($realm)) {
            $forcePasswordResponse = $this->redirectForcedPasswordChangeIfNeeded($request, $user, $realm);
            if ($forcePasswordResponse) {
                return $forcePasswordResponse;
            }
        }

        // Auth request-scoped: no persistir sesión Laravel como fuente de verdad.
        $authGuard->setUser($user);
        Auth::shouldUse($guard);
        Auth::setUser($user);
        $request->setUserResolver(static fn () => $user);
        $this->syncCurrentSessionToUser($request, $user);

        return $next($request);
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

    protected function isInactiveStatus(mixed $status): bool
    {
        $normalizedStatus = strtoupper(trim((string) $status));

        return $normalizedStatus !== '' && $normalizedStatus !== 'ACTIVE';
    }

    protected function shouldHandleActiveStatusInBridge(string $realm): bool
    {
        return in_array($realm, [Realm::ADMIN, Realm::SELLER, Realm::CUSTOMER], true);
    }

    protected function shouldHandleAbsoluteSessionTimeoutInBridge(string $realm): bool
    {
        return in_array($realm, [Realm::ADMIN, Realm::SELLER, Realm::CUSTOMER], true);
    }

    protected function shouldHandleForcePasswordChangeInBridge(string $realm): bool
    {
        return in_array($realm, [Realm::ADMIN, Realm::SELLER, Realm::CUSTOMER], true);
    }

    protected function redirectExpiredSessionIfNeeded(Request $request, $authGuard, string $realm)
    {
        if (!$request->hasSession()) {
            return null;
        }

        $maxMinutes = 600;

        try {
            $configuredTimeout = SystemSetting::get('auth.session.absolute_timeout_minutes', 600);
            $maxMinutes = (int) ($configuredTimeout ?? 600);
        } catch (\Throwable) {
            $maxMinutes = 600;
        }

        $started = (int) $request->session()->get('abs_start_ts', 0);

        if ($started <= 0) {
            $request->session()->put('abs_start_ts', now()->getTimestamp());
            return null;
        }

        if ((now()->getTimestamp() - $started) <= max(1, $maxMinutes) * 60) {
            return null;
        }

        if ($authGuard->check()) {
            $authGuard->logout();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $this->expireAccessTokenCookie();

        return redirect()
            ->to(Realm::loginPath($realm))
            ->with('info', 'Tu sesión expiró por tiempo máximo.');
    }

    protected function redirectInactiveAccount(Request $request, $authGuard, string $realm)
    {
        if ($authGuard->check()) {
            $authGuard->logout();
        }

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $this->expireAccessTokenCookie();

        return redirect()
            ->to(Realm::loginPath($realm))
            ->withErrors(['email' => 'Cuenta no activa.']);
    }

    protected function redirectUnauthenticatedProtectedRequest($authGuard, string $realm, bool $expireCookie = false)
    {
        if ($authGuard->check()) {
            $authGuard->logout();
        }

        if ($expireCookie) {
            $this->expireAccessTokenCookie();
        }

        return redirect()->to(Realm::loginPath($realm));
    }

    protected function redirectForcedPasswordChangeIfNeeded(Request $request, User $user, string $realm)
    {
        if (!$user->forcePasswordChange()) {
            return null;
        }

        if ($this->isForcePasswordChangeBypassPath($request, $realm)) {
            return null;
        }

        $this->syncCurrentSessionToUser($request, $user);

        return redirect()
            ->to(Realm::forcePasswordPath($realm))
            ->with('status', 'Debes actualizar tu contraseña antes de continuar.');
    }

    protected function isForcePasswordChangeBypassPath(Request $request, string $realm): bool
    {
        $currentPath = '/' . ltrim($request->path(), '/');

        return in_array($currentPath, [Realm::forcePasswordPath($realm), Realm::logoutPath($realm)], true);
    }

    protected function syncCurrentSessionToUser(Request $request, User $user): void
    {
        if (!$request->hasSession()) {
            return;
        }

        $sessionId = (string) $request->session()->getId();
        if ($sessionId === '') {
            return;
        }

        try {
            DB::table('sessions')
                ->where('id', $sessionId)
                ->update([
                    'user_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => Str::limit($request->userAgent() ?? '', 255),
                    'last_activity' => time(),
                ]);
        } catch (\Throwable) {
            // No romper la request si la sincronizacion de sessions falla.
        }
    }
}
