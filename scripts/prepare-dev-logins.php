<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$sharedPassword = 'GfaDev2026';
$customerLoginEmail = 'customer.local@gfa.dev';

$resolveAdmin = static function (): ?User {
	return User::query()
		->where('email', 'arieltapia@gmail.com')
		->first()
		?: User::query()->where('realm', 'admin')->orderBy('id')->first();
};

$resolveSeller = static function (): ?User {
	return User::query()
		->where('email', 'vendedor@example.com')
		->first()
		?: User::query()->where('realm', 'admin')->where('id', '!=', 1)->orderBy('id')->first();
};

$resolveCustomer = static function (): ?User {
	return User::query()
		->where('email', 'customer.local@gfa.test')
		->first()
		?: User::query()->where('realm', 'customer')->orderBy('id')->first();
};

$targets = [
	'admin' => $resolveAdmin(),
	'seller' => $resolveSeller(),
	'customer' => $resolveCustomer(),
];

$missing = array_keys(array_filter($targets, static fn (?User $user): bool => $user === null));

if ($missing !== []) {
	fwrite(STDERR, 'No fue posible resolver usuarios locales para: ' . implode(', ', $missing) . PHP_EOL);
	exit(1);
}

$result = [];

foreach ($targets as $channel => $user) {
	if ($channel === 'customer' && $user->email !== $customerLoginEmail) {
		$existingCustomerLogin = User::query()
			->where('email', $customerLoginEmail)
			->where('id', '!=', $user->id)
			->exists();

		if (!$existingCustomerLogin) {
			$user->email = $customerLoginEmail;
		}
	}

	$user->password = $sharedPassword;
	$user->status = 'active';
	$user->force_password_change = false;
	$user->save();

	$result[$channel] = [
		'email' => (string) $user->email,
		'password' => $sharedPassword,
		'realm' => (string) $user->realm,
		'roles' => $user->getRoleNames()->values()->all(),
	];
	}

fwrite(STDOUT, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL);
