<?php

namespace Tests\Feature;

use App\Http\Middleware\FastApiTokenRealmAuth;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\RequiresPhpExtension;
use Tests\TestCase;

#[RequiresPhpExtension('pdo_sqlite')]
class FastApiAdminSessionBindingBridgeTest extends TestCase
{
	protected function setUp(): void
	{
		parent::setUp();

		config()->set('services.fastapi.base_url', 'http://127.0.0.1:8001');

		$this->ensureBridgeTables();
	}

	public function test_bridge_syncs_current_session_user_id_for_admin_requests(): void
	{
		$user = User::query()->create([
			'realm' => 'admin',
			'email' => 'admin.session@example.com',
			'password' => 'secret-pass',
			'first_name' => 'Admin',
			'last_name' => 'Session',
			'display_name' => 'Admin Session',
			'status' => 'active',
			'locale' => 'es',
			'timezone' => 'America/Santiago',
		]);

		DB::table('sessions')->insert([
			'id' => 'admin-session-id',
			'user_id' => null,
			'ip_address' => null,
			'user_agent' => null,
			'payload' => 'test-payload',
			'last_activity' => 0,
		]);

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

		$request = Request::create(
			'/admin/__test_session_binding__',
			'GET',
			[],
			['yastubo_access_token' => 'valid-token'],
			[],
			['HTTP_USER_AGENT' => str_repeat('A', 300)]
		);

		$session = new Store('test', new ArraySessionHandler(120));
		$session->setId('admin-session-id');
		$session->start();
		$request->setLaravelSession($session);

		$response = app(FastApiTokenRealmAuth::class)->handle(
			$request,
			static fn () => response('admin-protected-ok')
		);

		$this->assertSame('admin-protected-ok', $response->getContent());
		$this->assertSame($user->id, DB::table('sessions')->where('id', 'admin-session-id')->value('user_id'));
		$this->assertSame(str_repeat('A', 255), DB::table('sessions')->where('id', 'admin-session-id')->value('user_agent'));
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

		if (!Schema::hasTable('sessions')) {
			Schema::create('sessions', function (Blueprint $table) {
				$table->string('id')->primary();
				$table->unsignedBigInteger('user_id')->nullable()->index();
				$table->string('ip_address', 45)->nullable();
				$table->text('user_agent')->nullable();
				$table->longText('payload');
				$table->integer('last_activity')->index();
			});
		}
	}
}
