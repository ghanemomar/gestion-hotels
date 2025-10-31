<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoomController extends Controller
{
    // لائحة الغرف ديال فندق معين
    public function index($hotel_id)
    {
        $rooms = Room::where('hotel_id', $hotel_id)->get();

        return response()->json([
            'status' => 'success',
            'data' => $rooms
        ]);
    }

    // عرض غرفة معينة
    public function show($id)
    {
        $room = Room::with('hotel')->findOrFail($id);
        return response()->json(['data' => $room]);
    }

    // إنشاء غرفة جديدة (خاص بصاحب الفندق أو admin)
    public function store(Request $request, $hotel_id)
    {
        $request->validate([
            'name'        => 'required|string|max:150',
            'type'        => 'required|string|max:100',
            'price'       => 'required|numeric|min:0',
            'capacity'    => 'required|integer|min:1',
            'description' => 'nullable|string',
            'image'       => 'nullable|array',
            'image.*'     => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $hotel = Hotel::findOrFail($hotel_id);

        if (Auth::id() !== $hotel->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $images = [];
        if ($request->hasFile('image')) {
            foreach ($request->file('image') as $file) {
                $path = $file->store('rooms', 'public'); // storage/app/public/rooms
                $images[] = $path;
            }
        }

        $room = Room::create([
            'hotel_id'    => $hotel_id,
            'name'        => $request->name,
            'type'        => $request->type,
            'price'       => $request->price,
            'capacity'    => $request->capacity,
            'description' => $request->description,
            'image'       => !empty($images) ? json_encode($images) : null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Room created successfully',
            'data' => $room
        ], 201);
    }

    public function update(Request $request, Room $room)
    {
        $hotel = $room->hotel;

        if (Auth::id() !== $hotel->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name'        => 'sometimes|string|max:150',
            'type'        => 'sometimes|string|max:100',
            'price'       => 'sometimes|numeric|min:0',
            'capacity'    => 'sometimes|integer|min:1',
            'description' => 'nullable|string',
            'image'       => 'nullable|array',
            'image.*'     => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $images = json_decode($room->image) ?? [];

        if ($request->hasFile('image')) {
            foreach ($request->file('image') as $file) {
                $path = $file->store('rooms', 'public');
                $images[] = $path;
            }
        }

        $room->update([
            'name'        => $request->name ?? $room->name,
            'type'        => $request->type ?? $room->type,
            'price'       => $request->price ?? $room->price,
            'capacity'    => $request->capacity ?? $room->capacity,
            'description' => $request->description ?? $room->description,
            'image'       => !empty($images) ? json_encode($images) : $room->image,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Room updated successfully',
            'data' => $room
        ]);
    }


    // حذف غرفة
    public function destroy(Room $room)
    {
        $hotel = $room->hotel;

        if (Auth::id() !== $hotel->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Room deleted successfully'
        ]);
    }

    // tout les chambres 
    public function allRooms()
    {
        $allrooms = Room::all();

        return response()->json([
            'status' => 'success',
            'data' => $allrooms
        ]);
    }
}
