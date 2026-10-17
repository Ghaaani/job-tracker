<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'password' => 'secret1',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_register_rejects_duplicate_email_and_short_password(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Test', 'email' => 'test@example.com', 'password' => 'secret1',
        ])->assertUnprocessable();

        $this->postJson('/api/register', [
            'name' => 'Test', 'email' => 'new@example.com', 'password' => '123',
        ])->assertUnprocessable();
    }

    public function test_user_can_login_and_receives_token(): void
    {
        User::factory()->create(['email' => 'test@example.com', 'password' => 'secret1']);

        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'secret1'])
            ->assertOk()
            ->assertJsonStructure(['token', 'token_type', 'user']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'test@example.com', 'password' => 'secret1']);

        $this->postJson('/api/login', ['email' => 'test@example.com', 'password' => 'wrong'])
            ->assertUnauthorized();
    }

    public function test_logout_revokes_tokens(): void
    {
        $user = User::factory()->create();
        $user->createToken('token');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
