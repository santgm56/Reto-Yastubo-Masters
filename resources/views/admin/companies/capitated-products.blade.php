@extends('layouts.craft')

@section('title', $company['name'])

@section('content')
    <admin-companies-capitated-products
        :company='@json($company)'
        :initial-products='@json($products)'
        :product-types='@json($productTypes)'
    ></admin-companies-capitated-products>
@endsection
