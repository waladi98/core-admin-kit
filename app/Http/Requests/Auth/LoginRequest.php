<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserStatus;
use App\Http\Middleware\EnsureUserIsActive;
use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Check the credentials and sign the user in.
     *
     * Users with two-factor authentication are not signed in yet: they are remembered
     * in the session (`login.id`, read by Fortify) and must pass the two-factor challenge.
     *
     * @return bool True when the two-factor challenge is still required.
     *
     * @throws ValidationException
     */
    public function authenticate(): bool
    {
        $this->ensureIsNotRateLimited();

        $provider = Auth::guard('web')->getProvider();
        $user = $provider->retrieveByCredentials($this->only('email'));

        if (! $user instanceof User || ! $provider->validateCredentials($user, $this->only('password'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($user->status === UserStatus::Inactive) {
            throw ValidationException::withMessages([
                'email' => __(EnsureUserIsActive::INACTIVE_MESSAGE),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        if ($user->hasEnabledTwoFactorAuthentication()) {
            $this->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $this->boolean('remember'),
            ]);

            return true;
        }

        Auth::guard('web')->login($user, $this->boolean('remember'));

        return false;
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
