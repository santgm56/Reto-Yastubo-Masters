<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FastApiCustomerShellContextTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');

		Route::middleware(['web', 'fastapi.customer.shell.context'])
			->prefix('customer')
			->group(function () {
				Route::get('/__test_shell_context__', function () {
					return response()->json(request()->attributes->get('customer_shell_context', []));
				})->name('customer.test.shell-context');
			});
	}

	public function test_shell_context_falls_back_when_no_access_token_is_available(): void
	{
		$response = $this->get('/customer/__test_shell_context__');

		$response->assertOk();
		$response->assertJsonPath('source', 'fallback');
		$response->assertJsonPath('role', 'CUSTOMER');
	}

	public function test_shell_context_uses_fastapi_me_payload_when_guard_is_missing(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 88,
					'name' => 'Cliente Demo',
					'email' => 'cliente@example.com',
					'role' => 'CUSTOMER',
					'status' => 'active',
					'permissions' => ['portal.dashboard.view', 'portal.products.view'],
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/customer/__test_shell_context__');

		$response->assertOk();
		$response->assertJsonPath('source', 'fastapi-me');
		$response->assertJsonPath('name', 'Cliente Demo');
		$response->assertJsonPath('email', 'cliente@example.com');
		$response->assertJsonPath('permissions.0', 'portal.dashboard.view');
		$response->assertJsonPath('permissions.1', 'portal.products.view');
	}
}
