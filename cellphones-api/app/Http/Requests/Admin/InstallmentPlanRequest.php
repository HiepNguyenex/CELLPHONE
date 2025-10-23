<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class InstallmentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'method'           => ['required','in:credit,finance'],
            'months'           => ['required','integer','min:1','max:36'],
            'interest_monthly' => ['required','numeric','min:0','max:0.2'], // 0..20%/tháng (an toàn)
            'min_down_percent' => ['required','integer','min:0','max:90'],
            'zero_percent'     => ['sometimes','boolean'],
            'provider'         => ['nullable','string','max:100'],
            'active'           => ['sometimes','boolean'],
        ];
    }
}
