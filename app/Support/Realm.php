<?php

namespace App\Support;

use Illuminate\Http\Request;

final class Realm
{
    public const ADMIN    = 'admin';
    public const SELLER   = 'seller';
    public const CUSTOMER = 'customer';

    /** Clave del atributo en el Request */
    public const ATTRIBUTE = '_current_realm';

    /** Lista de realms válidos */
    public static function all(): array
    {
        return [
            self::ADMIN,
            self::SELLER,
            self::CUSTOMER,
        ];
    }

    public static function isValid(?string $name): bool
    {
        return in_array($name, self::all(), true);
    }

    /**
     * Obtiene el realm actual desde el Request (si se pasa)
     * o desde el request() actual si no se proporciona uno.
     */
    public static function current(?Request $request = null): ?string
    {
        if (empty($request))
        {
            $request = request();
        }

        if ($request instanceof Request)
        {
            $val = $request->attributes->get(self::ATTRIBUTE);

            if (self::isValid($val))
            {
                return $val;
            }

            $route = $request->route();
            if ($route)
            {
                $name = (string) ($route->getName() ?? '');
                if (str_starts_with($name, self::ADMIN . '.'))
                {
                    return self::ADMIN;
                }
                if (str_starts_with($name, self::SELLER . '.'))
                {
                    return self::SELLER;
                }
                if (str_starts_with($name, self::CUSTOMER . '.'))
                {
                    return self::CUSTOMER;
                }
            }

            if ($request->is('admin') || $request->is('admin/*'))
            {
                return self::ADMIN;
            }
            if ($request->is('seller') || $request->is('seller/*'))
            {
                return self::SELLER;
            }
            if ($request->is('customer') || $request->is('customer/*'))
            {
                return self::CUSTOMER;
            }

            return null;
        }

        return null;
    }
}
