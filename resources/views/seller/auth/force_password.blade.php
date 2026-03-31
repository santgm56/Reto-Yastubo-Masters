@extends('layouts.craft')

@section('title', 'Actualizar contrasena')
@section('shell_mode', 'standalone')

@push('css')
  <style>
    .seller-password-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 18px;
      background:
        radial-gradient(920px 420px at -10% -10%, rgba(27, 119, 180, 0.15) 0%, transparent 60%),
        radial-gradient(880px 480px at 110% 10%, rgba(42, 201, 171, 0.12) 0%, transparent 56%),
        linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
      font-family: 'Poppins', 'Segoe UI', sans-serif;
    }

    .seller-password-shell {
      width: min(1080px, 100%);
      display: grid;
      gap: 18px;
      grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
      align-items: stretch;
    }

    .seller-password-hero,
    .seller-password-card {
      border-radius: 28px;
      border: 1px solid #e5e8f1;
      box-shadow: 0 20px 48px rgba(21, 37, 63, 0.08);
    }

    .seller-password-hero {
      padding: 28px;
      background:
        radial-gradient(280px 180px at 88% 18%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
        linear-gradient(135deg, #7447f7 0%, #6c46f4 32%, #8554ff 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      position: relative;
    }

    .seller-password-kicker {
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.78);
      margin-bottom: 8px;
    }

    .seller-password-title {
      font-size: clamp(1.9rem, 4vw, 2.7rem);
      line-height: 0.98;
      font-weight: 700;
      color: #e3ffb7;
      margin-bottom: 10px;
    }

    .seller-password-copy {
      max-width: 28rem;
      color: rgba(255, 255, 255, 0.84);
      font-size: 0.88rem;
      line-height: 1.5;
    }

    .seller-password-chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 22px;
    }

    .seller-password-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.38rem 0.78rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .seller-password-side-note {
      margin-top: 28px;
      border-radius: 18px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.12);
      padding: 16px 18px;
      color: rgba(255, 255, 255, 0.78);
      font-size: 0.8rem;
      line-height: 1.45;
    }

    .seller-password-card {
      background: #ffffff;
      padding: 28px;
    }

    .seller-password-card-title {
      color: #2f3651;
      font-size: 1.35rem;
      line-height: 1.1;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .seller-password-card-copy {
      color: #6f7b90;
      font-size: 0.84rem;
      line-height: 1.45;
      margin-bottom: 20px;
    }

    .seller-password-label {
      display: block;
      margin-bottom: 6px;
      color: #6f7b90;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .seller-password-input {
      min-height: 48px;
      border-radius: 16px;
      border-color: #e5e8f1;
      background: #fbfcfe;
    }

    .seller-password-input:focus {
      border-color: #c7b7ff;
      box-shadow: 0 0 0 0.2rem rgba(108, 70, 244, 0.12);
    }

    .seller-password-submit {
      min-height: 44px;
      border-radius: 999px;
      border: 1px solid #2f3651;
      background: #2f3651;
      color: #ffffff;
      font-weight: 700;
    }

    .seller-password-logout {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 40px;
      padding: 0 16px;
      border-radius: 999px;
      background: #f4f6fa;
      color: #67748b;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
    }

    .seller-password-feedback {
      display: block;
    }

    @media (max-width: 991.98px) {
      .seller-password-shell {
        grid-template-columns: 1fr;
      }
    }
  </style>
@endpush

@section('content')
  <div class="seller-password-page">
    <div class="seller-password-shell">
      <section class="seller-password-hero">
        <div>
          <div class="seller-password-kicker">Seller security</div>
          <h1 class="seller-password-title">Actualiza tu contrasena para continuar en el canal seller</h1>
          <p class="seller-password-copy mb-0">
            Antes de continuar con dashboard, pagos o emision, debes registrar una contrasena nueva y segura para esta cuenta.
          </p>

          <div class="seller-password-chip-row">
            <span class="seller-password-chip">Acceso seguro</span>
            <span class="seller-password-chip">Canal seller</span>
            <span class="seller-password-chip">Bloqueo preventivo</span>
          </div>
        </div>

        <div class="seller-password-side-note">
          Esta validacion protege el acceso inicial y evita que la cuenta opere con credenciales temporales.
        </div>
      </section>

      <section class="seller-password-card">
        <h2 class="seller-password-card-title">Debes actualizar tu contrasena</h2>
        <p class="seller-password-card-copy">
          Ingresa tu contrasena actual y define una nueva combinacion para habilitar el acceso completo.
        </p>

        @if (session('status'))
          <div class="alert alert-success mb-4">{{ session('status') }}</div>
        @endif

        <form method="POST" action="{{ route('seller.password.force.update') }}">
          @csrf

          <div class="mb-3">
            <label class="seller-password-label">Contrasena actual</label>
            <input type="password" name="current_password" class="form-control seller-password-input @error('current_password') is-invalid @enderror" required>
            @error('current_password')
              <div class="invalid-feedback seller-password-feedback">{{ $message }}</div>
            @enderror
          </div>

          <div class="mb-3">
            <label class="seller-password-label">Nueva contrasena</label>
            <input type="password" name="password" class="form-control seller-password-input @error('password') is-invalid @enderror" required>
            @error('password')
              <div class="invalid-feedback seller-password-feedback">{{ $message }}</div>
            @enderror
          </div>

          <div class="mb-4">
            <label class="seller-password-label">Confirmar nueva contrasena</label>
            <input type="password" name="password_confirmation" class="form-control seller-password-input" required>
          </div>

          <button class="btn seller-password-submit w-100" type="submit">Actualizar</button>
        </form>

        <div class="text-center mt-3">
          <a href="{{ route('seller.logout') }}" class="seller-password-logout" data-fastapi-logout="true">Cerrar sesion</a>
        </div>
      </section>
    </div>
  </div>
@endsection
