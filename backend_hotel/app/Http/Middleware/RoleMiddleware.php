<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Si l'utilisateur n'est pas connecté
        if (!$request->user()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Si le rôle de l'utilisateur n'est pas dans la liste des rôles autorisés
        if (!in_array($request->user()->role, $roles)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
