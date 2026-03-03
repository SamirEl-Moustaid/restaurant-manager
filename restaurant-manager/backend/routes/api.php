<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Menu
    Route::get('/menu/categories', [MenuController::class, 'categories']);
    Route::get('/menu/items', [MenuController::class, 'allMenuItems']);
    Route::post('/menu/categories', [MenuController::class, 'storeCategory']);
    Route::post('/menu/items', [MenuController::class, 'storeMenuItem']);
    Route::put('/menu/items/{menuItem}', [MenuController::class, 'updateMenuItem']);
    Route::delete('/menu/items/{menuItem}', [MenuController::class, 'destroyMenuItem']);
    Route::patch('/menu/items/{menuItem}/toggle', [MenuController::class, 'toggleAvailability']);

    // Tables
    Route::apiResource('tables', TableController::class);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/kitchen', [OrderController::class, 'kitchenOrders']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{order}/items/{item}/status', [OrderController::class, 'updateItemStatus']);

    // Invoices
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/stats', [InvoiceController::class, 'stats']);
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('/invoices/order/{order}', [InvoiceController::class, 'generate']);
});
