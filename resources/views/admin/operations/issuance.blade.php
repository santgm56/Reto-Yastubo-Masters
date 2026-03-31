@extends('layouts.craft')

@section('shell_mode', 'standalone')
@section('title', 'Emision asistida')

@section('content')
    <admin-operations-issuance-wizard
        quote-endpoint="/api/v1/issuances/quote"
        issuance-endpoint="/api/v1/issuances"
        issuance-pdf-endpoint-template="/api/v1/issuances/__ISSUANCE_ID__/pdf"
        issuance-send-email-endpoint-template="/api/v1/issuances/__ISSUANCE_ID__/send-email"
    ></admin-operations-issuance-wizard>
@endsection
