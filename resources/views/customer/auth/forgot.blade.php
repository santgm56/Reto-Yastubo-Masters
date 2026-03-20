@extends('admin.public')
@section('title','Recuperar contrasena')
@section('content')
@if(session('status'))
<div class="alert alert-success">{{ session('status') }}</div>
@endif

@if($errors->any())
<div class="alert alert-danger">{{ $errors->first() }}</div>
@endif

<form method="POST" action="{{ route('customer.password.email') }}">
    @csrf
    <div class="mb-10">
        <label class="form-label fs-6 fw-bold text-gray-900">Email</label>
        <input name="email" type="email" class="form-control form-control-lg form-control-solid" value="{{ old('email') }}" required>
    </div>
    <button class="btn btn-primary">Enviar enlace</button>
</form>
@endsection
