<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\RequiresPhpExtension;
use Tests\TestCase;

#[RequiresPhpExtension('pdo_sqlite')]
class FastApiAdminForcePasswordChangeBridgeTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');
		$this->ensureBridgeTables();

		Route::middleware(['web', 'admin'])
			->prefix('admin')
			->group(function () {
				Route::get('/__test_force_password_change__', fn () => response('admin-protected-ok'));
				Route::match(['GET', 'POST'], '/password/force', fn () => response('admin-force-password-ok'));
			});
	}

	public function test_admin_group_redirects_to_force_password_change_screen_when_flagged(): void
	{
		$user = $this->createAdminUser(forcePasswordChange: true);

		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => $user->id,
					'email' => $user->email,
					'role' => 'ADMIN',
					'status' => 'ACTIVE',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/admin/__test_force_password_change__');

		$response->assertRedirect('/admin/password/force');
		$response->assertSessionHas('status', 'Debes actualizar tu contraseña antes de continuar.');
	}

	public function test_admin_group_allows_force_password_change_screen_when_flagged(): void
	{
		$user = $this->createAdminUser(forcePasswordChange: true, email: 'admin.force.allowed@example.com');

		Http::fake([
			'http://127.0.0.1:8001/api/v1/auth/me' => Http::response([
				'data' => [
					'id' => $user->id,
					'email' => $user->email,
					'role' => 'ADMIN',
					'status' => 'ACTIVE',
				],
			], 200),
		]);

		$response = $this->withCookie('yastubo_access_token', 'valid-token')
			->get('/admin/password/force');

		$response->assertOk();
		$response->assertSee('admin-force-password-ok');
	}

	protected function createAdminUser(bool $forcePasswordChange, string $email = 'admin.force@example.com'): User
	{
		return User::query()->create([
			'realm' => 'admin',
			'email' => $email,
			'password' => 'secret-pass',
			'first_name' => 'Admin',
			'last_name' => 'Force',
			'display_name' => 'Admin Force',
			'status' => 'active',
			'force_password_change' => $forcePasswordChange,
			'locale' => 'es',
			'timezone' => 'America/Santiago',
		]);
	}

	protected function ensureBridgeTables(): void
	{
		if (!Schema::hasTable('users')) {
			Schema::create('users', function (Blueprint $table) {
				$table->id();
				$table->string('realm')->index();
				$table->string('email');
				$table->string('password');
				$table->string('first_name', 100)->nullable();
				$table->string('last_name', 120)->nullable();
				$table->string('display_name', 120)->nullable();
				$table->string('status', 20)->default('active')->index();
				$table->boolean('force_password_change')->default(false);
				$table->timestamp('email_verified_at')->nullable();
				$table->string('locale', 5)->default('es');
				$table->string('timezone', 50)->default('America/Santiago');
				$table->longText('ui_settings_json')->nullable();
				$table->rememberToken();
				$table->softDeletes();
				$table->timestamps();
			});
		}

		if (Schema::hasTable('users') && !Schema::hasColumn('users', 'force_password_change')) {
			Schema::table('users', function (Blueprint $table) {
				$table->boolean('force_password_change')->default(false);
			});
		}
	}
}
