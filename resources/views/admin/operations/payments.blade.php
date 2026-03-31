@extends('layouts.craft')

@section('shell_mode', 'standalone')
@section('title', 'Pagos')

@section('content')
    <admin-operations-payments-board
        payments-endpoint="/api/v1/payments"
        checkout-endpoint="/api/v1/payments/checkout"
        subscribe-endpoint="/api/v1/payments/subscribe"
        retry-route-template="/api/v1/payments/__ID__/retry"
    ></admin-operations-payments-board>
@endsection
