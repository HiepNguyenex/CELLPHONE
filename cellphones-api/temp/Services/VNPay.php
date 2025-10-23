<?php

namespace App\Services;

class VNPay
{
    public static function createPaymentUrl(array $params): string
    {
        $query       = self::buildQuery($params);
        $hashSecret  = config('vnpay.hash_secret');
        $secureHash  = hash_hmac('sha512', $query, $hashSecret);

        return rtrim(config('vnpay.url'), '?') . '?' . $query .
               '&vnp_SecureHashType=HmacSHA512&vnp_SecureHash=' . $secureHash;
    }

    public static function verify(array $all): bool
    {
        $hashSecret    = config('vnpay.hash_secret');
        $vnp_SecureHash= $all['vnp_SecureHash'] ?? '';

        unset($all['vnp_SecureHash'], $all['vnp_SecureHashType']);

        $data = self::buildQuery($all);
        $calc = hash_hmac('sha512', $data, $hashSecret);

        return hash_equals($calc, $vnp_SecureHash);
    }

    private static function buildQuery(array $data): string
    {
        $filtered = [];
        foreach ($data as $k => $v) {
            if (str_starts_with($k, 'vnp_') && $v !== null && $v !== '') {
                $filtered[$k] = $v;
            }
        }
        ksort($filtered);
        $pairs = [];
        foreach ($filtered as $k => $v) {
            $pairs[] = urlencode($k) . '=' . urlencode($v);
        }
        return implode('&', $pairs);
    }
}
