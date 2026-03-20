@extends('admin.public')
@section('title','Link invalido')

@section('content')
<div class="card shadow-sm">
  <div class="card-body p-10 text-center">
    <h3 class="mb-4">No pudimos continuar</h3>
    <div class="alert alert-danger mb-6">
      {{ $message ?? 'El enlace para restablecer la contrasena no es valido o ha expirado.' }}
    </div>

    <p class="mb-6">Seras redirigido al inicio de sesion en unos segundos.</p>
  </div>
</div>

<script>
  setTimeout(function(){ window.location.href = '{{ $loginUrl }}'; }, 10000);
</script>
@endsection
