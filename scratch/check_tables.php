<?php
$db = new PDO('sqlite:' . __DIR__ . '/../database/database.sqlite');
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_ASSOC);
echo "tables:\n";
foreach ($tables as $t) echo $t['name'] . "\n";
