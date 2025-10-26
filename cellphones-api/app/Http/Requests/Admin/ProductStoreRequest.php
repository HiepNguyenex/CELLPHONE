<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'              => ['required','string','max:255'],
            'price'             => ['required','numeric','min:0'],
            'sale_price'        => ['nullable','numeric','min:0'],
            'stock'             => ['required','integer','min:0'],
            'brand_id'          => ['nullable','integer','exists:brands,id'],      // nếu cột DB NOT NULL thì bạn phải gửi
            'category_id'       => ['required','integer','exists:categories,id'],  // bắt buộc có danh mục
            'is_featured'       => ['nullable','boolean'],
            'short_description' => ['nullable','string'],
            'description'       => ['nullable','string'],
            // 1 trong 2: upload file ảnh hoặc cung cấp url
            'image'             => ['nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
            'image_url'         => ['nullable','string','max:2048'],
        ];
    }
}
    