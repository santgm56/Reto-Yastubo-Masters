@extends('admin.public')
@section('title','Contrasena actualizada')

@section('content')
<div class="card shadow-sm">
  <div class="card-body p-10 text-center">
    <h3 class="mb-4">Contrasena actualizada</h3>
    @if(!empty($status))
    <div class="alert alert-success">{{ $status }}</div>
    @else
    <div class="alert alert-success">Tu contrasena fue cambiada correctamente.</div>
    @endif

    <p class="mb-6">Seras redirigido al inicio de sesion en unos segundos.</p>
    <a href="{{ $loginUrl }}" class="btn btn-primary">Ir al login ahora</a>
  </div>
</div>

<script>
  setTimeout(function(){ window.location.href = '{{ $loginUrl }}'; }, 4000);
</script>
@endsection
