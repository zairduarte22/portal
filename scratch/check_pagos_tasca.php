<?php
$db = new PDO('sqlite:' . __DIR__ . '/../database/database.sqlite');
$cols = $db->query("PRAGMA table_info(pagos_tasca)")->fetchAll(PDO::FETCH_ASSOC);
echo "pagos_tasca cols: \n";
print_r($cols);
