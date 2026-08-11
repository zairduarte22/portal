<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$up = [];
$down = [];

// Sequences
$sequences = DB::select("SELECT sequence_name as name FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name LIKE '%tasca%'");
foreach ($sequences as $seq) {
    $old = $seq->name;
    $new = str_replace('tasca', 'tienda', $old);
    $up[] = "DB::statement('ALTER SEQUENCE \"$old\" RENAME TO \"$new\"');";
    $down[] = "DB::statement('ALTER SEQUENCE \"$new\" RENAME TO \"$old\"');";
}

// Indexes
$indexes = DB::select("SELECT indexname as name, tablename FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%tasca%'");
foreach ($indexes as $idx) {
    $old = $idx->name;
    $new = str_replace('tasca', 'tienda', $old);
    // Be careful not to rename constraints that are primary keys via ALTER INDEX if they are managed as constraints
    // Actually, in Postgres, renaming the index also renames the constraint for PKs, but it's safer to use ALTER INDEX for indexes.
    $up[] = "DB::statement('ALTER INDEX \"$old\" RENAME TO \"$new\"');";
    $down[] = "DB::statement('ALTER INDEX \"$new\" RENAME TO \"$old\"');";
}

// Constraints (excluding those that are also indexes to avoid renaming twice, e.g. PK/Unique constraints)
$indexNames = array_map(function($i) { return $i->name; }, $indexes);
$constraints = DB::select("
    SELECT conname as name, relname as tablename 
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE conname LIKE '%tasca%'
");
foreach ($constraints as $con) {
    $old = $con->name;
    // Skip if it was already renamed as an index
    if (in_array($old, $indexNames)) {
        continue;
    }
    $new = str_replace('tasca', 'tienda', $old);
    $table = $con->tablename;
    $up[] = "DB::statement('ALTER TABLE \"$table\" RENAME CONSTRAINT \"$old\" TO \"$new\"');";
    $down[] = "DB::statement('ALTER TABLE \"$table\" RENAME CONSTRAINT \"$new\" TO \"$old\"');";
}

$upCode = implode("\n        ", $up);
$downCode = implode("\n        ", $down);

$migrationContent = <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $upCode
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $downCode
    }
};
PHP;

file_put_contents('scratch/rename_tasca_objects_migration.php.stub', $migrationContent);
echo "Migration stub generated.\n";
