<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order;
use Stripe\Webhook;
use Stripe\Stripe;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $endpointSecret = config('services.stripe.webhook_secret');

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
        } catch (\UnexpectedValueException $e) {
            Log::error('⚠️ Stripe: Invalid payload');
            return response('Invalid payload', 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Log::error('⚠️ Stripe: Invalid signature');
            return response('Invalid signature', 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $orderId = $session->metadata->order_id ?? null;

                if ($orderId && ($order = Order::find($orderId))) {
                    $order->update([
                        'payment_status'  => 'paid',
                        'status'          => 'processing',
                        'payment_paid_at' => now(),
                        'payment_note'    => 'Thanh toán thành công qua Stripe webhook',
                    ]);
                    Log::info("✅ Stripe webhook: Order #{$order->id} đã thanh toán thành công.");
                } else {
                    Log::warning('⚠️ Stripe webhook: Không tìm thấy order_id hoặc order.');
                }
                break;

            case 'payment_intent.payment_failed':
                Log::warning('❌ Stripe: Thanh toán thất bại');
                break;

            default:
                Log::info("ℹ️ Stripe webhook event: {$event->type}");
                break;
        }

        return response('ok', 200);
    }
}
