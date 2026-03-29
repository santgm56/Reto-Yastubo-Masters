<?php

namespace Tests\Unit;

use App\Support\Realm;
use PHPUnit\Framework\TestCase;

class RealmTest extends TestCase
{
	public function test_guard_name_is_resolved_for_known_realms(): void
	{
		$this->assertSame('admin', Realm::guardName(Realm::ADMIN));
		$this->assertSame('seller', Realm::guardName(Realm::SELLER));
		$this->assertSame('customer', Realm::guardName(Realm::CUSTOMER));
		$this->assertNull(Realm::guardName('unknown'));
	}

	public function test_login_and_home_routes_are_resolved_for_known_realms(): void
	{
		$this->assertSame('admin.login', Realm::loginRouteName(Realm::ADMIN));
		$this->assertSame('seller.login', Realm::loginRouteName(Realm::SELLER));
		$this->assertSame('customer.login', Realm::loginRouteName(Realm::CUSTOMER));
		$this->assertSame('home', Realm::loginRouteName('unknown'));

		$this->assertSame('/admin/login', Realm::loginPath(Realm::ADMIN));
		$this->assertSame('/seller/login', Realm::loginPath(Realm::SELLER));
		$this->assertSame('/customer/login', Realm::loginPath(Realm::CUSTOMER));
		$this->assertSame('/', Realm::loginPath('unknown'));

		$this->assertSame('/admin', Realm::homePath(Realm::ADMIN));
		$this->assertSame('/seller', Realm::homePath(Realm::SELLER));
		$this->assertSame('/customer/home', Realm::homePath(Realm::CUSTOMER));
		$this->assertSame('/', Realm::homePath('unknown'));

		$this->assertSame('/admin/password/force', Realm::forcePasswordPath(Realm::ADMIN));
		$this->assertSame('/seller/password/force', Realm::forcePasswordPath(Realm::SELLER));
		$this->assertSame('/customer/password/force', Realm::forcePasswordPath(Realm::CUSTOMER));
		$this->assertSame('/', Realm::forcePasswordPath('unknown'));

		$this->assertSame('/admin/logout', Realm::logoutPath(Realm::ADMIN));
		$this->assertSame('/seller/logout', Realm::logoutPath(Realm::SELLER));
		$this->assertSame('/customer/logout', Realm::logoutPath(Realm::CUSTOMER));
		$this->assertSame('/logout', Realm::logoutPath('unknown'));

		$this->assertSame('admin.home', Realm::homeRouteName(Realm::ADMIN));
		$this->assertSame('seller.home', Realm::homeRouteName(Realm::SELLER));
		$this->assertSame('customer.home', Realm::homeRouteName(Realm::CUSTOMER));
		$this->assertSame('home', Realm::homeRouteName('unknown'));
	}

	public function test_allowed_roles_are_grouped_by_realm(): void
	{
		$this->assertSame(['ADMIN', 'SELLER'], Realm::allowedRoles(Realm::ADMIN));
		$this->assertSame(['ADMIN', 'SELLER'], Realm::allowedRoles(Realm::SELLER));
		$this->assertSame(['CUSTOMER'], Realm::allowedRoles(Realm::CUSTOMER));
		$this->assertSame([], Realm::allowedRoles('unknown'));
	}
}
