<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

        if (Auth::id() !== $hotel->user_id && Auth::user()->role !== 'hotel' && Auth::user()->role !== 'admin') {
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

    // --- Autorisation ---
    if (Auth::id() !== $hotel->user_id && !in_array(Auth::user()->role, ['hotel', 'admin'])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // --- Validation ---
    $request->validate([
        'name'        => 'sometimes|string|max:150',
        'type'        => 'sometimes|string|max:100',
        'price'       => 'sometimes|numeric|min:0',
        'capacity'    => 'sometimes|integer|min:1',
        'description' => 'nullable|string',

        'image.*'     => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'remove_images' => 'nullable|array',
    ]);

    // Récupérer les anciennes images
    $existingImages = json_decode($room->image ?? "[]", true);

    // --------------------------
    // 1️⃣ SUPPRESSION DES IMAGES
    // --------------------------
    if ($request->has('remove_images')) {
        foreach ($request->remove_images as $img) {
            if (Storage::disk('public')->exists($img)) {
                Storage::disk('public')->delete($img);
            }

            $existingImages = array_filter($existingImages, fn($i) => $i !== $img);
        }

        // Re-indexer
        $existingImages = array_values($existingImages);
    }

    // --------------------------
    // 2️⃣ AJOUT DE NOUVELLES IMAGES
    // --------------------------
    if ($request->hasFile('image')) {
        foreach ($request->file('image') as $file) {
            $path = $file->store('rooms', 'public');
            $existingImages[] = $path;
        }
    }

    // --------------------------
    // 3️⃣ MISE À JOUR FINALE
    // --------------------------
    $room->update([
        'name'        => $request->input('name', $room->name),
        'type'        => $request->input('type', $room->type),
        'price'       => $request->input('price', $room->price),
        'capacity'    => $request->input('capacity', $room->capacity),
        'description' => $request->input('description', $room->description),
        'image'       => json_encode($existingImages),  
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

        if (Auth::id() !== $hotel->user_id && Auth::user()->role !== 'admin' && Auth::user()->role !== 'hotel') {
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
    // Récupérer toutes les chambres dont l'hôtel est validé
    $rooms = Room::whereHas('hotel', function($query) {
        $query->where('validated', true);
    })->with('hotel')->get();

    return response()->json([
        'status' => 'success',
        'data' => $rooms
    ]);
}


public function hotelRooms(Request $request)
{
    try {
        $user = $request->user();

        // ✅ التحقق من أن المستخدم مصادق عليه
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 401);
        }

        // ✅ التحقق من أن المستخدم عندو الصلاحية (مثلاً role = 'hotel' أو 'admin')
        if (!in_array($user->role, ['hotel', 'admin'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Access denied.'
            ], 403);
        }

        // ✅ جلب الفنادق ديال المستخدم
        $hotels = $user->hotels;

        if ($hotels->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'data' => [],
                'message' => 'No hotels found for this user.'
            ]);
        }

        // ✅ استخراج IDs للفنادق
        $hotelIds = $hotels->pluck('id');

        // ✅ جلب الغرف التابعة للفنادق ديالو فقط
        $rooms = Room::with('hotel')
            ->whereIn('hotel_id', $hotelIds)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rooms
        ], 200);

    } catch (\Exception $e) {
        // ✅ معالجة أي خطأ غير متوقع
        return response()->json([
            'status' => 'error',
            'message' => 'Something went wrong.',
            'error' => $e->getMessage()
        ], 500);
    }
}


}