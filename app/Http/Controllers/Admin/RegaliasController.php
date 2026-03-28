<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RegaliasController extends Controller
{
    /**
     * Vista principal de Regalías (monta <admin-regalias-index>).
     *
     * GET /admin/regalias
     */
    public function index(Request $request)
    {
        return view('admin.regalias.index', [
            'title' => __('Regalías'),
        ]);
    }
}
