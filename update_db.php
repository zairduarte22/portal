<?php

$json = file_get_contents('data.json');
$excelData = json_decode($json, true);

function normalize($str) {
    if (!$str) return '';
    $str = mb_strtolower(trim($str), 'UTF-8');
    $str = str_replace(
        ['á','é','í','ó','ú','ñ','ä','ë','ï','ö','ü','.',',','-'],
        ['a','e','i','o','u','n','a','e','i','o','u','','',' '],
        $str
    );
    // Remove "c a" or "s a" or "ca" which often differ
    $str = str_replace([' c a ', ' s a ', ' ca ', ' sa '], ' ', ' ' . $str . ' ');
    $str = preg_replace('/[^a-z0-9 ]/', '', $str);
    return trim(preg_replace('/\s+/', ' ', $str));
}

$miembros = DB::table('miembros')->get();
$matched = 0;
$unmatched = 0;

foreach ($excelData as $row) {
    if (empty($row['MIEMBRO'])) continue;
    $normExcel = normalize($row['MIEMBRO']);
    
    $bestMatchId = null;
    
    foreach ($miembros as $m) {
        $normDb = normalize($m->razon_social);
        
        // Exact match
        if ($normExcel === $normDb) {
            $bestMatchId = $m->id;
            break;
        }
        
        // Contains match
        if ($normDb !== '' && $normExcel !== '') {
            if (strpos($normDb, $normExcel) !== false || strpos($normExcel, $normDb) !== false) {
                $bestMatchId = $m->id;
                // Don't break, keep searching for exact
            }
        }
    }
    
    if ($bestMatchId) {
        DB::table('miembros')->where('id', $bestMatchId)->update([
            'municipio' => $row['MUNICIPIO'] ?? null,
            'parroquia' => $row['PARROQUIA'] ?? null,
        ]);
        $matched++;
    } else {
        $unmatched++;
    }
}
echo "Matched: $matched, Unmatched: $unmatched\n";
