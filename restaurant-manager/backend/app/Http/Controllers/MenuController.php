<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Category::with(['menuItems' => function ($q) {
            $q->where('is_available', true);
        }])->where('is_active', true)->orderBy('sort_order')->get();

        return response()->json($categories);
    }

    public function allMenuItems(): JsonResponse
    {
        $items = MenuItem::with('category')->get();
        return response()->json($items);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'icon' => 'nullable|string',
            'sort_order' => 'integer',
        ]);

        $category = Category::create($data);
        return response()->json($category, 201);
    }

    public function storeMenuItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'preparation_time' => 'integer|min:1',
            'is_available' => 'boolean',
            'allergens' => 'nullable|array',
        ]);

        $item = MenuItem::create($data);
        return response()->json($item->load('category'), 201);
    }

    public function updateMenuItem(Request $request, MenuItem $menuItem): JsonResponse
    {
        $data = $request->validate([
            'category_id' => 'exists:categories,id',
            'name' => 'string|max:200',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'preparation_time' => 'integer|min:1',
            'is_available' => 'boolean',
            'allergens' => 'nullable|array',
        ]);

        $menuItem->update($data);
        return response()->json($menuItem->load('category'));
    }

    public function destroyMenuItem(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();
        return response()->json(null, 204);
    }

    public function toggleAvailability(MenuItem $menuItem): JsonResponse
    {
        $menuItem->update(['is_available' => !$menuItem->is_available]);
        return response()->json($menuItem);
    }
}
