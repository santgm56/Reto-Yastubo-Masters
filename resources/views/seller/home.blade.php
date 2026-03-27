@extends('layouts.craft')

@section('title', $title ?? 'Seller')

@section('content')
    <seller-dashboard-index
        section="{{ $section ?? 'dashboard' }}"
        summary-endpoint="{{ route('seller.api.dashboard-summary') }}"
        customers-endpoint="{{ route('seller.api.customers') }}"
        sales-endpoint="{{ route('seller.api.sales') }}"
    ></seller-dashboard-index>
@endsection
