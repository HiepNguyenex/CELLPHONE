<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class WarrantyPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required','string','max:255'],
            'slug'        => ['nullable','string','max:255'],
            'type'        => ['required','in:extended,accident,combo'],
            'months'      => ['nullable','integer','min:0','max:60'],
            'price'       => ['required','numeric','min:0'],
            'product_id'  => ['nullable','integer','exists:products,id'],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'brand_id'    => ['nullable','integer','exists:brands,id'],
            'active'      => ['sometimes','boolean'],
        ];
    }
}
