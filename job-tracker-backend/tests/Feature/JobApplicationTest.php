<?php

namespace Tests\Feature;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'company_name' => 'Acme',
            'position' => 'Junior Developer',
            'status' => 'applied',
        ], $overrides);
    }

    public function test_jobs_endpoints_require_authentication(): void
    {
        $this->getJson('/api/jobs')->assertUnauthorized();
        $this->postJson('/api/jobs', $this->payload())->assertUnauthorized();
        $this->putJson('/api/jobs/1', $this->payload())->assertUnauthorized();
        $this->deleteJson('/api/jobs/1')->assertUnauthorized();
    }

    public function test_user_can_create_and_list_their_jobs(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->postJson('/api/jobs', $this->payload())
            ->assertOk()
            ->assertJsonPath('user_id', $user->id);

        $this->getJson('/api/jobs')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.company_name', 'Acme');
    }

    public function test_user_only_sees_their_own_jobs(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        JobApplication::create($this->payload(['user_id' => $other->id, 'date_applied' => now()]));

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/jobs')
            ->assertOk()
            ->assertJsonCount(0);
    }

    public function test_store_validates_required_fields_and_link(): void
    {
        $this->actingAs(User::factory()->create(), 'sanctum');

        $this->postJson('/api/jobs', [])->assertUnprocessable();
        $this->postJson('/api/jobs', $this->payload(['application_link' => 'not a url']))
            ->assertUnprocessable();
    }

    public function test_user_can_update_and_delete_own_job(): void
    {
        $user = User::factory()->create();
        $job = JobApplication::create($this->payload(['user_id' => $user->id, 'date_applied' => now()]));
        $this->actingAs($user, 'sanctum');

        $this->putJson("/api/jobs/{$job->id}", $this->payload([
            'status' => 'interview',
            'date_applied' => now()->toDateString(),
        ]))->assertOk()->assertJsonPath('status', 'interview');

        $this->deleteJson("/api/jobs/{$job->id}")->assertOk();
        $this->assertDatabaseMissing('job_applications', ['id' => $job->id]);
    }

    public function test_user_cannot_modify_someone_elses_job(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $job = JobApplication::create($this->payload(['user_id' => $owner->id, 'date_applied' => now()]));
        $this->actingAs($intruder, 'sanctum');

        $this->putJson("/api/jobs/{$job->id}", $this->payload(['date_applied' => now()->toDateString()]))
            ->assertForbidden();
        $this->deleteJson("/api/jobs/{$job->id}")->assertForbidden();
        $this->assertDatabaseHas('job_applications', ['id' => $job->id]);
    }
}
