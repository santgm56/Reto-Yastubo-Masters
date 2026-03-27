@if(env_any('MODULE_USERS','MODULE_REGALIAS'))
	<!--begin:Menu item-->
	<div class="menu-item pt-5">
		<!--begin:Menu content-->
		<div class="menu-content">
			<span class="fw-bold text-muted text-uppercase fs-7">Administración</span>
		</div>
		<!--end:Menu content-->
	</div>
	<!--end:Menu item-->

	@if(env('MODULE_USERS', false))
	<!--begin:Menu item-->
	<div class="menu-item">
		<!--begin:Menu link-->
		<a class="menu-link" href="{{ route('admin.users.index') }}">
			<span class="menu-icon">
				<i class="ki-duotone ki-user fs-2">
					<span class="path1"></span>
					<span class="path2"></span>
				</i>
			</span>
			<span class="menu-title">Usuarios</span>
		</a>
		<!--end:Menu link-->
	</div>
	<!--end:Menu item-->
	@endif

	<!--begin:Menu item-->
	<div class="menu-item">
		<!--begin:Menu link-->
		<a class="menu-link" href="{{ route('admin.audit.index') }}">
			<span class="menu-icon">
				<i class="bi bi-journal-text"></i>
			</span>
			<span class="menu-title">Auditoria</span>
		</a>
		<!--end:Menu link-->
	</div>
	<!--end:Menu item-->

	<!--begin:Menu item-->
	<div class="menu-item">
		<!--begin:Menu link-->
		<a class="menu-link" href="{{ route('admin.issuance.new') }}">
			<span class="menu-icon">
				<i class="bi bi-diagram-3"></i>
			</span>
			<span class="menu-title">Emision asistida</span>
		</a>
		<!--end:Menu link-->
	</div>
	<!--end:Menu item-->

	<!--begin:Menu item-->
	<div class="menu-item">
		<!--begin:Menu link-->
		<a class="menu-link" href="{{ route('admin.payments.index') }}">
			<span class="menu-icon">
				<i class="bi bi-credit-card"></i>
			</span>
			<span class="menu-title">Pagos</span>
		</a>
		<!--end:Menu link-->
	</div>
	<!--end:Menu item-->

	<!--begin:Menu item-->
	<div class="menu-item">
		<!--begin:Menu link-->
		<a class="menu-link" href="{{ route('admin.cancellations.index') }}">
			<span class="menu-icon">
				<i class="bi bi-x-octagon"></i>
			</span>
			<span class="menu-title">Anulaciones</span>
		</a>
		<!--end:Menu link-->
	</div>
	<!--end:Menu item-->


	@if(env('MODULE_REGALIAS', false))
		@canany('regalia.users.read','regalia.users.edit')
		<!--begin:Menu item-->
		<div class="menu-item">
			<!--begin:Menu link-->
			<a class="menu-link" href="{{ route('admin.regalias.index') }}">
				<span class="menu-icon">
					<i class="bi bi-currency-dollar"></i>
				</span>
				<span class="menu-title">Regalias</span>
			</a>
			<!--end:Menu link-->
		</div>
		<!--end:Menu item-->
		@endcanany
	@endif





@endif