<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RoomController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (auth only)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
});

// Admin-only route to assign role
Route::middleware(['auth:sanctum', 'role:admin'])->patch('/users/{user}/role', [AuthController::class, 'assignRole']);


Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{hotel}', [HotelController::class, 'show']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['role:hotel,admin'])->group(function () {
        Route::post('/hotels', [HotelController::class, 'store']);
        Route::put('/hotels/{hotel}', [HotelController::class, 'update']);
        Route::delete('/hotels/{hotel}', [HotelController::class, 'destroy']);
    });

    // Admin فقط
    Route::middleware(['role:admin'])->patch('/hotels/{hotel}/validate', [HotelController::class, 'validateHotel']);
});

// الغرف الخاصة بفندق معين
Route::get('/hotels/{hotel}/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);
Route::get('/rooms', [RoomController::class, 'allRooms']); 

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware(['role:hotel,admin'])->group(function () {
        Route::post('/hotels/{hotel}/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
    });
});

Route::middleware('auth:sanctum')->group(function () {

    // --- User ---
    Route::post('/reservations', [ReservationController::class, 'store']); // User ydir réservation
    Route::get('/my-reservations', [ReservationController::class, 'myReservations']); // User ychouf réservations dyalou
    Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']); // User yannuler réservation

    // --- Hotel & Admin ---
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])
        ->middleware('role:hotel,admin'); // hotel/admin y3ti statut

    // --- Admin only ---
    Route::get('/reservations', [ReservationController::class, 'index'])
        ->middleware('role:admin'); // admin ychouf ga3 reservations
});

Route::middleware(['auth:sanctum', 'role:admin'])->get('/users', function () {
    return \App\Models\User::all();
});
