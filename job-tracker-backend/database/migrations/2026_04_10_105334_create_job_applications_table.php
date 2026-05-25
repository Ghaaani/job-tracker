<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up()
{
    Schema::create('job_applications', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('company_name');
        $table->string('position');
        $table->string('status');
        $table->text('notes')->nullable();
        $table->date('date_applied');
        $table->text('application_link')->nullable();
        $table->timestamps();
    });
    }
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
        
    }

    
};
