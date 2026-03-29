<?php

namespace App\Http\Middleware;

use App\Support\InteractsWithFastApiAccessToken;
use App\Support\Realm;
use Closure;
use Illuminate\Http\Request;

class FastApiCustomerShellContext
{
	use InteractsWithFastApiAccessToken;

	public function handle(Request $request, Closure $next)
	{
		$request->attributes->set('customer_shell_context', $this->buildContext($request));

		return $next($request);
	}

	protected function buildContext(Request $request): array
	{
		$user = $request->user('customer');
		if ($user) {
			$hasAclAssignments = $user->roles()->exists() || $user->permissions()->exists();

			return [
				'id' => $user->id,
				'name' => (string) ($user->name ?? $user->email ?? 'Cliente'),
				'email' => (string) ($user->email ?? ''),
				'role' => 'CUSTOMER',
				'status' => (string) ($user->status ?? 'Autenticado'),
				'permissions' => $hasAclAssignments
					? $user->getAllPermissions()->pluck('name')->values()->all()
					: null,
				'error_message' => (string) session('customer_profile_error', ''),
				'source' => 'laravel-guard',
			];
		}

		$realm = Realm::CUSTOMER;
		$accessToken = $this->resolveCookieValue($request, 'yastubo_access_token');
		if ($accessToken === '') {
			return $this->fallbackContext();
		}

		$me = $this->fetchFastApiMe($accessToken);
		if (!$me || !$this->isRoleAllowedForRealm((string) ($me['role'] ?? ''), $realm)) {
			return $this->fallbackContext('No fue posible cargar el perfil customer desde FastAPI.');
		}

		$permissions = $me['permissions'] ?? null;

		return [
			'id' => $me['id'] ?? null,
			'name' => (string) ($me['name'] ?? $me['email'] ?? 'Cliente'),
			'email' => (string) ($me['email'] ?? ''),
			'role' => (string) ($me['role'] ?? 'CUSTOMER'),
			'status' => (string) ($me['status'] ?? 'Autenticado'),
			'permissions' => is_array($permissions) ? array_values($permissions) : null,
			'error_message' => '',
			'source' => 'fastapi-me',
		];
	}

	protected function fallbackContext(string $errorMessage = ''): array
	{
		return [
			'id' => null,
			'name' => 'Cliente',
			'email' => '',
			'role' => 'CUSTOMER',
			'status' => 'Autenticado',
			'permissions' => null,
			'error_message' => $errorMessage,
			'source' => 'fallback',
		];
	}
}
