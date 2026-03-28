<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        return view('seller.home', [
            'section' => 'dashboard',
            'title' => 'Seller Dashboard',
        ]);
    }

    public function customers()
    {
        return view('seller.home', [
            'section' => 'customers',
            'title' => 'Seller Customers',
        ]);
    }

    public function sales()
    {
        return view('seller.home', [
            'section' => 'sales',
            'title' => 'Seller Sales',
        ]);
    }

    public function issuance()
    {
        return view('seller.issuance');
    }

    public function payments()
    {
        return view('seller.payments');
    }
}
