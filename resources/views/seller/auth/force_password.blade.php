@extends('layouts.craft')

@section('title','Actualizar contrasena')

@section('content')
<div class="row justify-content-center">
  <div class="col-md-6 col-lg-5">
    <div class="card shadow-sm">
      <div class="card-body p-5">
        <h3 class="mb-4">Debes actualizar tu contrasena</h3>

        @if(session('status'))
          <div class="alert alert-success">{{ session('status') }}</div>
        @endif

        <form method="POST" action="{{ route('seller.password.force.update') }}">
          @csrf

          <div class="mb-3">
            <label class="form-label">Contrasena actual</label>
            <input type="password" name="current_password" class="form-control @error('current_password') is-invalid @enderror" required>
            @error('current_password')<div class="invalid-feedback">{{ $message }}</div>@enderror
          </div>

          <div class="mb-3">
            <label class="form-label">Nueva contrasena</label>
            <input type="password" name="password" class="form-control @error('password') is-invalid @enderror" required>
            @error('password')<div class="invalid-feedback">{{ $message }}</div>@enderror
          </div>

          <div class="mb-4">
            <label class="form-label">Confirmar nueva contrasena</label>
            <input type="password" name="password_confirmation" class="form-control" required>
          </div>

          <button class="btn btn-primary w-100" type="submit">Actualizar</button>
        </form>

        <div class="text-center mt-3">
          <a href="{{ route('seller.logout') }}" class="text-muted">Cerrar sesion</a>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
