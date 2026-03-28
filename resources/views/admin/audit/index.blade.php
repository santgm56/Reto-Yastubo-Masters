@extends('layouts.craft')

@section('title', 'Auditoria')

@section('content')
    <admin-audit-index
        endpoint="/api/v1/admin/audit"
    ></admin-audit-index>
@endsection
