<?php

return [
    'tmn_code'    => env('VNP_TMN_CODE', ''),
    'hash_secret' => env('VNP_HASH_SECRET', ''),
    'pay_url'     => env('VNP_PAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'return_url'  => env('VNP_RETURN_URL', env('APP_URL') . '/api/v1/payment/vnpay/return'),
    'ipn_url'     => env('VNP_IPN_URL',    env('APP_URL') . '/api/v1/payment/vnpay/ipn'),
];
