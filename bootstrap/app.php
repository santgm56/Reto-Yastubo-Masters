<?php

use App\Http\Middleware\FastApiCustomerShellContext;
use App\Http\Middleware\FastApiGuestRedirect;
use App\Http\Middleware\FastApiSellerShellContext;
use App\Http\Middleware\FastApiTokenRealmAuth;
use App\Support\Realm;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$builder = Application::configure(basePath: dirname(__DIR__))
	->withRouting(
		web: __DIR__ . '/../routes/web.php', // público genérico
		api: __DIR__ . '/../routes/api_generic.php', // API / webhooks (usa 'api' middleware y prefijo /api)
		commands: __DIR__ . '/../routes/console.php',
		health: '/up'
	)
	->withMiddleware(function (Middleware $middleware)
	{
		// Aliases de middlewares personalizados
		$middleware->alias([
			'fastapi.customer.shell.context' => FastApiCustomerShellContext::class,
			'fastapi.guest.redirect' => FastApiGuestRedirect::class,
			'fastapi.seller.shell.context' => FastApiSellerShellContext::class,
			'fastapi.token.realm.auth' => FastApiTokenRealmAuth::class,
		]);

		// Prioridad: lo que esté antes corre antes, sin importar el orden en la ruta.
		$middleware->priority([
			// (conserva los que ya tengas priorizados; aquí solo muestro los relevantes)
			\Illuminate\Session\Middleware\StartSession::class,
			\Illuminate\View\Middleware\ShareErrorsFromSession::class,
			FastApiTokenRealmAuth::class,
		]);

		// Grupos reutilizables por canal.
		foreach (Realm::guards() as $realm => $guard)
		{
			$group = [
				'fastapi.token.realm.auth',
			];

			if ($guard === 'customer') {
				array_splice($group, 2, 0, ['fastapi.customer.shell.context']);
			}

			if ($guard === 'seller') {
				array_splice($group, 2, 0, ['fastapi.seller.shell.context']);
			}

			$middleware->group($guard, $group);
		}

	})
	->withExceptions(function (Exceptions $exceptions)
	{
		// Personaliza manejo de excepciones aquí si lo necesitas.
	});

$app = $builder->create();

/**
 * Cambiar el storage path completo (storage/, logs, cache, sessions, etc.)
 * desde .env usando una ruta RELATIVA a la raíz del proyecto.
 *
 * Se ejecuta justo después de cargar .env y antes de cargar config.
 */
$app->afterBootstrapping(LoadEnvironmentVariables::class, function (Application $app)
{
	$new_route = env('APP_STORAGE_DIR', null);
	if(!empty($new_route))
	{
		$relative = trim((string) $new_route, "/\\");
		$app->useStoragePath($app->basePath($relative));
	}
});

return $app;
