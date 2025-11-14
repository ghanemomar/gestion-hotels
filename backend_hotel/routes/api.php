<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\RoomController;

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected auth routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
});

/*
|--------------------------------------------------------------------------
| Admin-only routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::patch('/users/{user}/role', [AuthController::class, 'assignRole']); // assign role
    Route::patch('/hotels/{hotel}/validate', [HotelController::class, 'validateHotel']); // validate hotel
    Route::get('/admin/hotels', [HotelController::class, 'adminHotel']); // get all hotels for admin
    Route::get('/users', function () {
        return \App\Models\User::all();
    });
    Route::get('/reservations', [ReservationController::class, 'index']); // see all reservations
});

/*
|--------------------------------------------------------------------------
| Hotel & Admin routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:hotel,admin'])->group(function () {
    // Hotel CRUD
    Route::post('/hotels', [HotelController::class, 'store']);
    Route::put('/hotels/{hotel}', [HotelController::class, 'update']);
    Route::delete('/hotels/{hotel}', [HotelController::class, 'destroy']);

    // Rooms CRUD
    Route::post('/hotels/{hotel}/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{room}', [RoomController::class, 'update']);
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

    // Update reservation status
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
    // Delete reservation
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'deleteReservation']);
    //get rooms of hotel owner
    Route::get('/hotel/rooms', [RoomController::class, 'hotelRooms']);
});

/*
|--------------------------------------------------------------------------
| Public Hotel Routes
|--------------------------------------------------------------------------
*/
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{hotel}', [HotelController::class, 'show']);
Route::get('/hotels/{hotel}/rooms', [RoomController::class, 'index']);
Route::get('/rooms', [RoomController::class, 'allRooms']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Hotel-specific routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Reservations for hotel dashboard
    Route::get('/hotel/reservations', [ReservationController::class, 'hotelReservations']);

    // User routes
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    Route::patch('/reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
    
    //hotels dyal wahd l'user role:hotel
    Route::get('/my-hotels', [HotelController::class, 'myHotels']);

});
