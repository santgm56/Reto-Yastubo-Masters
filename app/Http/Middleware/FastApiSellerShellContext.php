<?php

namespace App\Http\Middleware;

use App\Support\InteractsWithFastApiAccessToken;
use App\Support\Realm;
use Closure;
use Illuminate\Http\Request;

class FastApiSellerShellContext
{
	use InteractsWithFastApiAccessToken;

	public function handle(Request $request, Closure $next)
	{
		$request->attributes->set('seller_shell_context', $this->buildContext($request));

		return $next($request);
	}

	protected function buildContext(Request $request): array
	{
		$user = $request->user('seller');
		if ($user) {
			$permissionNames = $user->getAllPermissions()->pluck('name')->values()->all();

			return [
				'id' => $user->id,
				'name' => (string) ($user->displayName() ?? $user->name ?? $user->email ?? 'Seller'),
				'email' => (string) ($user->email ?? ''),
				'role' => (string) ($user->getRoleNames()->first() ?? 'SELLER'),
				'permissions' => $permissionNames,
				'source' => 'laravel-guard',
			];
		}

		$accessToken = $this->resolveCookieValue($request, 'yastubo_access_token');
		if ($accessToken === '') {
			return $this->fallbackContext();
		}

		$me = $this->fetchFastApiMe($accessToken);
		if (!$me || !$this->isRoleAllowedForRealm((string) ($me['role'] ?? ''), Realm::SELLER)) {
			return $this->fallbackContext();
		}

		$permissions = $me['permissions'] ?? null;

		return [
			'id' => $me['id'] ?? null,
			'name' => (string) ($me['name'] ?? $me['email'] ?? 'Seller'),
			'email' => (string) ($me['email'] ?? ''),
			'role' => (string) ($me['role'] ?? 'SELLER'),
			'permissions' => is_array($permissions) ? array_values($permissions) : [],
			'source' => 'fastapi-me',
		];
	}

	protected function fallbackContext(): array
	{
		return [
			'id' => null,
			'name' => 'Seller',
			'email' => '',
			'role' => 'SELLER',
			'permissions' => [],
			'source' => 'fallback',
		];
	}
}
