@component('mail::message')
# Cập nhật đơn hàng #{{ $order->code ?? $order->id }}

Trạng thái: **{{ $fromStatus }} → {{ $toStatus }}**

@isset($note)
> Ghi chú: _{{ $note }}_
@endisset

@component('mail::panel')
**Tổng tiền:** {{ number_format($order->total,0,',','.') }}₫  
**Thời gian đặt:** {{ \Carbon\Carbon::parse($order->created_at)->format('d/m/Y H:i') }}
@endcomponent

@component('mail::button', ['url' => config('app.url')])
Xem đơn hàng
@endcomponent

Cảm ơn bạn đã mua sắm!
@endcomponent
