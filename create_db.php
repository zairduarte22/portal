<?php
$host = '127.0.0.1';
$port = '5432';
$user = 'postgres';
$pass = '1959';
$db = 'postgres';

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Disconnect active connections to drop it
    $pdo->exec("SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = 'fondo2_main' AND pid <> pg_backend_pid();");
    $pdo->exec("DROP DATABASE IF EXISTS fondo2_main");
    $pdo->exec("CREATE DATABASE fondo2_main");
    echo "Database dropped and recreated successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
