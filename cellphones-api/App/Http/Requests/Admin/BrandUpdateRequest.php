<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'name'        => ['sometimes','string','max:120'],
            'slug'        => ['nullable','string','max:160', Rule::unique('brands','slug')->ignore($id)],
            'description' => ['nullable','string','max:2000'],
            'is_active'   => ['nullable','boolean'],
            'sort_order'  => ['nullable','integer','min:0','max:9999'],
            'logo'        => ['nullable','image','max:2048'],
        ];
    }
}