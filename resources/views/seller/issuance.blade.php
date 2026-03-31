@extends('layouts.craft')

@section('title', 'Seller Emision')
@section('shell_mode', 'standalone')

@section('content')
    <admin-operations-issuance-wizard
        quote-endpoint="/api/v1/issuances/quote"
        issuance-endpoint="/api/v1/issuances"
    ></admin-operations-issuance-wizard>
@endsection
