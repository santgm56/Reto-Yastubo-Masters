<?php
// routes/web.php
use App\Support\Realm;
use Illuminate\Support\Facades\Route;

Route::view('/', 'public.home')->name('home');

foreach (glob(__DIR__ . '/public/*.php') as $filename)
{
	require_once $filename;
}

$loadRealmRouteFiles = static function (string $pattern): void
{
	foreach (glob($pattern) as $filename)
	{
		require_once $filename;
	}
};

$realmRouteGroups = [
	[
		'prefix' => Realm::ADMIN,
		'name' => Realm::ADMIN . '.',
		'auth_middleware' => 'admin',
		'public_middleware' => ['fastapi.guest.redirect'],
	],
	[
		'prefix' => Realm::SELLER,
		'name' => Realm::SELLER . '.',
		'auth_middleware' => 'seller',
		'public_middleware' => ['fastapi.guest.redirect'],
	],
	[
		'prefix' => Realm::CUSTOMER,
		'name' => Realm::CUSTOMER . '.',
		'auth_middleware' => 'customer',
		'public_middleware' => ['fastapi.guest.redirect'],
	],
];

foreach ($realmRouteGroups as $group)
{
	$prefix = $group['prefix'];
	$name = $group['name'];
	$authMiddleware = $group['auth_middleware'];
	$publicMiddleware = $group['public_middleware'];

	Route::middleware($authMiddleware)
		->prefix($prefix)
		->name($name)
		->group(function () use ($loadRealmRouteFiles, $prefix)
		{
			$loadRealmRouteFiles(__DIR__ . "/{$prefix}/auth/*.php");
		});

	Route::middleware($publicMiddleware)
		->prefix($prefix)
		->name($name)
		->group(function () use ($loadRealmRouteFiles, $prefix)
		{
			$loadRealmRouteFiles(__DIR__ . "/{$prefix}/public/*.php");
		});
}

// Fallback genérico
Route::fallback(fn() => abort(404));

