<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class AdminUserController extends Controller
{
    public function index(Request $r)
    {
        $q       = trim($r->get('q',''));
        $role    = $r->get('role');      // user|admin|staff
        $status  = $r->get('status');    // active|banned
        $sort    = $r->get('sort','created_at');
        $order   = $r->get('order','desc');
        $perPage = (int) ($r->get('perPage', 10));

        $paidStatuses = ['paid','processing','shipping','shipped','completed'];

        $users = User::query()
            ->when($q, function($qr) use ($q) {
                $qr->where(function($w) use ($q) {
                    $w->where('name','like',"%$q%")
                      ->orWhere('email','like',"%$q%");
                });
            })
            ->when($role,   fn($qr)=>$qr->where('role', $role))
            ->when($status, fn($qr)=>$qr->where('status', $status))
            ->withCount('orders')
            ->withSum(['orders as total_spent' => function($o) use ($paidStatuses){
                $o->whereIn('status',$paidStatuses);
            }],'total')
            ->orderBy(in_array($sort,['name','email','created_at','orders_count','total_spent'])?$sort:'created_at', $order==='asc'?'asc':'desc')
            ->paginate($perPage);

        return response()->json($users);
    }

    public function show($id)
    {
        $paidStatuses = ['paid','processing','shipping','shipped','completed'];
        $u = User::query()
            ->withCount('orders')
            ->withSum(['orders as total_spent' => function($o) use ($paidStatuses){
                $o->whereIn('status',$paidStatuses);
            }],'total')
            ->findOrFail($id);

        return response()->json($u);
    }

    public function update(Request $r, $id)
    {
        $data = $r->validate([
            'role'   => 'nullable|string|in:user,admin,staff',
            'status' => 'nullable|string|in:active,banned',
        ]);
        $u = User::findOrFail($id);

        if (array_key_exists('role',$data))   $u->role   = $data['role'];
        if (array_key_exists('status',$data)) {
            $u->status = $data['status'];
            $u->banned_at = $data['status']==='banned' ? now() : null;
            if ($data['status']==='banned') {
                $u->tokens()->delete();
            }
        }
        $u->save();

        return response()->json(['success'=>true,'message'=>'Updated','data'=>$u]);
    }

    public function ban($id)
    {
        $u = User::findOrFail($id);
        $u->status = 'banned';
        $u->banned_at = now();
        $u->save();
        $u->tokens()->delete();
        return response()->json(['success'=>true,'message'=>'User banned']);
    }

    public function unban($id)
    {
        $u = User::findOrFail($id);
        $u->status = 'active';
        $u->banned_at = null;
        $u->save();
        return response()->json(['success'=>true,'message'=>'User unbanned']);
    }

    public function logoutAll($id)
    {
        $u = User::findOrFail($id);
        $u->tokens()->delete();
        return response()->json(['success'=>true,'message'=>'Revoked all tokens']);
    }
}
