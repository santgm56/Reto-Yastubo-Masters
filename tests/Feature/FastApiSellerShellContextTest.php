<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class FastApiSellerShellContextTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');

		Route::middleware(['web', 'fastapi.seller.shell.context'])
			->prefix('seller')
			->group(function () {
				Route::get('/__test_shell_context__', function () {
					return response()->json(request()->attributes->get('seller_shell_context', []));
				})->name('seller.test.shell-context');
			});
	}

	public function test_shell_context_falls_back_when_no_access_token_is_available(): void
	{
		$response = $this->get('/seller/__test_shell_context__');

		$response->assertOk();
		$response->assertJsonPath('source', 'fallback');
		$response->assertJsonPath('role', 'SELLER');
	}

	public function test_shell_context_uses_fastapi_me_payload_when_guard_is_missing(): void
	{
		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => 44,
					'name' => 'Seller Demo',
					'email' => 'seller@example.com',
					'role' => 'SELLER',
					'permissions' => ['seller.dashboard.view', 'seller.sales.view'],
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/seller/__test_shell_context__');

		$response->assertOk();
		$response->assertJsonPath('source', 'fastapi-me');
		$response->assertJsonPath('name', 'Seller Demo');
		$response->assertJsonPath('email', 'seller@example.com');
		$response->assertJsonPath('permissions.0', 'seller.dashboard.view');
		$response->assertJsonPath('permissions.1', 'seller.sales.view');
	}
}
