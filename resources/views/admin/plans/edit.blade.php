{{-- /resources/views/admin/plans/edit.blade.php --}}
@extends('layouts.craft')

@section('title', "Plan {$product->name} → Versión #{$planVersion->id}")

@section('content')
	<admin-plans-edit
		:initial-product='@json(['id' => $product->id])'
		:initial-plan-version='@json(['id' => $planVersion->id])'
	/>
@endsection
