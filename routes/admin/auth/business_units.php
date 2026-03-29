<?php
//routes/admin/auth/business_units.php
use App\Http\Controllers\Admin\BusinessUnitController;
use Illuminate\Support\Facades\Route;

// Prefijo /admin para las rutas, prefijo .admin para los nombres, middleware de autenticación/realm heredado
Route::prefix('business-units')->name('business-units.')->group(function ()
{
	// Vistas (listas de raíces)
	Route::get('consolidators', [BusinessUnitController::class, 'indexConsolidators'])->name('consolidators.index');
	Route::get('offices', [BusinessUnitController::class, 'indexOffices'])->name('offices.index');
	Route::get('freelancers', [BusinessUnitController::class, 'indexFreelancers'])->name('freelancers.index');

	// Vista: unidad (acceso por membresía o global)
	Route::get('{unit}', [BusinessUnitController::class, 'show'])->name('show');

});
