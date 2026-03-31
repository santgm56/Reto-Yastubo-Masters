@extends('layouts.craft')

@section('title', 'Seller Pagos')
@section('shell_mode', 'standalone')

@section('content')
    <admin-operations-payments-board
        payments-endpoint="/api/v1/payments"
        checkout-endpoint="/api/v1/payments/checkout"
        subscribe-endpoint="/api/v1/payments/subscribe"
        retry-route-template="/api/v1/payments/__ID__/retry"
    ></admin-operations-payments-board>
@endsection
