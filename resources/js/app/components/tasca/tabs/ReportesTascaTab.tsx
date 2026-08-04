import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

export function ReportesTascaTab() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return format(d, 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRendimiento = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = `?start_date=${startDate}&end_date=${endDate}`;
      const res = await fetch(`/api/tasca/reportes/rendimiento${query}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP Error ${res.status}: ${text.substring(0, 100)}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRendimiento();
  }, [startDate, endDate]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.grafica_ventas_diarias || [];
  }, [data]);

  if (!data && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e6b45]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mt-4">
        <h3 className="font-bold">Error de Carga</h3>
        <p>{error}</p>
      </div>
    );
  }

  const { kpis, finanzas, top_liquidez, top_salida, ventas_por_metodo, menos_salida, olvidados } = data || {};
  
  const fmt = (n: number, prefix = '$') =>
    `${prefix}${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtShort = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

  const GROSS_TOTAL = finanzas ? (finanzas.inventario_valorizado + finanzas.cuentas_por_cobrar + finanzas.flujo_caja_neto + finanzas.cuentas_por_pagar) : 1;
  const safeDiv = (val: number) => GROSS_TOTAL > 0 ? (val / GROSS_TOTAL) * 100 : 0;

  const patrimonySlices = finanzas ? [
    { label: 'Inventario Valorizado', raw: finanzas.inventario_valorizado, value: finanzas.inventario_valorizado, pct: safeDiv(finanzas.inventario_valorizado), color: '#1e6b45', colorLight: '#2d9460', negative: false },
    { label: 'Cuentas por Cobrar', raw: finanzas.cuentas_por_cobrar, value: finanzas.cuentas_por_cobrar, pct: safeDiv(finanzas.cuentas_por_cobrar), color: '#4ab87a', colorLight: '#7ed4a4', negative: false },
    { label: 'Flujo de Caja Neto', raw: finanzas.flujo_caja_neto, value: finanzas.flujo_caja_neto, pct: safeDiv(finanzas.flujo_caja_neto), color: '#7ed4a4', colorLight: '#b8e8cc', negative: false },
    { label: 'Cuentas por Pagar', raw: finanzas.cuentas_por_pagar, value: finanzas.cuentas_por_pagar, pct: safeDiv(finanzas.cuentas_por_pagar), color: '#e05a5a', colorLight: '#f87171', negative: true },
  ] : [];

  const patrimonioNeto = finanzas ? (finanzas.inventario_valorizado + finanzas.cuentas_por_cobrar + finanzas.flujo_caja_neto) - finanzas.cuentas_por_pagar : 0;

  const totalMetodos = ventas_por_metodo?.reduce((acc: number, curr: any) => acc + curr.monto, 0) || 1;
  const paymentColors = ['#1e6b45', '#2d9460', '#4ab87a', '#7ed4a4', '#b8e8cc'];
  const paymentMethodsList = ventas_por_metodo?.map((m: any, i: number) => ({
    name: m.metodo,
    value: parseFloat(((m.monto / totalMetodos) * 100).toFixed(1)),
    monto: m.monto,
    color: paymentColors[i % paymentColors.length]
  })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="soft-card p-3 text-xs">
        <p className="font-semibold text-[#1a2b1f] mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="mb-1">
            {p.name}: {fmtShort(p.value)}
          </p>
        ))}
      </div>
    );
  };

  const KpiCard = ({ label, value, sub, icon, hero }: any) => (
    <div className={`${hero ? 'kpi-card-hero' : 'kpi-card'} p-5 flex flex-col gap-3 relative overflow-hidden`}>
      {hero && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7ed4a4 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        </>
      )}
      <div className="flex items-start justify-between">
        <span className={`text-xs font-medium uppercase tracking-widest ${hero ? 'text-white/70' : 'text-[#5a7460]'}`}>{label}</span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={hero
            ? { background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }
            : { background: 'linear-gradient(145deg, #f0f5f1, #e8eee9)', boxShadow: '3px 3px 8px rgba(30,107,69,0.08), -2px -2px 6px rgba(255,255,255,0.9)' }
          }
        >
          {icon}
        </span>
      </div>
      <div>
        <div className={`text-2xl mono ${hero ? 'text-white' : 'text-[#1a2b1f]'}`}>{value}</div>
        {sub && <div className={`text-xs mt-1 ${hero ? 'text-white/60' : 'text-[#5a7460]'}`}>{sub}</div>}
      </div>
    </div>
  );

  const SectionTitle = ({ title, subtitle, badge }: any) => (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="section-header text-xl text-[#1a2b1f]">{title}</h2>
          {badge && <span className="accent-pill text-xs px-3 py-1 font-medium">{badge}</span>}
        </div>
        {subtitle && <p className="text-sm text-[#5a7460] mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div>
      
      {/* Header Interactivo */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1a2b1f] tracking-tight">Panel de Control Financiero</h1>
          <p className="text-sm text-[#5a7460] mt-1">Estado de resultados y patrimonio de la empresa.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border shadow-sm">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700 outline-none"
          />
        </div>
      </div>

      <div className="page-bg -mx-8 px-8 py-8 min-h-screen pb-20">
      {data && (
        <div className="space-y-12">
          
          {/* BALANCE GENERAL */}
          <section>
            <SectionTitle title="Balance General" subtitle="Salud financiera actual — independiente del período" badge="Hoy" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
              <KpiCard label="Activos Fijos" value={fmt(finanzas?.inventario_valorizado || 0)} sub="inventario valorizado" icon="🏪" />
              <KpiCard label="Cuentas por Cobrar" value={fmt(finanzas?.cuentas_por_cobrar || 0)} sub="ventas a crédito pendientes" icon="📋" />
              <KpiCard label="Flujo de Caja Neto" value={fmt(finanzas?.flujo_caja_neto || 0)} sub="efectivo disponible" icon="💵" hero />
              <KpiCard label="Cuentas por Pagar" value={fmt(finanzas?.cuentas_por_pagar || 0)} sub="deuda con proveedores" icon="⚠️" />
              <KpiCard label="Patrimonio Neto" value={fmt(patrimonioNeto)} sub="valor real del negocio" icon="🏆" hero />
            </div>

            <div className="soft-card p-6">
              <div className="mb-6">
                <h3 className="section-header text-base text-[#1a2b1f]">Composición del Patrimonio</h3>
                <p className="text-xs text-[#5a7460] mt-1">(Inventario + CxC + Flujo de Caja) − Cuentas por Pagar</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={patrimonySlices} cx="50%" cy="50%" innerRadius={72} outerRadius={110} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        {patrimonySlices.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip formatter={(v: any, _: any, props: any) => [fmt(props.payload.raw), props.payload.label]} contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center pointer-events-none">
                    <span className="text-[10px] uppercase tracking-widest text-[#5a7460] font-medium">Patrimonio</span>
                    <span className="mono text-2xl text-[#1e6b45]">{fmt(patrimonioNeto)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {patrimonySlices.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#1a2b1f] font-medium">{item.label}</span>
                          <span className="mono text-sm ml-2 flex-shrink-0" style={{ color: item.negative ? '#dc2626' : '#1e6b45' }}>
                            {item.negative ? `(${fmt(item.raw)})` : fmt(item.raw)}
                          </span>
                        </div>
                        <div className="mt-1.5 soft-card-inset h-1.5 w-full">
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.negative ? 'linear-gradient(90deg, #e05a5a, #f87171)' : `linear-gradient(90deg, ${item.color}, ${item.colorLight})` }} />
                        </div>
                        <div className="text-[10px] text-[#5a7460] mt-0.5">{item.pct.toFixed(1)}% del total bruto</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(202,216,204,0.5)]">
                    <span className="text-sm font-semibold text-[#1a2b1f]">Patrimonio Neto Total</span>
                    <span className="mono text-xl text-[#1e6b45]">{fmt(patrimonioNeto)}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DIVIDER */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,107,69,0.2), transparent)' }} />
            <span className="accent-pill text-xs px-4 py-1.5 font-semibold tracking-wide">💼 Resultados del Período</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,107,69,0.2), transparent)' }} />
          </div>

          {/* P&L */}
          <section>
            <SectionTitle title="Rendimiento y P&L" subtitle="Pérdidas y Ganancias" badge={`${startDate} / ${endDate}`} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Ventas Totales ($)" value={fmt(kpis?.ingresos_totales || 0)} sub="ingresos brutos" icon="💰" />
              <KpiCard label="Costo de Ventas" value={fmt(kpis?.costo_total || 0)} sub="costo de los productos" icon="🏭" />
              <KpiCard label="Gastos Operativos" value={fmt(kpis?.gastos_periodo || 0)} sub="egresos del período" icon="💸" />
              <KpiCard label="Ganancia Neta" value={fmt(kpis?.ganancia_neta || 0)} sub="ingresos - (costo + gastos)" icon="✅" hero />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <KpiCard label="Margen Bruto" value={`${(kpis?.margen || 0).toFixed(1)}%`} sub="rentabilidad sobre producto" icon="🎯" />
              <KpiCard label="Margen Neto" value={`${kpis?.ingresos_totales > 0 ? ((kpis.ganancia_neta / kpis.ingresos_totales) * 100).toFixed(1) : 0}%`} sub="sobre ingresos brutos" icon="📊" />
              <KpiCard label="Facturas Emitidas" value={`${kpis?.total_ventas || 0}`} sub="cantidad de ventas" icon="🧾" />
              <KpiCard label="Ticket Promedio" value={fmt(kpis?.ticket_promedio || 0)} sub="gasto por cliente" icon="🛒" />
            </div>
          </section>

          {/* GRÁFICOS */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 soft-card p-6">
              <div className="mb-6">
                <h3 className="section-header text-base text-[#1a2b1f]">Evolución Diaria de Ventas</h3>
                <p className="text-xs text-[#5a7460] mt-1">Ingresos generados por día</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,116,96,0.12)" />
                  <XAxis dataKey="fecha" tickFormatter={(val) => format(new Date(val + 'T12:00:00Z'), 'dd MMM')} tick={{ fontSize: 10, fill: '#5a7460' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#5a7460', fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={v => fmtShort(v)} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#5a7460' }} />
                  <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#1e6b45" strokeWidth={2.5} dot={{ r: 3, fill: '#1e6b45' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="soft-card p-6 flex flex-col">
              <div className="mb-6">
                <h3 className="section-header text-base text-[#1a2b1f]">Método de Pago</h3>
                <p className="text-xs text-[#5a7460] mt-1">Distribución de ingresos</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={paymentMethodsList} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                      {paymentMethodsList.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2">
                  {paymentMethodsList.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                        <span className="text-[#1a2b1f]">{m.name}</span>
                      </div>
                      <span className="mono font-medium text-[#1a2b1f]">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* LISTAS TOP */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="soft-card p-6">
              <div className="mb-5">
                <h3 className="section-header text-base text-[#1a2b1f]">Top 5 Mayor Rotación</h3>
                <p className="text-xs text-[#5a7460] mt-1">Productos más vendidos (unidades)</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={top_salida || []} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,116,96,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#5a7460', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 10, fill: '#1a2b1f' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} formatter={(v: any) => [`${v} uds`, 'Cantidad']} />
                  <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                    {(top_salida || []).map((_: any, i: number) => (
                      <Cell key={i} fill={`rgba(30,107,69,${1 - i * 0.15})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="soft-card p-6">
              <div className="mb-5">
                <h3 className="section-header text-base text-[#1a2b1f]">Top 5 Mayor Liquidez</h3>
                <p className="text-xs text-[#5a7460] mt-1">Productos que más ingresos generan</p>
              </div>
              <div className="space-y-3">
                {top_liquidez?.map((p: any, i: number) => {
                  const maxRevenue = top_liquidez[0]?.ingresos || 1;
                  const pct = (p.ingresos / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: `rgba(30,107,69,${1 - i * 0.15})` }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#1a2b1f] truncate">{p.nombre}</span>
                          <span className="mono text-xs font-semibold text-[#1e6b45] ml-2 flex-shrink-0">{fmt(p.ingresos)}</span>
                        </div>
                        <div className="soft-card-inset h-2 w-full">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #1e6b45, #4ab87a)` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ESTANCADOS Y OLVIDADOS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="soft-card p-6">
              <div className="mb-5">
                <h3 className="section-header text-base text-[#1a2b1f]">Productos Estancados</h3>
                <p className="text-xs text-[#5a7460] mt-1">Menor salida en el período</p>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[300px] pr-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#5a7460] uppercase tracking-wider">
                      <th className="text-left pb-3 font-medium">Producto</th>
                      <th className="text-right pb-3 font-medium">Vendido</th>
                      <th className="text-right pb-3 font-medium">Ingreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menos_salida?.map((p: any, i: number) => (
                      <tr key={i} className="border-t border-[rgba(202,216,204,0.4)]">
                        <td className="py-3 font-medium text-[#1a2b1f]">{p.nombre}</td>
                        <td className="py-3 text-right mono text-amber-600">{p.cantidad} uds</td>
                        <td className="py-3 text-right mono text-[#1e6b45]">{fmt(p.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!menos_salida?.length && <p className="text-sm text-gray-500 text-center py-4">No hay datos suficientes.</p>}
              </div>
            </div>

            <div className="soft-card p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="section-header text-base text-[#1a2b1f]">Productos Olvidados</h3>
                  <p className="text-xs text-[#5a7460] mt-1">Sin rotación (0 ventas) en su historial</p>
                </div>
                {olvidados?.length > 0 && (
                  <span className="accent-pill px-3 py-1 text-xs font-bold shadow-sm whitespace-nowrap">
                    {olvidados.length} total
                  </span>
                )}
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {olvidados?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'linear-gradient(145deg, #e8ede9, #f2f6f2)', boxShadow: 'inset 2px 2px 6px rgba(30,107,69,0.08), inset -2px -2px 6px rgba(255,255,255,0.8)' }}>
                    <div>
                      <p className="text-xs font-semibold text-[#1a2b1f] truncate max-w-[200px]">{p.nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="mono text-sm font-bold text-rose-500">0 uds</p>
                      <p className="text-[10px] text-[#5a7460]">vendidas</p>
                    </div>
                  </div>
                ))}
                {!olvidados?.length && <p className="text-sm text-gray-500 text-center py-4">No hay productos olvidados.</p>}
              </div>
            </div>
          </section>

        </div>
      )}
      </div>
    </div>
  );
}
