<?php
$d1 = @file_get_contents('https://ve.dolarapi.com/v1/historicos/dolares/oficial/15-05-2024');
$d2 = @file_get_contents('https://ve.dolarapi.com/v1/historicos/dolares/oficial/2024-05-15');
echo "15-05-2024: $d1\n";
echo "2024-05-15: $d2\n";
