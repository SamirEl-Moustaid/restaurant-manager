<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = RestaurantTable::with('activeOrder.items')->get();
        return response()->json($tables);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number' => 'required|string|unique:restaurant_tables,number',
            'capacity' => 'required|integer|min:1',
            'location' => 'nullable|string',
        ]);

        $table = RestaurantTable::create($data);
        return response()->json($table, 201);
    }

    public function update(Request $request, RestaurantTable $restaurantTable): JsonResponse
    {
        $data = $request->validate([
            'number' => 'string|unique:restaurant_tables,number,' . $restaurantTable->id,
            'capacity' => 'integer|min:1',
            'status' => 'in:available,occupied,reserved,cleaning',
            'location' => 'nullable|string',
        ]);

        $restaurantTable->update($data);
        return response()->json($restaurantTable);
    }

    public function destroy(RestaurantTable $restaurantTable): JsonResponse
    {
        $restaurantTable->delete();
        return response()->json(null, 204);
    }
}
