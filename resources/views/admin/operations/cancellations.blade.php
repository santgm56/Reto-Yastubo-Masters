@extends('layouts.craft')

@section('title', 'Anulaciones')

@section('content')
    <admin-operations-cancellations-board
        list-endpoint="/api/v1/cancellations"
        create-endpoint="/api/v1/cancellations"
    ></admin-operations-cancellations-board>
@endsection
