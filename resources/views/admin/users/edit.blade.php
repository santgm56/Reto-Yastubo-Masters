@extends('layouts.craft')
@section('title', 'Editar usuario')

@section('content')
    <admin-users-form-page mode="edit" :user-id='@json($user->id)'></admin-users-form-page>
@endsection
