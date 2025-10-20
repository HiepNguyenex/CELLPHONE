<?php

// app/Http/Controllers/Api/V1/InstallmentController.php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InstallmentPlan;
use Illuminate\Http\Request;

class InstallmentController extends Controller
{
    // GET /v1/installments
    public function index(Request $request)
    {
        $q = InstallmentPlan::query()->where('active', 1);

        if ($request->filled('method')) $q->where('method', $request->query('method'));
        if ($request->filled('months')) $q->where('months', (int) $request->query('months'));
        if ($request->filled('provider')) $q->where('provider', $request->query('provider'));

        $rows = $q->orderBy('method')->orderBy('months')->get();

        $grouped = $rows->groupBy('method')->map(function ($g) {
            return $g->map(function ($r) {
                return [
                    'id'               => (int) $r->id,
                    'method'           => (string) $r->method,
                    'months'           => (int) $r->months,
                    'interest_monthly' => (float) $r->interest_monthly,
                    'min_down_percent' => (int) $r->min_down_percent,
                    'zero_percent'     => (bool) $r->zero_percent,
                    'provider'         => (string) ($r->provider ?? ''),
                ];
            })->values();
        });

        return response()->json(['data' => $grouped]);
    }

    // POST /v1/installments/quote
    public function quote(Request $request)
    {
        $data = $request->validate([
            'price'        => ['required','numeric','min:1000'],
            'method'       => ['required','in:credit,finance'],
            'months'       => ['nullable','integer','min:1','max:36'],
            'down_percent' => ['nullable','integer','min:0','max:90'],
            'zero_percent' => ['nullable','boolean'],
            'provider'     => ['nullable','string','max:100'], // ✅ thêm
        ]);

        $price       = (int) round($data['price']);
        $method      = $data['method'];
        $months      = (int) ($data['months'] ?? 12);
        $downPercent = (int) ($data['down_percent'] ?? 0);
        $zeroPercent = (bool) ($data['zero_percent'] ?? false);
        $provider    = $data['provider'] ?? null;

        $planQuery = InstallmentPlan::query()
            ->where('active', 1)
            ->where('method', $method)
            ->where('months', $months)
            ->where('min_down_percent', '<=', $downPercent)
            ->when($provider, fn($q) => $q->where('provider', $provider))
            ->when($method === 'credit' && $zeroPercent, fn($q) => $q->where('zero_percent', 1))
            ->orderByDesc('zero_percent')
            ->orderBy('min_down_percent');

        $plan = $planQuery->first();

        if (!$plan) {
            // fallback gần nhất theo months
            $plan = InstallmentPlan::query()
                ->where('active', 1)
                ->where('method', $method)
                ->where('min_down_percent', '<=', $downPercent)
                ->when($provider, fn($q) => $q->where('provider', $provider))
                ->orderByRaw('ABS(months - ?)', [$months])
                ->orderByDesc('zero_percent')
                ->first();
        }

        if (!$plan) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy gói trả góp phù hợp.'], 422);
        }

        $useMonths = (int) $plan->months;
        $down      = (int) round($price * $downPercent / 100);
        $financed  = max($price - $down, 0);
        $rate      = ($method === 'credit' && $plan->zero_percent) ? 0.0 : (float) $plan->interest_monthly;

        if ($rate <= 0) {
            $monthly = (int) ceil($financed / max($useMonths,1));
            $totalPayable = $down + $monthly * $useMonths;
        } else {
            $r = $rate; $m = $useMonths;
            $emi = ($financed * $r) / (1 - pow(1 + $r, -$m));
            $monthly = (int) ceil($emi);
            $totalPayable = $down + $monthly * $m;
        }

        return response()->json([
            'status' => true,
            'input'  => [
                'price'        => $price,
                'method'       => $method,
                'months'       => $months,
                'down_percent' => $downPercent,
                'zero_percent' => $zeroPercent,
                'provider'     => (string) ($provider ?? ''),
            ],
            'plan' => [
                'id'               => (int) $plan->id,
                'method'           => (string) $plan->method,
                'months'           => (int) $plan->months,
                'interest_monthly' => (float) $plan->interest_monthly,
                'min_down_percent' => (int) $plan->min_down_percent,
                'zero_percent'     => (bool) $plan->zero_percent,
                'provider'         => (string) ($plan->provider ?? ''),
            ],
            'quote' => [
                'down'          => (int) $down,
                'financed'      => (int) $financed,
                'monthly'       => (int) $monthly,
                'months'        => (int) $useMonths,
                'total_payable' => (int) $totalPayable,
                'rate_monthly'  => (float) $rate,
            ],
        ]);
    }

    // ===== Aliases cho FE cũ (tuỳ bạn cần hay không) =====
    public function calcAlias(Request $r) { 
        // GET alias: map sang POST logic (đơn giản)
        $r->merge([
            'price'        => $r->query('price'),
            'method'       => $r->query('method'),
            'months'       => $r->query('months'),
            'down_percent' => $r->query('down_percent'),
            'zero_percent' => $r->query('zero_percent'),
            'provider'     => $r->query('provider'),
        ]);
        return $this->quote($r);
    }
    public function applyAlias() {
        return response()->json(['status' => true, 'message' => 'Mock apply thành công']);
    }
}
