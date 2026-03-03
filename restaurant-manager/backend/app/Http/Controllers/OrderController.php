<?php

namespace App\Http\Controllers;

use App\Events\OrderStatusUpdated;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['table', 'user', 'items.menuItem'])
            ->orderByDesc('created_at');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->table_id) {
            $query->where('table_id', $request->table_id);
        }

        return response()->json($query->paginate(20));
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['table', 'user', 'items.menuItem', 'invoice']));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'table_id' => 'required|exists:restaurant_tables,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $menuItem = \App\Models\MenuItem::findOrFail($item['menu_item_id']);
                $totalPrice = $menuItem->price * $item['quantity'];
                $subtotal += $totalPrice;
                $itemsData[] = [
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'total_price' => $totalPrice,
                    'notes' => $item['notes'] ?? null,
                    'status' => 'pending',
                ];
            }

            $tax = $subtotal * 0.20;
            $total = $subtotal + $tax;

            $order = Order::create([
                'order_number' => Order::generateNumber(),
                'table_id' => $data['table_id'],
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }

            // Update table status
            RestaurantTable::find($data['table_id'])->update(['status' => 'occupied']);

            event(new OrderStatusUpdated($order));

            return response()->json($order->load(['table', 'user', 'items.menuItem']), 201);
        });
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,ready,served,paid,cancelled',
        ]);

        $timestamps = [
            'confirmed' => 'confirmed_at',
            'ready' => 'prepared_at',
            'served' => 'served_at',
            'paid' => 'paid_at',
        ];

        $updateData = ['status' => $data['status']];

        if (isset($timestamps[$data['status']])) {
            $updateData[$timestamps[$data['status']]] = now();
        }

        $order->update($updateData);

        if ($data['status'] === 'paid' || $data['status'] === 'cancelled') {
            $order->table->update(['status' => 'available']);
        }

        event(new OrderStatusUpdated($order));

        return response()->json($order->load(['table', 'user', 'items.menuItem']));
    }

    public function updateItemStatus(Request $request, Order $order, OrderItem $item): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:pending,preparing,ready,served',
        ]);

        $item->update(['status' => $data['status']]);

        // Auto-update order status based on items
        $allReady = $order->items()->where('status', '!=', 'ready')
                                   ->where('status', '!=', 'served')->count() === 0;

        if ($allReady && $order->status === 'preparing') {
            $order->update(['status' => 'ready', 'prepared_at' => now()]);
            event(new OrderStatusUpdated($order));
        }

        return response()->json($item->load('menuItem'));
    }

    public function kitchenOrders(): JsonResponse
    {
        $orders = Order::with(['table', 'items.menuItem'])
            ->whereIn('status', ['confirmed', 'preparing'])
            ->orderBy('created_at')
            ->get();

        return response()->json($orders);
    }
}
