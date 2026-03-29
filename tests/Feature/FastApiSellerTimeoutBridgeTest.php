<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;

class FastApiSellerTimeoutBridgeTest extends FastApiSellerActiveBridgeTest
{
	public function test_seller_group_redirects_when_absolute_session_timeout_is_reached(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 44,
					'email' => 'seller@example.com',
					'role' => 'SELLER',
					'status' => 'ACTIVE',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->withSession(['abs_start_ts' => now()->subMinutes(601)->getTimestamp()])
			->get('/seller/__test_active_bridge__');

		$response->assertRedirect('/seller/login');
		$response->assertSessionHas('info', 'Tu sesión expiró por tiempo máximo.');
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}
}
