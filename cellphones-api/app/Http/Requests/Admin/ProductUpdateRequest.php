<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'              => ['sometimes','string','max:255'],
            'price'             => ['sometimes','numeric','min:0'],
            'sale_price'        => ['sometimes','nullable','numeric','min:0'],
            'stock'             => ['sometimes','integer','min:0'],
            'brand_id'          => ['sometimes','nullable','integer','exists:brands,id'],
            'category_id'       => ['sometimes','integer','exists:categories,id'],
            'is_featured'       => ['sometimes','boolean'],
            'short_description' => ['sometimes','nullable','string'],
            'description'       => ['sometimes','nullable','string'],
            'image'             => ['sometimes','nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
            'image_url'         => ['sometimes','nullable','string','max:2048'],
        ];
    }
}
