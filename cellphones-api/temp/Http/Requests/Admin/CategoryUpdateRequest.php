<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['sometimes','string','max:255'],
            // 'slug' => ['sometimes','nullable','string','max:255','unique:categories,slug,'.$this->route('id')],
        ];
    }
}
