@extends('admin.public')

@section('title', 'Portales disponibles')

@section('content')
	@php
		$portals = [
			[
				'label' => 'Customer',
				'title' => 'Portal del cliente',
				'description' => 'Consulta estado, pagos, beneficiarios y operaciones del canal customer.',
				'route' => route('customer.login'),
				'cta' => 'Entrar a customer',
				'badge' => 'Customer',
				'accent' => 'primary',
			],
			[
				'label' => 'Seller',
				'title' => 'Portal comercial',
				'description' => 'Accede al dashboard de seller, ventas, clientes y operaciones del canal comercial.',
				'route' => route('seller.login'),
				'cta' => 'Entrar a seller',
				'badge' => 'Seller',
				'accent' => 'success',
			],
			[
				'label' => 'Admin',
				'title' => 'Portal administrativo',
				'description' => 'Ingresa a configuracion, catalogos, ACL y modulos operativos ya validados en v2.0.',
				'route' => route('admin.login'),
				'cta' => 'Entrar a admin',
				'badge' => 'Admin',
				'accent' => 'dark',
			],
		];

		$fastApiBaseUrl = rtrim((string) config('services.fastapi.base_url', 'http://127.0.0.1:8001'), '/');
	@endphp

	<div class="mb-12 text-center">
		<div class="d-inline-flex align-items-center rounded-pill border border-gray-300 bg-light px-4 py-2 mb-5">
			<span class="bullet bullet-dot bg-success me-3"></span>
			<span class="fw-semibold text-gray-700">Entorno local activo</span>
		</div>
		<h1 class="text-gray-900 fs-2hx fw-bold mb-4">Selecciona el portal que quieres revisar</h1>
		<div class="text-gray-600 fs-5 mx-auto" style="max-width: 42rem;">
			La raiz ya no queda vacia. Desde aqui puedes entrar al canal que quieras inspeccionar mientras se aplican los cambios visuales.
		</div>
	</div>

	<div class="row g-7 mb-10">
		@foreach ($portals as $portal)
			<div class="col-xl-4 col-md-6">
				<a href="{{ $portal['route'] }}" class="card card-flush h-100 border border-gray-200 shadow-sm shadow-hover" style="text-decoration: none;">
					<div class="card-body d-flex flex-column justify-content-between p-8">
						<div>
							<div class="badge badge-light-{{ $portal['accent'] }} mb-5">{{ $portal['badge'] }}</div>
							<div class="text-gray-900 fs-2 fw-bold mb-3">{{ $portal['title'] }}</div>
							<div class="text-gray-600 fs-6 lh-lg">{{ $portal['description'] }}</div>
						</div>
						<div class="d-flex align-items-center justify-content-between mt-8 pt-6 border-top border-gray-200">
							<span class="text-{{ $portal['accent'] }} fw-bold fs-6">{{ $portal['cta'] }}</span>
							<span class="svg-icon svg-icon-2 text-{{ $portal['accent'] }}">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8 5L15 12L8 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</span>
						</div>
					</div>
				</a>
			</div>
		@endforeach
	</div>

	<div class="notice d-flex rounded border border-dashed border-gray-300 bg-light-primary p-6">
		<div class="d-flex flex-stack flex-grow-1 flex-wrap gap-4">
			<div>
				<div class="fw-bold text-gray-900 mb-1">Estado del entorno de desarrollo</div>
				<div class="text-gray-700 fs-6">
					Frontend en <span class="fw-semibold">http://127.0.0.1:8000</span>, assets en <span class="fw-semibold">http://127.0.0.1:5173</span> y API en <span class="fw-semibold">{{ $fastApiBaseUrl }}</span>.
				</div>
			</div>
			<div class="d-flex flex-wrap gap-3">
				<a href="http://127.0.0.1:5173" class="btn btn-sm btn-light-primary" target="_blank" rel="noreferrer">Abrir Vite</a>
				<a href="{{ $fastApiBaseUrl }}/docs" class="btn btn-sm btn-primary" target="_blank" rel="noreferrer">Abrir API docs</a>
			</div>
		</div>
	</div>
@endsection
