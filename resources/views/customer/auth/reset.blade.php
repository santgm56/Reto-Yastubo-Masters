@extends('admin.public')
@section('title','Restablecer contrasena')

@section('content')
@if(session('status'))
<div class="alert alert-success">{{ session('status') }}</div>
@endif

@if($errors->any())
<div class="alert alert-danger">{{ $errors->first() }}</div>
@endif

<form method="POST" action="{{ route('customer.password.update') }}">
    @csrf
    <input type="hidden" name="token" value="{{ $token }}">
    <input type="hidden" name="email" value="{{ $email }}">

    <div class="mb-10">
        <label class="form-label fs-6 fw-bold text-gray-900">Nueva contrasena</label>
        <input name="password" type="password" class="form-control form-control-lg form-control-solid" required autocomplete="new-password">
    </div>

    <div class="mb-10">
        <label class="form-label fs-6 fw-bold text-gray-900">Confirmar contrasena</label>
        <input name="password_confirmation" type="password" class="form-control form-control-lg form-control-solid" required autocomplete="new-password">
    </div>

    <button class="btn btn-lg btn-primary w-100" type="submit">Actualizar</button>
</form>
@endsection
