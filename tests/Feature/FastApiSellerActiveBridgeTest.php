<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FastApiSellerActiveBridgeTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');

		if (!Route::has('seller.login')) {
			Route::get('/seller/login', fn () => response('seller-login'))->name('seller.login');
		}

		Route::middleware(['web', 'seller'])
			->prefix('seller')
			->group(function () {
				Route::get('/__test_active_bridge__', fn () => response('seller-protected-ok'))
					->name('seller.test.active-bridge');
			});
	}

	public function test_seller_group_redirects_guest_without_access_token_to_login(): void
	{
		$response = $this->get('/seller/__test_active_bridge__');

		$response->assertRedirect('/seller/login');
	}

	public function test_seller_group_redirects_inactive_fastapi_session_to_login(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 44,
					'email' => 'seller@example.com',
					'role' => 'SELLER',
					'status' => 'SUSPENDED',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/seller/__test_active_bridge__');

		$response->assertRedirect('/seller/login');
		$response->assertSessionHasErrors(['email']);
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}
}
