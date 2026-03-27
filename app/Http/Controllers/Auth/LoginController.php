<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\Realm;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;


class LoginController extends Controller
{

	public function showLogin(Request $request)
	{
		$realm = Realm::current($request);
		return view("{$realm}.auth.login");
	}

	public function logout(Request $request)
	{
		$realm = Realm::current();

		if ($realm)
		{
			/** @var StatefulGuard $guard */
			$guard = Auth::guard($realm);
			$guard->logout();
		}
		else
		{
			// fallback: desloguear todos los realms conocidos
			/** @var StatefulGuard $adminGuard */
			$adminGuard = Auth::guard(Realm::ADMIN);
			$adminGuard->logout();

			/** @var StatefulGuard $sellerGuard */
			$sellerGuard = Auth::guard(Realm::SELLER);
			$sellerGuard->logout();

			/** @var StatefulGuard $customerGuard */
			$customerGuard = Auth::guard(Realm::CUSTOMER);
			$customerGuard->logout();
		}

		$request->session()->invalidate();
		$request->session()->regenerateToken();

		$loginRoute = $realm ? "{$realm}.login" : 'home';

		return redirect()
			->route($loginRoute)
			->withCookie(Cookie::forget('yastubo_access_token', '/'));
	}
}
