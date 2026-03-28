@extends('layouts.craft')

@section('title', $title ?? 'Seller')

@section('content')
    <seller-dashboard-index
        section="{{ $section ?? 'dashboard' }}"
        summary-endpoint="/api/v1/seller/dashboard-summary"
        customers-endpoint="/api/v1/seller/customers"
        sales-endpoint="/api/v1/seller/sales"
    ></seller-dashboard-index>
@endsection
