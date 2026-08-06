<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Obligaciones</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2563eb;
        }
        .header h1 {
            color: #1e3a8a;
            margin: 0 0 10px 0;
            font-size: 20px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0;
            color: #64748b;
            font-size: 12px;
        }
        .filtros {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background-color: #f1f5f9;
            color: #475569;
            font-size: 10px;
            text-transform: uppercase;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #cbd5e1;
        }
        th.right {
            text-align: right;
        }
        th.center {
            text-align: center;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        td.right {
            text-align: right;
        }
        td.center {
            text-align: center;
        }
        .estado {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
        }
        .estado.PAGADA {
            background-color: #dcfce7;
            color: #166534;
        }
        .estado.PARCIAL {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .estado.PENDIENTE {
            background-color: #ffedd5;
            color: #9a3412;
        }
        .totales-container {
            width: 50%;
            float: right;
        }
        .totales-table {
            width: 100%;
            border: 1px solid #e2e8f0;
        }
        .totales-table th {
            background-color: #f8fafc;
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .totales-table td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
            font-weight: bold;
        }
        .totales-table td.monto {
            text-align: right;
            color: #0f172a;
        }
        .clear {
            clear: both;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }
        .text-red {
            color: #dc2626;
        }
        .text-green {
            color: #16a34a;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Reporte de Cuentas por {{ $tipo === 'COBRAR' ? 'Cobrar' : 'Pagar' }}</h1>
        <p>Fecha de Generación: {{ $fecha_generacion }}</p>
    </div>

    @if(!empty($categoria) || !empty($tercero) || !empty($estado))
    <div class="filtros">
        <strong>Filtros aplicados:</strong> 
        @if(!empty($categoria)) Categoría: "{{ $categoria }}" @endif
        @if(!empty($tercero)) Tercero: "{{ $tercero }}" @endif
        @if(!empty($estado)) Estado: "{{ $estado }}" @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Emisión</th>
                <th>Vencimiento</th>
                <th>Tercero / Categoría</th>
                <th class="center">Moneda</th>
                <th class="right">Deuda</th>
                <th class="right">Abonado</th>
                <th class="right">Restante</th>
                <th class="center">Estado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($obligaciones as $obl)
                @php
                    $restante = $obl->monto_original - $obl->monto_abonado;
                    $moneda_simbolo = $obl->moneda === 'USD' ? '$' : 'Bs.';
                @endphp
                <tr>
                    <td>{{ date('d/m/Y', strtotime($obl->fecha_emision)) }}</td>
                    <td>{{ $obl->fecha_limite ? date('d/m/Y', strtotime($obl->fecha_limite)) : 'Sin límite' }}</td>
                    <td>
                        <strong>{{ $obl->tercero }}</strong><br>
                        <span style="font-size: 10px; color: #64748b;">{{ $obl->categoria }}</span>
                    </td>
                    <td class="center">{{ $obl->moneda }}</td>
                    <td class="right">{{ $moneda_simbolo }} {{ number_format($obl->monto_original, 2, ',', '.') }}</td>
                    <td class="right text-green">{{ $moneda_simbolo }} {{ number_format($obl->monto_abonado, 2, ',', '.') }}</td>
                    <td class="right {{ $restante > 0 ? 'text-red' : '' }}">{{ $moneda_simbolo }} {{ number_format($restante, 2, ',', '.') }}</td>
                    <td class="center">
                        <span class="estado {{ $obl->estado }}">{{ $obl->estado }}</span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="center">No se encontraron registros para los filtros seleccionados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="totales-container">
        <table class="totales-table">
            <thead>
                <tr>
                    <th colspan="2" class="center">TOTALES GLOBALES</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Restante (USD)</td>
                    <td class="monto">$ {{ number_format($totales['USD']['restante'], 2, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Total Restante (VES)</td>
                    <td class="monto">Bs. {{ number_format($totales['VES']['restante'], 2, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="clear"></div>

    <div class="footer">
        Fondo Administrativo UGAVI - Reporte generado automáticamente el {{ $fecha_generacion }}
    </div>

</body>
</html>
