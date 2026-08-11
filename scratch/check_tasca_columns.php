<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$results = [];

// Tables
$results['tables'] = DB::select("SELECT tablename as name FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%tasca%'");

// Columns
$results['columns'] = DB::select("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name LIKE '%tasca%'");

// Sequences
$results['sequences'] = DB::select("SELECT sequence_name as name FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name LIKE '%tasca%'");

// Indexes
$results['indexes'] = DB::select("SELECT indexname as name, tablename FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%tasca%'");

// Constraints
$results['constraints'] = DB::select("SELECT conname as name FROM pg_constraint WHERE conname LIKE '%tasca%'");

echo json_encode($results, JSON_PRETTY_PRINT);
