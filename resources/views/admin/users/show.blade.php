@extends('layouts.craft')
@section('title', 'Detalle de usuario')

@section('content')
    <admin-users-show-page :user-id='@json($user->id)'></admin-users-show-page>
@endsection
