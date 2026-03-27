@extends('layouts.craft')

@section('title', 'Auditoria')

@section('content')
    <admin-audit-index
        endpoint="{{ route('admin.audit.events') }}"
    ></admin-audit-index>
@endsection
