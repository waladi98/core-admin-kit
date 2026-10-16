<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Audit trail: who did what to which record. Written by App\Concerns\LogsActivity and ActivityLog::record().
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('causer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->nullableMorphs('subject');
            $table->string('event', 40)->index(); // created, updated, deleted, signed_in, signed_out, changed
            $table->string('description'); // English text, translated when shown, e.g. "User updated"
            $table->string('subject_label')->nullable(); // name of the record at that moment, kept after deletion
            $table->json('properties')->nullable(); // {"changes": {"field": {"old": …, "new": …}}, …}
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
