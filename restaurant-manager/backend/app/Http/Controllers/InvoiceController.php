<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        $invoices = Invoice::with('order.table')->orderByDesc('created_at')->paginate(20);
        return response()->json($invoices);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($invoice->load(['order.table', 'order.items.menuItem', 'order.user']));
    }

    public function generate(Request $request, Order $order): JsonResponse
    {
        if ($order->invoice) {
            return response()->json($order->invoice->load('order'), 200);
        }

        $data = $request->validate([
            'discount' => 'numeric|min:0|max:100',
            'payment_method' => 'required|in:cash,card,mobile',
            'notes' => 'nullable|string',
        ]);

        $discount = $data['discount'] ?? 0;
        $discountAmount = $order->subtotal * ($discount / 100);
        $taxableAmount = $order->subtotal - $discountAmount;
        $taxAmount = $taxableAmount * 0.20;
        $total = $taxableAmount + $taxAmount;

        $invoice = Invoice::create([
            'invoice_number' => Invoice::generateNumber(),
            'order_id' => $order->id,
            'subtotal' => $order->subtotal,
            'tax_rate' => 20.00,
            'tax_amount' => $taxAmount,
            'discount' => $discountAmount,
            'total' => $total,
            'payment_method' => $data['payment_method'],
            'status' => 'paid',
            'notes' => $data['notes'] ?? null,
        ]);

        $order->update(['status' => 'paid', 'paid_at' => now(), 'total' => $total]);
        $order->table->update(['status' => 'available']);

        return response()->json($invoice->load(['order.table', 'order.items.menuItem']), 201);
    }

    public function stats(): JsonResponse
    {
        $today = today();

        return response()->json([
            'today_revenue' => Invoice::whereDate('created_at', $today)
                ->where('status', 'paid')->sum('total'),
            'today_orders' => Order::whereDate('created_at', $today)
                ->where('status', 'paid')->count(),
            'month_revenue' => Invoice::whereMonth('created_at', $today->month)
                ->where('status', 'paid')->sum('total'),
            'pending_orders' => Order::whereNotIn('status', ['paid', 'cancelled'])->count(),
        ]);
    }
}
