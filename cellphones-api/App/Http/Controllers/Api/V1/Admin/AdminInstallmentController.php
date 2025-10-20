<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\InstallmentPlanRequest;
use App\Models\InstallmentPlan;
use Illuminate\Http\Request;

class AdminInstallmentController extends Controller
{
    public function index(Request $request)
    {
        $q = InstallmentPlan::query();

        if ($request->filled('method')) $q->where('method', $request->query('method'));
        if ($request->filled('months')) $q->where('months', (int) $request->query('months'));
        if ($request->filled('active')) $q->where('active', (bool) $request->query('active'));

        $q->orderBy('method')->orderBy('months');

        $perPage = (int) $request->query('per_page', 50);
        $perPage = max(10, min($perPage, 200));

        return response()->json($q->paginate($perPage));
    }

    public function store(InstallmentPlanRequest $request)
    {
        $data = $request->validated();
        // Finance không hỗ trợ zero_percent
        if (($data['method'] ?? null) === 'finance') {
            $data['zero_percent'] = false;
        }

        $plan = InstallmentPlan::create($data);

        return response()->json(['status' => true, 'data' => $plan], 201);
    }

    public function show($id)
    {
        $plan = InstallmentPlan::findOrFail($id);
        return response()->json(['data' => $plan]);
    }

    public function update(InstallmentPlanRequest $request, $id)
    {
        $plan = InstallmentPlan::findOrFail($id);
        $data = $request->validated();

        if (($data['method'] ?? $plan->method) === 'finance') {
            $data['zero_percent'] = false;
        }

        $plan->update($data);

        return response()->json(['status' => true, 'data' => $plan]);
    }

    public function destroy($id)
    {
        $plan = InstallmentPlan::findOrFail($id);
        $plan->delete();

        return response()->json(['status' => true]);
    }
}
