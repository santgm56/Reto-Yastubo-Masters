<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Http;

trait InteractsWithFastApiAccessToken
{
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

	protected function expireAccessTokenCookie(): void
	{
		Cookie::queue(Cookie::forget('yastubo_access_token', '/'));
	}

	protected function isRoleAllowedForRealm(string $role, string $realm): bool
	{
		$normalizedRole = strtoupper(trim($role));

		return in_array($normalizedRole, Realm::allowedRoles($realm), true);
	}
}
