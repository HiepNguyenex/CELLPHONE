<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class InventoryUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items'               => ['required','array','min:1'],
            'items.*.store_id'    => ['required','integer','exists:stores,id'],
            'items.*.product_id'  => ['required','integer','exists:products,id'],
            'items.*.stock'       => ['required','integer','min:0'],
        ];
    }
}
