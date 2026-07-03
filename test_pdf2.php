<?php
require 'vendor/autoload.php';
$pdf = new TCPDF();
$pdf->AddPage();

$html = '<table cellpadding="4" border="0" style="width:100%;">
    <tr>
        <th style="background-color:#1e3d33; color:#fff; border-top-left-radius:10px; border-bottom-left-radius:10px;">Header 1</th>
        <th style="background-color:#1e3d33; color:#fff;">Header 2</th>
        <th style="background-color:#1e3d33; color:#fff; border-top-right-radius:10px; border-bottom-right-radius:10px;">Header 3</th>
    </tr>
    <tr>
        <td style="border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000;">Data 1</td>
        <td style="border-bottom: 1px solid #000;">Data 2</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">Data 3</td>
    </tr>
    <tr>
        <td style="border-left: 1px solid #000; border-right: 1px solid #000; border-bottom: 1px solid #000;">Data 1</td>
        <td style="border-bottom: 1px solid #000;">Data 2</td>
        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000;">Data 3</td>
    </tr>
</table>';

$pdf->writeHTML($html, true, false, true, false, 'C');
$pdf->Output(__DIR__.'/test2.pdf', 'F');
