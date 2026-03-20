@extends('admin.public')
@section('title','Login cliente')
@section('content')

@if($errors->any())
<div class="alert alert-danger">{{ $errors->first() }}</div>
@endif

<form class="form w-100" method="POST" action="{{ route('customer.login.do') }}">
	@csrf
	<div class="mb-10">
		<label class="form-label fs-6 fw-bold text-gray-900">Email</label>
		<input name="email" type="email" class="form-control form-control-lg form-control-solid" value="{{ old('email') }}" required autofocus>
	</div>
	<div class="mb-10">
		<label class="form-label fs-6 fw-bold text-gray-900">Contrasena</label>
		<input name="password" type="password" class="form-control form-control-lg form-control-solid" required>
	</div>
	<div class="text-center">
		<button class="btn btn-lg btn-primary w-100 mb-5" type="submit">Entrar</button>
		<br/>
		<a href="{{ route('customer.password.request') }}">Olvidaste tu contrasena?</a>
	</div>
</form>
@endsection
