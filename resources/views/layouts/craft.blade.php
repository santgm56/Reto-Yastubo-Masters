{{-- resources/views/layouts/craft.blade.php --}}
{{-- Este es el template principal del REALM "admin" --}}
@php
    $branding = \App\Services\Config\Config::getBrandingWeb();
    $currentRealm = \App\Support\Realm::current(request());
    $sellerShellContext = $currentRealm === \App\Support\Realm::SELLER
        ? request()->attributes->get('seller_shell_context', [])
        : [];
@endphp
<!DOCTYPE html>
<html lang="{{ $currentLocale ?? app()->getLocale() }}">
<!--begin::Head-->

<head>
    <meta charset="utf-8" />
    <title>@yield('title') | {{ config('company.short_name') }}</title>
    @routes
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    {{-- DEBUG VERSION 2025-09-19 13:45 --}}
    <meta name="x-debug" content="craft-layout-2025-09-19-1345" />
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!--begin::Fonts(mandatory for all pages)-->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />

    <link rel="icon" href="{{ $branding['favicon']?->url() }}" type="image/x-icon"
        media="(prefers-color-scheme: light)">
    <link rel="icon" href="{{ $branding['favicon_claro']?->url() }}" type="image/x-icon"
        media="(prefers-color-scheme: dark)">
    <!--end::Fonts-->

    <!--begin::Global Stylesheets Bundle(mandatory for all pages)-->
    <link href="{{ url('assets/plugins/global/plugins.bundle.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ url('assets/css/style.bundle.css') }}" rel="stylesheet" type="text/css" />
    <!--end::Global Stylesheets Bundle-->

    @php
        // Locale efectivo (el mismo que resuelve BaseController)
        $locale = $currentLocale ?? app()->getLocale();

        $formatLocales = config('format.locales', []);
        $fallbackLocale = config('app.locale', 'es');

        $formatConfig =
            $formatLocales[$locale] ??
            ($formatLocales[$fallbackLocale] ?? [
                'number_locale' => 'es-ES',
                'date_format' => 'd/m/Y',
                'time_format' => 'H:i',
                'datetime_format' => 'd/m/Y H:i',
                'js_date_format' => 'dd/MM/yyyy',
            ]);

        // Permisos expuestos al frontend: 100% de los que tiene el usuario
        $user = auth()->user();
        $renderUserId = $sellerShellContext['id'] ?? $user?->id;
        $renderRole = (string) ($sellerShellContext['role'] ?? '');
        $renderPermissions = is_array($sellerShellContext['permissions'] ?? null)
            ? $sellerShellContext['permissions']
            : null;
        $abilities = [];

        if ($renderPermissions !== null) {
            foreach ($renderPermissions as $permissionName) {
                $abilities[(string) $permissionName] = true;
            }
        } elseif ($user) {
            // Spatie: devuelve todos los permisos efectivos (directos + por rol)
            $permissionNames = $user->getAllPermissions()->pluck('name')->all();

            foreach ($permissionNames as $permissionName) {
                $abilities[$permissionName] = true;
            }
        }

        $frontendRole = $renderRole !== ''
            ? $renderRole
            : ($user ? ($user->getRoleNames()->first() ?? 'ADMIN') : 'GUEST');
        $frontendChannel = $currentRealm === \App\Support\Realm::SELLER ? 'seller' : 'admin';

        $runtimeConfig = [
            'autosaveDelayMs' => config('gfa.autosave_delay_ms', 800),
            'perPageShort' => config('per_page.short', 5),
            'perPageMedium' => config('per_page.medium', 10),
            'perPageLarge' => config('per_page.large', 15),
            'apiBaseUrl' => config('services.fastapi.base_url', ''),
            'apiCutoverEnabled' => (bool) config('services.fastapi.cutover_enabled', false),
            'abilities' => $abilities,
        ];

        $frontendAppConfig = [
            'locale' => $locale,
            'numberLocale' => $formatConfig['number_locale'],
            'dateFormat' => $formatConfig['date_format'],
            'timeFormat' => $formatConfig['time_format'],
            'dateTimeFormat' => $formatConfig['datetime_format'],
            'jsDateFormat' => $formatConfig['js_date_format'],
        ];

        $frontendContext = [
            'channel' => $frontendChannel,
            'role' => $frontendRole,
            'userId' => $renderUserId,
        ];
    @endphp

    <script id="craft-runtime-config" type="application/json">@json($runtimeConfig)</script>
    <script id="craft-app-config" type="application/json">@json($frontendAppConfig)</script>
    <script id="craft-frontend-context" type="application/json">@json($frontendContext)</script>
    <script>
        const readJsonScript = function(scriptId) {
            const node = document.getElementById(scriptId);
            if (!node || !node.textContent) {
                return {};
            }

            try {
                return JSON.parse(node.textContent);
            } catch (error) {
                return {};
            }
        };

        // Config global de la app (sin fallbacks en los valores definidos aquí)
        window.__RUNTIME_CONFIG__ = Object.assign({}, window.__RUNTIME_CONFIG__ || {}, readJsonScript('craft-runtime-config'));

        window.appConfig = Object.assign(window.appConfig || {}, readJsonScript('craft-app-config'));

        window.__FRONTEND_CONTEXT__ = Object.assign({}, window.__FRONTEND_CONTEXT__ || {}, readJsonScript('craft-frontend-context'));

        // Helper global para traducir campos JSON {es: "...", en: "..."}
        // Sin fallbacks entre idiomas: si falta el locale actual, devuelve string vacío.
        window.translate = function(value) {
            if (value == null) return '';
            if (typeof value === 'string') return value;

            const loc = window.appConfig.locale;
            const translated = value[loc];

            return translated == null ? '' : String(translated);
        };

        // Helper global de permisos: usa __RUNTIME_CONFIG__.abilities
        // Si el permiso no existe o no está definido, devuelve false.
        window.can = function(ability) {
            if (!ability) {
                return false;
            }

            const runtime = window.__RUNTIME_CONFIG__ || {};
            const abilities = runtime.abilities || {};

            if (Object.prototype.hasOwnProperty.call(abilities, ability)) {
                return !!abilities[ability];
            }

            return false;
        };
    </script>

    @vite(['resources/css/app.css'])

    <link href="{{ url('branding/' . env('APP_BRANDING') . '/styles.css') }}" rel="stylesheet" type="text/css" />

    @stack('css')
    @stack('head_scripts')

    <script>
        // Frame-busting para evitar click-jacking
        if (window.top != window.self) {
            window.top.location.replace(window.self.location.href);
        }
    </script>
</head>
<!--end::Head-->

<!--begin::Body-->

<body id="kt_body"
    class="header-fixed header-tablet-and-mobile-fixed toolbar-enabled aside-fixed aside-default-enabled">
    <!--begin::Theme mode setup on page load-->
    <script>
        var defaultThemeMode = "light";
        var themeMode;
        if (document.documentElement) {
            if (document.documentElement.hasAttribute("data-bs-theme-mode")) {
                themeMode = document.documentElement.getAttribute("data-bs-theme-mode");
            } else {
                if (localStorage.getItem("data-bs-theme") !== null) {
                    themeMode = localStorage.getItem("data-bs-theme");
                } else {
                    themeMode = defaultThemeMode;
                }
            }
            if (themeMode === "system") {
                themeMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
            document.documentElement.setAttribute("data-bs-theme", themeMode);
        }
    </script>
    <!--end::Theme mode setup on page load-->

    <!--begin::Main-->
    <!--begin::Root-->
    <div class="d-flex flex-column flex-root">
        <!--begin::Page-->
        <div class="page d-flex flex-row flex-column-fluid">
            @include('partials.sidebar')

            <!--begin::Wrapper-->
            <div class="wrapper d-flex flex-column flex-row-fluid" id="kt_wrapper">
                @include('partials.header')
                @php
                    $items = \App\Support\Breadcrumbs::getAll();
                    $back = $items[count($items) - 2]['url'] ?? null;
                @endphp

                <!--begin::Content-->
                <div class="content fs-6 d-flex flex-column flex-column-fluid" id="app">
                    <!--begin::Toolbar-->
                    <div class="toolbar" id="kt_toolbar">
                        <div class="container-fluid d-flex flex-wrap flex-sm-nowrap justify-content-between">
                            <!--begin::Info-->
                            <div class="d-flex align-items-center gap-4">
                                @if (!empty($back))
                                    <div>
                                        <a href="{{ $back }}" title="Volver">
                                            <i class="bi bi-arrow-left-circle" style="font-size: 2rem;"></i>
                                        </a>
                                    </div>
                                @endif

                                <div>
                                    <!--begin::Title-->
                                    <h1 class="text-gray-900 fw-bold my-1 fs-2">
                                        @yield('title')
                                    </h1>
                                    <!--end::Title-->

                                    <!--begin::Breadcrumb-->
                                    <x-breadcrumbs />
                                    <!--end::Breadcrumb-->
                                </div>
                            </div>
                            <!--end::Info-->

                            <!--begin::Actions-->
                            <div>
                                @yield('actions')
                            </div>
                            <!--end::Actions-->
                        </div>
                    </div>
                    <!--end::Toolbar-->

                    <!--begin::Post-->
                    <div class="post fs-6 d-flex flex-column-fluid" id="kt_post">
                        <!--begin::Container-->
                        <div class="container-xxl">
                            @yield('content')
                        </div>
                        <!--end::Container-->
                    </div>
                    <!--end::Post-->
                </div>
                <!--end::Content-->

                <!--begin::Footer-->
                <div class="footer py-4 d-flex flex-lg-column" id="kt_footer">
                    <!--begin::Container-->
                    <div class="container-fluid d-flex flex-column flex-md-row flex-stack">
                        <!--begin::Copyright-->
                        <div class="text-gray-900 order-2 order-md-1">
                            <span class="text-muted fw-semibold me-2">2025&copy;</span>
                            {{ config('app.name') }}
                        </div>
                        <!--end::Copyright-->

                        <!--begin::Menu-->
                        <ul class="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
                            <li class="menu-item">
                                <a href="" class="menu-link px-2">Acerca de</a>
                            </li>
                            <li class="menu-item">
                                <a href="" class="menu-link px-2">Soporte</a>
                            </li>
                            <li class="menu-item">
                                <a href="" class="menu-link px-2">Condiciones de uso</a>
                            </li>
                        </ul>
                        <!--end::Menu-->
                    </div>
                    <!--end::Container-->
                </div>
                <!--end::Footer-->
            </div>
            <!--end::Wrapper-->
        </div>
        <!--end::Page-->
    </div>
    <!--end::Root-->
    <!--end::Main-->

    <!--begin::Scrolltop (fuera de Vue, no hace falta que sea reactivo)-->
    <div id="kt_scrolltop" class="scrolltop" data-kt-scrolltop="true">
        <i class="ki-duotone ki-arrow-up">
            <span class="path1"></span>
            <span class="path2"></span>
        </i>
    </div>
    <!--end::Scrolltop-->

    <!--begin::Javascript-->
    <!--begin::Global Javascript Bundle(mandatory for all pages)-->
    <script src="{{ url('assets/plugins/global/plugins.bundle.js') }}"></script>
    <script src="{{ url('assets/js/scripts.bundle.js') }}"></script>
    <!--end::Global Javascript Bundle-->

    {{-- Entrada principal de Vite para JS (incluye Vue y el auto-registro de componentes) --}}
    @vite(['resources/js/app.js'])

    {{-- Toasts globales de Bootstrap (fuera de Vue para que puedan manipular DOM libremente) --}}
    @include('partials.alerts')

    {{-- Scripts específicos de vistas (DataTables, cosas puntuales, etc.) --}}
    @stack('scripts')
    <!--end::Javascript-->
</body>
<!--end::Body-->

</html>
