<?php
//routes/admin/auth/business_units.php
use App\Models\BusinessUnit;
use App\Services\BusinessUnits\BusinessUnitPermissionResolver;
use App\Support\Breadcrumbs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Prefijo /admin para las rutas, prefijo .admin para los nombres, middleware de autenticación/realm heredado
Route::prefix('business-units')->name('business-units.')->group(function ()
{
	// Vistas (listas de raíces)
	Route::view('consolidators', 'admin.business_units.consolidators.index')->name('consolidators.index');
	Route::view('offices', 'admin.business_units.offices.index')->name('offices.index');
	Route::view('freelancers', 'admin.business_units.freelancers.index')->name('freelancers.index');

	// Vista: unidad (acceso por membresía o global)
	Route::get('{unit}', function (Request $request, BusinessUnit $unit, BusinessUnitPermissionResolver $resolver)
	{
		$user = $request->user('admin');
		abort_unless($user, 403);

		$chain = $unit->loadMissing('parent')->ancestorChain();

		foreach ($chain as $current)
		{
			$abilities = $resolver->forUnit($user, $current);

			$route = null;
			if ($abilities->can('can_access'))
			{
				$route = route('admin.business-units.show', $current);
			}

			Breadcrumbs::add($current->name, $route);
		}

		// La autorización real la hace el API resolver al cargar la data en Show.vue.
		return view('admin.business_units.show', [
			'unit' => $unit,
		]);
	})->name('show');

});
