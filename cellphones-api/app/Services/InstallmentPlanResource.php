<?php

namespace App\Services;

use App\Models\InstallmentPlan;
use App\Models\Product;
use Illuminate\Support\Arr;

/**
 * Tính trả góp (EMI) theo nhiều phương án.
 * - Hỗ trợ 0% (credit) và finance (có lãi theo tháng).
 * - Đầu vào linh hoạt: truyền plan_id, hoặc method + months, hoặc chỉ price và để service tự chọn plan phù hợp.
 * - Mặc định làm tròn 1.000đ cho monthly_payment để hiển thị đẹp.
 */
class InstallmentService
{
    /**
     * Trả về danh sách Plan đang active, có thể lọc theo method/months.
     */
    public function availablePlans(?string $method = null, ?int $months = null)
    {
        return InstallmentPlan::query()
            ->when($method, fn($q) => $q->where('method', $method))
            ->when($months, fn($q) => $q->where('months', $months))
            ->where('active', 1)
            ->orderBy('method')
            ->orderBy('months')
            ->get();
    }

    /**
     * Tính EMI.
     *
     * @param  array  $input
     *   - price (int|float|Product)  : giá sản phẩm (VND) hoặc model Product
     *   - plan_id (int)              : (optional) id của InstallmentPlan
     *   - method (string)            : (optional) 'credit'|'finance'
     *   - months (int)               : (optional) số tháng
     *   - down_percent (float)       : (optional) % trả trước (0-100). Nếu truyền down_amount rồi thì bỏ qua.
     *   - down_amount (int|float)    : (optional) số tiền trả trước (VND) ưu tiên hơn down_percent
     *   - round_to (int)             : (optional) đơn vị làm tròn cho monthly_payment (mặc định 1000)
     *
     * @return array
     */
    public function quote(array $input): array
    {
        $roundTo = (int) ($input['round_to'] ?? 1000);

        // --- Lấy giá ---
        $price = $this->extractPrice($input['price'] ?? 0);
        $price = max(0, (float) $price);

        // --- Lấy plan ---
        $plan = null;
        if (!empty($input['plan_id'])) {
            $plan = InstallmentPlan::where('active', 1)->find($input['plan_id']);
        } else {
            $method = Arr::get($input, 'method');
            $months = Arr::get($input, 'months');
            $plan = $this->availablePlans($method, $months)->first();
        }

        if (!$plan) {
            return [
                'ok' => false,
                'error' => 'PLAN_NOT_FOUND',
                'message' => 'Không tìm thấy gói trả góp phù hợp.',
            ];
        }

        // --- Tính down payment ---
        $downAmount = null;

        if (isset($input['down_amount'])) {
            $downAmount = max(0, (float) $input['down_amount']);
        } elseif (isset($input['down_percent'])) {
            $downAmount = $price * (max(0, (float) $input['down_percent']) / 100);
        } elseif ($plan->min_down_percent) {
            $downAmount = $price * ($plan->min_down_percent / 100);
        } else {
            $downAmount = 0.0;
        }

        $downAmount = min($downAmount, $price);
        $loan = max(0, $price - $downAmount);

        // --- Lãi suất tháng ---
        $r = max(0.0, (float) $plan->interest_monthly);
        $n = max(1, (int) $plan->months);

        // --- EMI formula ---
        // M = P * r * (1+r)^n / [(1+r)^n - 1], r theo tháng (vd 0.017)
        // Nếu r=0 => M = P / n
        if ($loan <= 0) {
            $monthly = 0;
            $interestTotal = 0;
            $totalPayable = $downAmount;
        } else {
            if ($r <= 0.0) {
                $monthly = $loan / $n;
            } else {
                $pow = pow(1 + $r, $n);
                $monthly = $loan * $r * $pow / ($pow - 1);
            }
            // Làm tròn hiển thị
            if ($roundTo > 1) {
                $monthly = ceil($monthly / $roundTo) * $roundTo;
            }

            $totalPayable = $downAmount + ($monthly * $n);
            $interestTotal = max(0, $totalPayable - $price);
        }

        return [
            'ok' => true,
            'plan' => [
                'id'               => $plan->id,
                'method'           => $plan->method,
                'months'           => (int) $plan->months,
                'interest_monthly' => (float) $plan->interest_monthly,
                'min_down_percent' => (float) ($plan->min_down_percent ?? 0),
                'zero_percent'     => (bool) $plan->zero_percent,
                'active'           => (bool) $plan->active,
            ],
            'price'           => (int) round($price),
            'down_amount'     => (int) round($downAmount),
            'loan_amount'     => (int) round($loan),
            'monthly_payment' => (int) round($monthly),
            'months'          => $n,
            'total_payable'   => (int) round($totalPayable),
            'interest_total'  => (int) round($interestTotal),
        ];
    }

    /**
     * Tự động chọn các plan hợp lệ cho 1 mức giá và (tuỳ chọn) down_percent.
     */
    public function suggestPlans($price, ?float $downPercent = null)
    {
        $price = $this->extractPrice($price);

        return InstallmentPlan::query()
            ->where('active', 1)
            ->when($downPercent !== null, function ($q) use ($downPercent) {
                $q->where(function ($qq) use ($downPercent) {
                    // Cho credit 0% không bắt buộc down
                    $qq->where('method', 'credit')
                       ->orWhere(function ($q2) use ($downPercent) {
                           $q2->where('method', 'finance')
                              ->where('min_down_percent', '<=', $downPercent);
                       });
                });
            })
            ->orderBy('method')
            ->orderBy('months')
            ->get()
            ->map(function ($plan) use ($price, $downPercent) {
                $down = null;
                if ($downPercent !== null) {
                    $down = $price * ($downPercent / 100);
                } elseif ($plan->min_down_percent) {
                    $down = $price * ($plan->min_down_percent / 100);
                } else {
                    $down = 0;
                }
                $quote = $this->quote([
                    'price' => $price,
                    'plan_id' => $plan->id,
                    'down_amount' => $down,
                ]);
                return $quote;
            })
            ->values();
    }

    /**
     * Lấy giá từ Product hoặc con số.
     */
    protected function extractPrice($price): float
    {
        if ($price instanceof Product) {
            // Ưu tiên sale_price nếu có, không thì price
            $p = $price->sale_price ?? $price->price ?? 0;
            return (float) $p;
        }
        return (float) $price;
    }
}
