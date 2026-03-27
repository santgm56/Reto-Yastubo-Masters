<?php

namespace App\Services\Operations;

use App\Models\PlanVersion;
use App\Models\PlanVersionAgeSurcharge;
use Illuminate\Support\Facades\Crypt;

class IssuanceQuoteService
{
    public function buildQuote(PlanVersion $planVersion, array $payload): array
    {
        $customer = $payload['customer'] ?? [];

        $age = (int) ($customer['age'] ?? 0);
        $residenceCountryId = (int) ($customer['residence_country_id'] ?? 0);
        $repatriationCountryId = (int) ($customer['repatriation_country_id'] ?? 0);

        $maxEntryAge = (int) ($planVersion->max_entry_age ?? 0);
        $isAgeEligible = $maxEntryAge <= 0 || ($age > 0 && $age <= $maxEntryAge);

        $hasRepatriationRestrictions = $planVersion->repatriationCountries()->exists();
        $isRepatriationEligible = !$hasRepatriationRestrictions
            || ($repatriationCountryId > 0
                && $planVersion->repatriationCountries()->where('countries.id', $repatriationCountryId)->exists());

        $eligible = $isAgeEligible && $isRepatriationEligible;

        $basePrice = $this->resolveBasePrice($planVersion, $residenceCountryId);
        $surcharge = $this->resolveAgeSurcharge($planVersion, $age, $basePrice);
        $total = round($basePrice + $surcharge['amount'], 2);

        $reasons = [];

        if (!$isAgeEligible) {
            $reasons[] = 'AGE_NOT_ELIGIBLE';
        }

        if (!$isRepatriationEligible) {
            $reasons[] = 'REPATRIATION_COUNTRY_NOT_ALLOWED';
        }

        $quoteData = [
            'plan_version_id' => $planVersion->id,
            'product_id' => (int) $planVersion->product_id,
            'company_id' => (int) $planVersion->product?->company_id,
            'customer' => [
                'document_number' => (string) ($customer['document_number'] ?? ''),
                'full_name' => (string) ($customer['full_name'] ?? ''),
                'age' => $age,
                'sex' => (string) ($customer['sex'] ?? 'M'),
                'residence_country_id' => $residenceCountryId,
                'repatriation_country_id' => $repatriationCountryId,
            ],
            'pricing' => [
                'base_price' => $basePrice,
                'surcharge_percent' => $surcharge['percent'],
                'surcharge_amount' => $surcharge['amount'],
                'total_price' => $total,
            ],
            'eligibility' => [
                'eligible' => $eligible,
                'reasons' => $reasons,
            ],
        ];

        return [
            'quote_id' => $this->encodeQuote($quoteData),
            'eligible' => $eligible,
            'pricing' => $quoteData['pricing'],
            'reasons' => $reasons,
            'plan' => [
                'plan_version_id' => $planVersion->id,
                'name' => $planVersion->name,
                'max_entry_age' => $maxEntryAge,
            ],
        ];
    }

    public function decodeQuote(string $quoteId): array
    {
        $raw = Crypt::decryptString($quoteId);
        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : [];
    }

    protected function encodeQuote(array $quoteData): string
    {
        return Crypt::encryptString(json_encode($quoteData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    protected function resolveBasePrice(PlanVersion $planVersion, int $residenceCountryId): float
    {
        if ($residenceCountryId > 0) {
            $priceByCountry = $planVersion->countries()
                ->where('countries.id', $residenceCountryId)
                ->first()?->pivot?->price;

            if ($priceByCountry !== null) {
                return round((float) $priceByCountry, 2);
            }
        }

        return round((float) ($planVersion->price_1 ?? 0), 2);
    }

    protected function resolveAgeSurcharge(PlanVersion $planVersion, int $age, float $basePrice): array
    {
        if ($age <= 0 || $basePrice <= 0) {
            return [
                'percent' => 0.0,
                'amount' => 0.0,
                'rule_id' => null,
            ];
        }

        $rule = PlanVersionAgeSurcharge::query()
            ->where('plan_version_id', $planVersion->id)
            ->where(function ($query) use ($age) {
                $query->whereNull('age_from')->orWhere('age_from', '<=', $age);
            })
            ->where(function ($query) use ($age) {
                $query->whereNull('age_to')->orWhere('age_to', '>=', $age);
            })
            ->orderByDesc('age_from')
            ->first();

        if (!$rule) {
            return [
                'percent' => 0.0,
                'amount' => 0.0,
                'rule_id' => null,
            ];
        }

        $percent = round((float) ($rule->surcharge_percent ?? 0), 2);

        return [
            'percent' => $percent,
            'amount' => round($basePrice * ($percent / 100), 2),
            'rule_id' => $rule->id,
        ];
    }
}
