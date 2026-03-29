<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

class FastApiCustomerActiveBridgeTest extends FastApiCustomerShellContextTest
{
	protected function setUp(): void
	{
		parent::setUp();

		if (!Route::has('customer.login')) {
			Route::get('/customer/login', fn () => response('customer-login'))->name('customer.login');
		}

		Route::middleware(['web', 'customer'])
			->prefix('customer')
			->group(function () {
				Route::get('/__test_active_bridge__', fn () => response('customer-protected-ok'))
					->name('customer.test.active-bridge');
			});
	}

	public function test_customer_group_redirects_guest_without_access_token_to_login(): void
	{
		$response = $this->get('/customer/__test_active_bridge__');

		$response->assertRedirect('/customer/login');
	}

	public function test_customer_group_redirects_inactive_fastapi_session_to_login(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 88,
					'email' => 'cliente@example.com',
					'role' => 'CUSTOMER',
					'status' => 'SUSPENDED',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/customer/__test_active_bridge__');

		$response->assertRedirect('/customer/login');
		$response->assertSessionHasErrors(['email']);
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}
}
