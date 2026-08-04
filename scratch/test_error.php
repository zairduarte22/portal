<?php
$ch = curl_init('http://localhost:8000/api/pagos/reporte-general');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
$response = curl_exec($ch);
echo $response;
