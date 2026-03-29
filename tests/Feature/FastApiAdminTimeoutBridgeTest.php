<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;

class FastApiAdminTimeoutBridgeTest extends FastApiAdminActiveBridgeTest
{
	public function test_admin_group_redirects_when_absolute_session_timeout_is_reached(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 11,
					'email' => 'admin@example.com',
					'role' => 'ADMIN',
					'status' => 'ACTIVE',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->withSession(['abs_start_ts' => now()->subMinutes(601)->getTimestamp()])
			->get('/admin/__test_active_bridge__');

		$response->assertRedirect('/admin/login');
		$response->assertSessionHas('info', 'Tu sesión expiró por tiempo máximo.');
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}
}
