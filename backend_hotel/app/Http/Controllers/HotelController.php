<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; 


class HotelController extends Controller
{
    // لائحة الفنادق (المصادق عليهم فقط)
    public function index()
    {
        $hotels = Hotel::where('validated', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $hotels
        ]);
    }

    // عرض فندق واحد
    public function show(Hotel $hotel)
    {
        if (!$hotel->validated && Auth::user()?->role !== 'admin') {
            return response()->json(['message' => 'Hotel not validated yet'], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $hotel
        ]);
    }

    // إنشاء فندق جديد (hotel role أو admin)
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:150',
            'city'        => 'required|string|max:100',
            'address'     => 'required|string|max:255',
            'description' => 'nullable|string',
            'telephone'   => 'required|string|max:20',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'image'       => 'nullable|array',
            'image.*'     => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $images = [];
        if ($request->hasFile('image')) {
            foreach ($request->file('image') as $file) {
                $path = $file->store('hotels', 'public'); // storage/app/public/hotels
                $images[] = $path;
            }
        }

        $hotel = Hotel::create([
            'name'        => $request->name,
            'city'        => $request->city,
            'address'     => $request->address,
            'description' => $request->description,
            'telephone'   => $request->telephone,
            'latitude'    => $request->latitude,
            'longitude'   => $request->longitude,
            'image'       => !empty($images) ? json_encode($images) : null,
            'user_id'     => Auth::id(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Hotel created successfully, pending validation',
            'data' => $hotel
        ], 201);
    }


    // تعديل فندق (صاحب الفندق أو admin فقط)
    public function update(Request $request, Hotel $hotel)
{
    $user = Auth::user();

    // 🔒 Vérifier les permissions (admin ou propriétaire)
    if (!in_array($user->role, ['admin', 'hotel'])) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    // 🔹 Validation
    $request->validate([
        'name'        => 'sometimes|string|max:150',
        'city'        => 'sometimes|string|max:100',
        'address'     => 'sometimes|string|max:255',
        'description' => 'nullable|string',
        'telephone'   => 'sometimes|string|max:20',
        'latitude'    => 'nullable|numeric',
        'longitude'   => 'nullable|numeric',
        'image'       => 'nullable|array',
        'image.*'     => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'existingImages' => 'nullable|string', // tableau JSON envoyé depuis React
    ]);

    // 🔹 Anciennes images sauvegardées en base
    $currentImages = json_decode($hotel->image) ?? [];

    // 🔹 Images à conserver envoyées depuis le front
    $keepImages = [];
    if ($request->filled('existingImages')) {
        $keepImages = json_decode($request->existingImages, true);
    }

    // 🔹 Supprimer les anciennes images non conservées
    $deletedImages = array_diff($currentImages, $keepImages);
    foreach ($deletedImages as $imgPath) {
        if (Storage::disk('public')->exists($imgPath)) {
            Storage::disk('public')->delete($imgPath);
        }
    }

    // 🔹 Liste finale d’images
    $images = $keepImages;

    // 🔹 Ajouter les nouvelles images uploadées
    if ($request->hasFile('image')) {
        foreach ($request->file('image') as $file) {
            $path = $file->store('hotels', 'public');
            $images[] = $path;
        }
    }

    // 🔹 Mettre à jour les infos
    $hotel->update([
        'name'        => $request->input('name', $hotel->name),
        'city'        => $request->input('city', $hotel->city),
        'address'     => $request->input('address', $hotel->address),
        'description' => $request->input('description', $hotel->description),
        'telephone'   => $request->input('telephone', $hotel->telephone),
        'latitude'    => $request->input('latitude', $hotel->latitude),
        'longitude'   => $request->input('longitude', $hotel->longitude),
        'image'       => !empty($images) ? json_encode($images) : null,
    ]);

    return response()->json([
        'status' => 'success',
        'message' => '✅ Hôtel mis à jour avec succès',
        'data' => $hotel
    ]);
}


    // حذف فندق
    public function destroy(Hotel $hotel)
    {
        if (Auth::id() !== $hotel->user_id && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hotel->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Hotel deleted successfully'
        ]);
    }

    // Admin: تفعيل فندق
    public function validateHotel(Hotel $hotel, Request $request)
    {
        // Vérifier si l'utilisateur est admin
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Valider le champ "validated" depuis la requête
        $request->validate([
            'validated' => 'required|boolean',
        ]);

        $hotel->validated = $request->validated;
        $hotel->save();

        return response()->json([
            'status' => 'success',
            'message' => $hotel->validated
                ? 'Hotel validated successfully'
                : 'Hotel unvalidated successfully',
            'data' => $hotel
        ]);
    }

    public function adminHotel()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hotels = Hotel::all();

        return response()->json([
            'status' => 'success',
            'data' => $hotels
        ]);
    }

    // les hotel liée l user role= hotel
    public function myHotels()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        if ($user->role !== 'hotel') {
            return response()->json(['message' => 'Accès refusé : réservé aux hôteliers'], 403);
        }

        $hotels = Hotel::where('user_id', $user->id)->get();

        return response()->json([
            'status' => 'success',
            'data' => $hotels
        ]);
    }
}
