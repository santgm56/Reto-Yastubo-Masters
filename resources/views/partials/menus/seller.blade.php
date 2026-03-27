<!--begin:Menu item-->
<div class="menu-item pt-5">
    <div class="menu-content">
        <span class="fw-bold text-muted text-uppercase fs-7">Seller</span>
    </div>
</div>
<!--end:Menu item-->

<div class="menu-item">
    <a class="menu-link" href="{{ route('seller.dashboard') }}">
        <span class="menu-icon"><i class="ki-duotone ki-home fs-2"></i></span>
        <span class="menu-title">Dashboard</span>
    </a>
</div>

<div class="menu-item">
    <a class="menu-link" href="{{ route('seller.customers') }}">
        <span class="menu-icon"><i class="bi bi-people"></i></span>
        <span class="menu-title">Customers</span>
    </a>
</div>

<div class="menu-item">
    <a class="menu-link" href="{{ route('seller.sales') }}">
        <span class="menu-icon"><i class="bi bi-graph-up-arrow"></i></span>
        <span class="menu-title">Sales</span>
    </a>
</div>

<div class="menu-item">
    <a class="menu-link" href="{{ route('seller.issuance.new') }}">
        <span class="menu-icon"><i class="bi bi-diagram-3"></i></span>
        <span class="menu-title">Issuance</span>
    </a>
</div>

<div class="menu-item">
    <a class="menu-link" href="{{ route('seller.payments.index') }}">
        <span class="menu-icon"><i class="bi bi-credit-card"></i></span>
        <span class="menu-title">Payments</span>
    </a>
</div>
