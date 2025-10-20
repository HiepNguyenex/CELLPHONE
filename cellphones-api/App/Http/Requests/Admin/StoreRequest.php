<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // đã được chặn bằng middleware admin ở routes
    }

    public function rules(): array
    {
        return [
            'name'      => ['required','string','max:255'],
            'slug'      => ['nullable','string','max:255'],
            'city'      => ['required','string','max:50'],
            'address'   => ['nullable','string','max:500'],
            'phone'     => ['nullable','string','max:50'],
            'lat'       => ['nullable','numeric','between:-90,90'],
            'lng'       => ['nullable','numeric','between:-180,180'],
            'is_active' => ['sometimes','boolean'],
            'fast_2h'   => ['sometimes','boolean'],
        ];
    }
}
