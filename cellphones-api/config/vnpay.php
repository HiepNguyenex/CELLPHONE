<?php

return [
    'url'         => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'tmn_code'    => env('VNPAY_TMN_CODE', ''),
    'hash_secret' => env('VNPAY_HASH_SECRET', ''),
    'return_url'  => env('VNPAY_RETURN_URL', env('APP_URL') . '/api/v1/payment/vnpay/return'),
    'ipn_url'     => env('VNPAY_IPN_URL', env('APP_URL') . '/api/v1/payment/vnpay/ipn'),
    'locale'      => env('VNPAY_LOCALE', 'vn'),
    'order_type'  => env('VNPAY_ORDER_TYPE', 'other'),
    'curr_code'   => 'VND',
    'version'     => '2.1.0',
];
