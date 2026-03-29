@php
    $branding = \App\Services\Config\Config::getBrandingWeb();
    $initialSection = $section ?? 'dashboard';
    $customerShellContext = request()->attributes->get('customer_shell_context', []);
    $fallbackUser = auth('customer')->user();
    $displayName = (string) ($customerShellContext['name'] ?? $fallbackUser?->name ?? $fallbackUser?->email ?? 'Cliente');
    $displayEmail = (string) ($customerShellContext['email'] ?? $fallbackUser?->email ?? '');
    $displayRole = (string) ($customerShellContext['role'] ?? 'CUSTOMER');
    $displayStatus = (string) ($customerShellContext['status'] ?? 'Autenticado');
    $supportAddress = config('mail.support_address');
    $supportUrl = $supportAddress ? ('mailto:' . $supportAddress) : '';
    $userErrorMessage = (string) ($customerShellContext['error_message'] ?? session('customer_profile_error', ''));
    $userPermissions = array_key_exists('permissions', $customerShellContext)
        ? $customerShellContext['permissions']
        : null;
    $abilities = [];

    foreach ($userPermissions ?? [] as $permissionName) {
        $abilities[$permissionName] = true;
    }

    $runtimeConfig = [
        'autosaveDelayMs' => config('gfa.autosave_delay_ms', 800),
        'perPageShort' => config('per_page.short', 5),
        'perPageMedium' => config('per_page.medium', 10),
        'perPageLarge' => config('per_page.large', 15),
        'apiBaseUrl' => config('services.fastapi.base_url', ''),
        'apiCutoverEnabled' => (bool) config('services.fastapi.cutover_enabled', false),
        'abilities' => $abilities,
    ];

    $frontendContext = [
        'channel' => 'customer',
        'role' => $displayRole,
        'userId' => $customerShellContext['id'] ?? $fallbackUser?->id,
    ];
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

    <script id="customer-runtime-config" type="application/json">@json($runtimeConfig)</script>
    <script id="customer-frontend-context" type="application/json">@json($frontendContext)</script>
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

        window.__RUNTIME_CONFIG__ = Object.assign(
            {},
            window.__RUNTIME_CONFIG__ || {},
            readJsonScript('customer-runtime-config')
        );

        window.__FRONTEND_CONTEXT__ = Object.assign(
            {},
            window.__FRONTEND_CONTEXT__ || {},
            readJsonScript('customer-frontend-context')
        );
    </script>

    @vite(['resources/css/app.css'])
</head>
<body class="bg-light">
    <div id="app">
        <customer-portal-shell
            :initial-section='@json($initialSection)'
            user-name="{{ e($displayName) }}"
            user-email="{{ e($displayEmail) }}"
            user-role="{{ e($displayRole) }}"
            :user-permissions='@json($userPermissions)'
            user-status="{{ e($displayStatus) }}"
            user-error-message="{{ e($userErrorMessage) }}"
            support-label="Soporte"
            support-url="{{ e($supportUrl) }}"
        ></customer-portal-shell>
    </div>

    @vite(['resources/js/app.js'])
    <script src="{{ url('assets/plugins/global/plugins.bundle.js') }}"></script>
    <script src="{{ url('assets/js/scripts.bundle.js') }}"></script>
</body>
</html>
