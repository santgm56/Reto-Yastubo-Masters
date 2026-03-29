@extends('layouts.craft')

@section('title', 'Plan ' . $product->name)

@section('content')
	<admin-plans-index />
@endsection
