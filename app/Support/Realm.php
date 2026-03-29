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

    public static function guards(): array
    {
        return [
            self::ADMIN => 'admin',
            self::SELLER => 'seller',
            self::CUSTOMER => 'customer',
        ];
    }

    public static function guardName(?string $realm): ?string
    {
        $normalizedRealm = is_string($realm) ? trim($realm) : null;

        return self::guards()[$normalizedRealm] ?? null;
    }

    public static function loginRouteName(?string $realm): string
    {
        return match ($realm) {
            self::ADMIN => 'admin.login',
            self::SELLER => 'seller.login',
            self::CUSTOMER => 'customer.login',
            default => 'home',
        };
    }

    public static function loginPath(?string $realm): string
    {
        return match ($realm) {
            self::ADMIN => '/admin/login',
            self::SELLER => '/seller/login',
            self::CUSTOMER => '/customer/login',
            default => '/',
        };
    }

    public static function homePath(?string $realm): string
    {
        return match ($realm) {
            self::ADMIN => '/admin',
            self::SELLER => '/seller',
            self::CUSTOMER => '/customer/home',
            default => '/',
        };
    }

    public static function forcePasswordPath(?string $realm): string
    {
        return match ($realm) {
            self::ADMIN => '/admin/password/force',
            self::SELLER => '/seller/password/force',
            self::CUSTOMER => '/customer/password/force',
            default => '/',
        };
    }

    public static function logoutPath(?string $realm): string
    {
        return match ($realm) {
            self::ADMIN => '/admin/logout',
            self::SELLER => '/seller/logout',
            self::CUSTOMER => '/customer/logout',
            default => '/logout',
        };
    }

    public static function homeRouteName(?string $realm): string
    {
        return match ($realm) {
            self::ADMIN => 'admin.home',
            self::SELLER => 'seller.home',
            self::CUSTOMER => 'customer.home',
            default => 'home',
        };
    }

    public static function allowedRoles(?string $realm): array
    {
        return match ($realm) {
            self::CUSTOMER => ['CUSTOMER'],
            self::ADMIN, self::SELLER => ['ADMIN', 'SELLER'],
            default => [],
        };
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
