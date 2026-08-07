<?php

$db = new PDO('sqlite:' . __DIR__ . '/../database/database.sqlite');
$result1 = $db->query("PRAGMA foreign_key_list(cuenta_banco)")->fetchAll(PDO::FETCH_ASSOC);
$result2 = $db->query("PRAGMA foreign_key_list(cuenta_moneda_extranjera)")->fetchAll(PDO::FETCH_ASSOC);

echo "cuenta_banco FKs: " . json_encode($result1) . "\n";
echo "cuenta_moneda_extranjera FKs: " . json_encode($result2) . "\n";
