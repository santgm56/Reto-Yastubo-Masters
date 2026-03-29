<?php

namespace App\Support;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class WebLogoutResponder
{
	public static function toLogin(Request $request, string $loginRouteName): RedirectResponse
	{
		$request->session()->invalidate();
		$request->session()->regenerateToken();

		return redirect()
			->route($loginRouteName)
			->withCookie(Cookie::forget('yastubo_access_token', '/'));
	}
}
