<?php

namespace App\Services;

class VNPay
{
    public static function createPaymentUrl(array $params): string
    {
        // $params đã chứa các key dạng vnp_... (Version, TmnCode, Amount, ReturnUrl, TxnRef, ...)
        $query = self::buildQuery($params);

        $hashSecret = config('vnpay.hash_secret');
        $vnp_SecureHash = hash_hmac('sha512', $query, $hashSecret);

        // NÊN gửi kèm loại hash
        $suffix = '&vnp_SecureHashType=HmacSHA512&vnp_SecureHash=' . $vnp_SecureHash;

        return rtrim(config('vnpay.pay_url'), '?') . '?' . $query . $suffix;
    }

    public static function verify(array $all): bool
    {
        $hashSecret    = config('vnpay.hash_secret');
        $vnp_SecureHash= $all['vnp_SecureHash'] ?? '';

        // Loại bỏ 2 key hash khỏi dữ liệu trước khi tính lại
        unset($all['vnp_SecureHash'], $all['vnp_SecureHashType']);

        $data = self::buildQuery($all);
        $calc = hash_hmac('sha512', $data, $hashSecret);

        return hash_equals($calc, $vnp_SecureHash);
    }

    private static function buildQuery(array $data): string
    {
        // Lọc chỉ lấy các key bắt đầu bằng vnp_ và có giá trị
        $filtered = [];
        foreach ($data as $k => $v) {
            if (str_starts_with($k, 'vnp_') && $v !== null && $v !== '') {
                $filtered[$k] = $v;
            }
        }

        // Sắp xếp key theo ABC đúng chuẩn VNPay
        ksort($filtered);

        // Ghép query (urlencode từng cặp)
        $pairs = [];
        foreach ($filtered as $k => $v) {
            $pairs[] = urlencode($k) . '=' . urlencode($v);
        }

        return implode('&', $pairs);
    }
}
