<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => ['required','string','max:120'],
            'slug'        => ['nullable','string','max:160', Rule::unique('brands','slug')],
            'description' => ['nullable','string','max:2000'],
            'is_active'   => ['nullable','boolean'],
            'sort_order'  => ['nullable','integer','min:0','max:9999'],
            'logo'        => ['nullable','image','max:2048'], // 2MB
        ];
    }
}