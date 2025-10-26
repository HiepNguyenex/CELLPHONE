<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice</title>
  <style>
    body{ font-family: DejaVu Sans, sans-serif; font-size:12px; }
    .wrap{ width: 100%; }
    .row{ display:flex; justify-content:space-between; align-items:flex-start; }
    .mt{ margin-top:12px; }
    table{ width:100%; border-collapse:collapse; }
    th,td{ border:1px solid #ddd; padding:8px; }
    th{ background:#f5f5f5; text-align:left; }
    .right{ text-align:right; }
  </style>
</head>
<body>
  <div class="wrap">
    <h2>HÓA ĐƠN #{{ $order->code ?? $order->id }}</h2>
    <div>Ngày: {{ \Carbon\Carbon::parse($order->created_at)->format('d/m/Y H:i') }}</div>

    <div class="row mt">
      <div>
        <strong>Khách hàng</strong><br>
        {{ $order->name }}<br>
        {{ $order->email }}<br>
        {{ $order->phone }}
      </div>
      <div>
        <strong>Địa chỉ giao hàng</strong><br>
        {{ $order->address }}
      </div>
    </div>

    <div class="mt">
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th class="right">SL</th>
            <th class="right">Đơn giá</th>
            <th class="right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
        @foreach(($order->items ?? []) as $it)
          <tr>
            <td>{{ $it->name }}</td>
            <td class="right">{{ $it->qty }}</td>
            <td class="right">{{ number_format($it->price,0,',','.') }}₫</td>
            <td class="right">{{ number_format($it->price * $it->qty,0,',','.') }}₫</td>
          </tr>
        @endforeach
        </tbody>
      </table>
    </div>

    <div class="mt" style="width:280px; margin-left:auto;">
      <table>
        <tr><td>Tạm tính</td><td class="right">{{ number_format($order->subtotal,0,',','.') }}₫</td></tr>
        <tr><td>Phí vận chuyển</td><td class="right">{{ number_format($order->shipping,0,',','.') }}₫</td></tr>
        <tr><td>Giảm giá</td><td class="right">-{{ number_format($order->discount ?? 0,0,',','.') }}₫</td></tr>
        <tr><th>Tổng cộng</th><th class="right">{{ number_format($order->total,0,',','.') }}₫</th></tr>
      </table>
    </div>
  </div>
</body>
</html>
