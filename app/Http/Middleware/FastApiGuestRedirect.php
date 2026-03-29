<?php

namespace App\Http\Middleware;

use App\Support\InteractsWithFastApiAccessToken;
use App\Support\Realm;
use Closure;
use Illuminate\Http\Request;

class FastApiGuestRedirect
{
	use InteractsWithFastApiAccessToken;

	public function handle(Request $request, Closure $next)
	{
		$realm = Realm::current($request);
		if (!$realm) {
			return $next($request);
		}

		$accessToken = $this->resolveCookieValue($request, 'yastubo_access_token');
		if ($accessToken === '') {
			return $next($request);
		}

		$me = $this->fetchFastApiMe($accessToken);
		if (!$me || !$this->isRoleAllowedForRealm((string) ($me['role'] ?? ''), $realm)) {
			$this->expireAccessTokenCookie();

			return $next($request);
		}

		return redirect()->to(Realm::homePath($realm));
	}
}
