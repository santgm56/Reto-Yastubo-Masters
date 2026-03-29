<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FastApiGuestRedirectTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');

		if (!Route::has('admin.home')) {
			Route::get('/admin', fn () => response('admin-home'))->name('admin.home');
		}

		if (!Route::has('seller.home')) {
			Route::get('/seller', fn () => response('seller-home'))->name('seller.home');
		}

		if (!Route::has('customer.home')) {
			Route::get('/customer/home', fn () => response('customer-home'))->name('customer.home');
		}

		Route::middleware(['web', 'fastapi.guest.redirect'])
			->prefix('admin')
			->group(function () {
				Route::get('/__test_guest_redirect__', fn () => response('admin-guest-ok'))->name('admin.test.guest-redirect');
			});

		Route::middleware(['web', 'fastapi.guest.redirect'])
			->prefix('seller')
			->group(function () {
				Route::get('/__test_guest_redirect__', fn () => response('seller-guest-ok'))->name('seller.test.guest-redirect');
			});

		Route::middleware(['web', 'fastapi.guest.redirect'])
			->prefix('customer')
			->group(function () {
				Route::get('/__test_guest_redirect__', fn () => response('guest-ok'))->name('customer.test.guest-redirect');
			});
	}

	public function test_guest_route_allows_request_without_access_token(): void
	{
		$response = $this->get('/customer/__test_guest_redirect__');

		$response->assertOk();
		$response->assertSee('guest-ok');
	}

	public function test_guest_route_redirects_customer_with_valid_fastapi_session(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'role' => 'CUSTOMER',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/customer/__test_guest_redirect__');

		$response->assertRedirect('/customer/home');
	}

	public function test_guest_route_redirects_admin_with_valid_fastapi_session(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'role' => 'ADMIN',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-admin-token')
			->get('/admin/__test_guest_redirect__');

		$response->assertRedirect('/admin');
	}

	public function test_guest_route_redirects_seller_with_valid_fastapi_session(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'role' => 'SELLER',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-seller-token')
			->get('/seller/__test_guest_redirect__');

		$response->assertRedirect('/seller');
	}

	public function test_guest_route_keeps_guest_flow_and_expires_cookie_for_invalid_realm_role(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'role' => 'ADMIN',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'invalid-for-customer')
			->get('/customer/__test_guest_redirect__');

		$response->assertOk();
		$response->assertSee('guest-ok');
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}
}
