@extends('admin.public')
@section('title','Login seller')
@section('content')

	@if($errors->any())
	<div class="alert alert-danger">{{ $errors->first() }}</div>
	<script>
		window.dispatchEvent(new CustomEvent('app-telemetry', {
			detail: {
				eventName: 'yastubo.frontend.login_failed',
				timestamp: new Date().toISOString(),
				request_id: '',
				channel: 'seller',
				role: 'ANON',
				user_id: '',
				outcome: 'error',
				entity_id: '',
				meta: {
					module: 'auth',
					reason: 'invalid_credentials',
				},
			},
		}));
	</script>
	@endif
	<form class="form w-100" method="GET" action="{{ route('seller.login') }}" data-fastapi-login="true" data-login-channel="seller" data-login-redirect="/seller/dashboard">
		<div data-fastapi-login-error></div>
		<div class="mb-10">
			<label class="form-label fs-6 fw-bold text-gray-900">Email</label>
			<input name="email" type="email" class="form-control form-control-lg form-control-solid" required autofocus>
		</div>
		<div class="mb-10">
			<label class="orm-label fs-6 fw-bold text-gray-900">Contrasena</label>
			<input name="password" type="password" class="form-control form-control-lg form-control-solid" required>
		</div>
		<div class="text-center">
			<button class="btn btn-lg btn-primary w-100 mb-5" type="submit">Entrar</button>
		</div>
	</form>
@endsection
