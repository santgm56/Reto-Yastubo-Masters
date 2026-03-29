@php
$branding = \App\Services\Config\Config::getBrandingWeb();
$fastApiBaseUrl = rtrim((string) config('services.fastapi.base_url', ''), '/');
$impersonationMeta = null;
$impersonationMetaCookie = (string) request()->cookie('yastubo_impersonation_meta', '');

if ($impersonationMetaCookie !== '') {
	$normalizedMeta = strtr($impersonationMetaCookie, '-_', '+/');
	$paddingLength = strlen($normalizedMeta) % 4;
	if ($paddingLength > 0) {
		$normalizedMeta .= str_repeat('=', 4 - $paddingLength);
	}

	$decodedMeta = base64_decode($normalizedMeta, true);
	if ($decodedMeta !== false) {
		$parsedMeta = json_decode($decodedMeta, true);
		if (is_array($parsedMeta)) {
			$impersonationMeta = $parsedMeta;
		}
	}
}
@endphp
<!--begin::Header-->
<div id="kt_header" class="header" data-kt-sticky="true" data-kt-sticky-name="header" data-kt-sticky-offset="{default: '200px', lg: '300px'}">
	<!--begin::Container-->
	<div class="container-fluid d-flex align-items-stretch justify-content-between">
		<!--begin::Logo bar-->
		<div class="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
			<!--begin::Aside Toggle-->
			<div class="d-flex align-items-center d-lg-none">
				<div class="btn btn-icon btn-active-color-primary ms-n2 me-1" id="kt_aside_toggle">
					<i class="ki-duotone ki-abstract-14 fs-1">
						<span class="path1"></span>
						<span class="path2"></span>
					</i>
				</div>
			</div>
			<!--end::Aside Toggle-->
			<!--begin::Logo-->
			<a href="{{ route(request()->routeIs('seller.*') ? 'seller.home' : 'admin.home') }}" class="d-lg-none branding-logo-sidebar">
				<img alt="{{ config('company.short_name') }}" src="{{ $branding['logo_header']->url() }}" class="mh-40px" />
			</a>
			<!--end::Logo-->
		</div>
		<!--end::Logo bar-->
		<!--begin::Topbar-->
		<div class="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
			<!--begin::Search-->
			<div class="d-flex align-items-stretch me-1">

			</div>
			<!--end::Search-->
			<!--begin::Toolbar wrapper-->
				@include('partials.menus.user-menu')
			<!--end::Toolbar wrapper-->
		</div>
		<!--end::Topbar-->
	</div>
	<!--end::Container-->
</div>
<!--end::Header-->
@if (($impersonationMeta['target_email'] ?? '') !== '')
    <div class="alert alert-warning d-flex align-items-center rounded-0 mb-0" role="alert" style="z-index:1070;">
        <div class="flex-grow-1">
            <strong>Impersonación activa:</strong>
			estás usando la sesión de <code>{{ $impersonationMeta['target_email'] }}</code>.
        </div>
		<form method="POST" action="{{ ($fastApiBaseUrl !== '' ? $fastApiBaseUrl : '') . '/api/v1/auth/impersonation/stop' }}" class="ms-3">
            <button type="submit" class="btn btn-sm btn-dark">Salir de impersonación</button>
        </form>
    </div>
@endif
