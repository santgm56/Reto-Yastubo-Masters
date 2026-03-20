@php
    $branding = \App\Services\Config\Config::getBrandingWeb();
    $initialSection = $section ?? 'dashboard';
    $user = auth('customer')->user();
    $displayName = $user?->name ?? $user?->email ?? 'Cliente';
@endphp
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Portal Cliente | {{ config('company.short_name') }}</title>

    @routes

    <link rel="icon" href="{{ $branding['favicon']?->url() }}" type="image/x-icon" media="(prefers-color-scheme: light)">
    <link rel="icon" href="{{ $branding['favicon_claro']?->url() }}" type="image/x-icon" media="(prefers-color-scheme: dark)">

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
    <link href="{{ url('assets/plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ url('assets/css/style.bundle.css') }}" rel="stylesheet" type="text/css" />
    @vite(['resources/css/app.css'])
</head>
<body class="bg-light">
    <div id="app">
        <customer-portal-shell
            initial-section="{{ $initialSection }}"
            user-name="{{ e($displayName) }}"
            support-label="Soporte"
        ></customer-portal-shell>
    </div>

    @vite(['resources/js/app.js'])
    <script src="{{ url('assets/plugins/global/plugins.bundle.js') }}"></script>
    <script src="{{ url('assets/js/scripts.bundle.js') }}"></script>
</body>
</html>
