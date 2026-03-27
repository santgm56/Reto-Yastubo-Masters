<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

class OperationsController extends Controller
{
    public function issuance()
    {
        return view('admin.operations.issuance');
    }

    public function payments()
    {
        return view('admin.operations.payments');
    }

    public function cancellations()
    {
        return view('admin.operations.cancellations');
    }
}
