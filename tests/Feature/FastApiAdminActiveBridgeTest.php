<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FastApiAdminActiveBridgeTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');

		if (!Route::has('admin.login')) {
			Route::get('/admin/login', fn () => response('admin-login'))->name('admin.login');
		}

		Route::middleware(['web', 'admin'])
			->prefix('admin')
			->group(function () {
				Route::get('/__test_active_bridge__', fn () => response('admin-protected-ok'))
					->name('admin.test.active-bridge');
			});
	}

	public function test_admin_group_redirects_guest_without_access_token_to_login(): void
	{
		$response = $this->get('/admin/__test_active_bridge__');

		$response->assertRedirect('/admin/login');
	}

	public function test_admin_group_redirects_inactive_fastapi_session_to_login(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 11,
					'email' => 'admin@example.com',
					'role' => 'ADMIN',
					'status' => 'SUSPENDED',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/admin/__test_active_bridge__');

		$response->assertRedirect('/admin/login');
		$response->assertSessionHasErrors(['email']);
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}

	public function test_admin_group_redirects_invalid_fastapi_realm_role_to_login_and_expires_cookie(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 11,
					'email' => 'admin@example.com',
					'role' => 'CUSTOMER',
					'status' => 'ACTIVE',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'invalid-for-admin')
			->get('/admin/__test_active_bridge__');

		$response->assertRedirect('/admin/login');
		$this->assertStringContainsString('yastubo_access_token=', implode(';', $response->headers->getCookies()));
		$this->assertStringContainsString('Max-Age=0', implode(';', $response->headers->getCookies()));
	}
}
