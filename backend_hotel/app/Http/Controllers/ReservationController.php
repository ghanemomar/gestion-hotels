<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReservationController extends Controller
{
    // 📌 User ydir reservation
    public function store(Request $request)
    {
        $fields = $request->validate([
            'room_id'   => 'required|exists:rooms,id',
            'hotel_id'  => 'required|exists:hotels,id',
            'check_in'  => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        $room = Room::findOrFail($fields['room_id']);

        // Vérifier si la chambre déjà réservée f had période
        $conflict = Reservation::where('room_id', $room->id)
            ->where('status', 'confirmed')
            ->where(function ($query) use ($fields) {
                $query->whereBetween('check_in', [$fields['check_in'], $fields['check_out']])
                    ->orWhereBetween('check_out', [$fields['check_in'], $fields['check_out']]);
            })
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'Room already booked for these dates'], 422);
        }

        $reservation = Reservation::create([
            'user_id'   => Auth::id(),
            'room_id'   => $room->id,
            'hotel_id'  => $room->hotel_id,
            'check_in'  => $fields['check_in'],
            'check_out' => $fields['check_out'],
            'status'    => 'pending',
        ]);

        return response()->json([
            'message' => 'Reservation created successfully',
            'reservation' => $reservation
        ], 201);
    }

    // 📌 L’utilisateur kaychouf reservations dyalou
    public function myReservations()
    {
        $reservations = Reservation::where('user_id', Auth::id())
            ->with('room.hotel')
            ->get();

        return response()->json($reservations);
    }

    // 📌 Admin / hotel kay9adro yconfirmiw wla yannulow
    public function updateStatus(Request $request, Reservation $reservation)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled'
        ]);

        $user = Auth::user();

        // Si l'utilisateur est hotel
        if ($user->role === 'hotel') {
            // Vérifier que la réservation appartient à son hôtel
            if ($reservation->hotel_id !== $user->hotel->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Admin peut tout modifier
        $reservation->status = $request->status;
        $reservation->save();

        return response()->json([
            'message' => 'Reservation status updated',
            'reservation' => $reservation
        ]);
    }

    // 📌 Admin kaychouf ga3 reservations
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $reservations = Reservation::with('room.hotel', 'user')->get();

        return response()->json($reservations);
    }

    // 📌 User kayannuler reservation dyalou
    public function cancel(Reservation $reservation)
    {
        if ($reservation->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->status == 'confirmed') {
            return response()->json(['message' => 'Cannot cancel confirmed reservation'], 422);
        }

        $reservation->status = 'cancelled';
        $reservation->save();

        return response()->json(['message' => 'Reservation cancelled']);
    }



}