<?php
require 'vendor/autoload.php';
$pdf = new TCPDF();
$pdf->AddPage();
$pdf->writeHTML('<h2>Test 1: align=center on table</h2>');
$pdf->writeHTML('<table width="60%" align="center" border="1"><tr><td>A</td></tr></table>', true, false, true, false, '');

$pdf->writeHTML('<h2>Test 2: div align=center wrapper</h2>');
$pdf->writeHTML('<div align="center"><table width="60%" border="1"><tr><td>A</td></tr></table></div>', true, false, true, false, '');

$pdf->writeHTML('<h2>Test 3: margin: 0 auto</h2>');
$pdf->writeHTML('<table style="width:60%; margin: 0 auto;" border="1"><tr><td>A</td></tr></table>', true, false, true, false, '');

$pdf->writeHTML('<h2>Test 4: outer table</h2>');
$pdf->writeHTML('<table width="100%"><tr><td align="center"><table width="60%" border="1"><tr><td>A</td></tr></table></td></tr></table>', true, false, true, false, '');

$pdf->Output(__DIR__.'/test.pdf', 'F');
