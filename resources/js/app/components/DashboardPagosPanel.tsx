import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Wallet, Loader2, Target, AlertTriangle } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, XAxis, YAxis, CartesianGrid, ComposedChart, Line } from 'recharts';

export function DashboardPagosPanel() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('desde', startDate);
      if (endDate) params.append('hasta', endDate);
      
      const res = await fetch(`/api/dashboard-pagos/completo?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setMetrics(json);
      }
    } catch (error) {
      console.error('Error fetching comprehensive dashboard metrics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  if (!metrics && loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-muted-foreground">Cargando métricas complejas del sistema...</p>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6 w-full mx-auto max-w-full">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card p-6 rounded-2xl border shadow-sm" style={{ borderColor: "var(--border)" }}>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--foreground)" }}>
            <Activity size={32} style={{ color: "#3b82f6" }} />
            Dashboard Analítico de Finanzas
            {loading && <Loader2 className="animate-spin w-5 h-5 ml-2 text-blue-500" />}
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
            Informe de Gestión Financiera. Visualiza ingresos, mora, activos y el impacto de la devaluación.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Desde:</span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-background" 
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Hasta:</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-background" 
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>
          <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              Refrescar
          </button>
        </div>
      </div>

      {/* Fila 1: KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Flujo de Caja (Total Ingresos) */}
        <div className="bg-card rounded-2xl border p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign size={100} className="text-green-500" />
          </div>
          <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} />
            </div>
            Ingresos Totales (Flujo Caja)
          </div>
          <h2 className="text-4xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            ${Number(metrics.flujo_caja.ingresos_totales).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h2>
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm text-gray-500 font-medium">
              Fondo de Reserva (20%): <span className="text-green-600 font-bold">${Number(metrics.flujo_caja.ingresos_20_porciento).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </p>
          </div>
        </div>

        {/* Saldos Bancos (Simulados de ingresos BS) */}
        <div className="bg-card rounded-2xl border p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Wallet size={100} className="text-blue-500" />
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet size={20} />
            </div>
            Saldos Movilizados
          </div>
          <div className="flex flex-col gap-3">
            {metrics.flujo_caja.saldos_bancos && metrics.flujo_caja.saldos_bancos.length > 0 ? (
                metrics.flujo_caja.saldos_bancos.map((banco: any, index: number) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: "var(--border)" }}>
                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{banco.banco}</span>
                        <span className="text-lg font-black" style={{ color: banco.moneda === 'VES' ? '#3b82f6' : '#10b981' }}>
                            {banco.moneda === 'VES' ? 'Bs.' : '$'} {Number(banco.saldo).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                    </div>
                ))
            ) : (
                <div className="text-sm text-gray-400">No hay bancos registrados</div>
            )}
          </div>
        </div>

        {/* Cuentas por Cobrar */}
        <div className="bg-card rounded-2xl border p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target size={100} className="text-purple-500" />
          </div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target size={20} />
            </div>
            Total Activos CXC
          </div>
          <h2 className="text-4xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            ${Number(metrics.cuentas_por_cobrar.total_usd).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h2>
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm text-red-500 font-medium flex items-center gap-1">
              <TrendingDown size={14} />
              Desfase Devaluación: -${Number(metrics.cuentas_por_cobrar.devaluacion).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </p>
          </div>
        </div>

        {/* Miembros Solventes */}
        <div className="bg-card rounded-2xl border p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Users size={100} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users size={20} />
            </div>
            Miembros Solventes
          </div>
          <h2 className="text-4xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
            {metrics.morosidad.solventes} <span className="text-lg text-gray-400">/ {metrics.morosidad.total_miembros}</span>
          </h2>
          <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm text-gray-500 font-medium">
              Porcentaje solvencia: <span className="text-emerald-600 font-bold">{Math.round((metrics.morosidad.solventes / metrics.morosidad.total_miembros) * 100)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Fila 2: Gráficos (Mora, Distribución CXC, Ingresos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Semáforo de Morosidad */}
        <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold text-lg w-full text-left mb-4" style={{ color: "var(--foreground)" }}>Semáforo de Morosidad</h3>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.morosidad.grafico}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.morosidad.grafico.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución Activos CXC */}
        <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold text-lg w-full text-left mb-4" style={{ color: "var(--foreground)" }}>Distribución de Activos (CXC)</h3>
          <div className="w-full h-[250px]">
            {metrics.cuentas_por_cobrar.distribucion.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.cuentas_por_cobrar.distribucion}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                  >
                    {metrics.cuentas_por_cobrar.distribucion.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString('en-US', {minimumFractionDigits:2})}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Sin cuentas por cobrar</div>
            )}
          </div>
        </div>

        {/* Ingresos por Mes */}
        <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold text-lg w-full text-left mb-4" style={{ color: "var(--foreground)" }}>Ingresos Recibidos por Mes</h3>
          <div className="w-full h-[250px]">
            {metrics.ingresos_mensuales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.ingresos_mensuales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'ingresos') return [`$${value.toLocaleString('en-US', {minimumFractionDigits:2})}`, 'Ingresos USD'];
                      if (name === 'personas') return [value, 'Personas'];
                      return [value, name];
                    }} 
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="ingresos" name="Ingresos" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="personas" name="Personas" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No hay pagos registrados</div>
            )}
          </div>
        </div>

      </div>

      {/* Fila 3: Cuentas Por Pagar Especiales y Resumen Desfase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resumen Devaluación Global */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-none p-8 flex flex-col gap-2 relative overflow-hidden shadow-lg text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={120} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">Desfase Global por Devaluación</h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mt-2">
            <div>
              <p className="text-sm text-gray-400 font-medium">Impacto Neto Total</p>
              <h2 className="text-5xl font-black mt-1">
                <span className={Number(metrics.desfase_total) > 0 ? "text-green-400" : "text-red-400"}>
                  {Number(metrics.desfase_total) > 0 ? "+" : "-"}${Math.abs(Number(metrics.desfase_total)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </h2>
            </div>
            
            <div className="flex-1 space-y-3 w-full border-l border-gray-700 pl-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Pérdida en Ingresos:</span>
                <span className="text-red-400 font-bold">-${Number(metrics.flujo_caja.devaluacion_ingresos).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Pérdida en Activos (CXC):</span>
                <span className="text-red-400 font-bold">-${Number(metrics.cuentas_por_cobrar.devaluacion).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-2">
                <span className="text-gray-400">Ahorro en Pasivos (CXP):</span>
                <span className="text-green-400 font-bold">+${Number(metrics.cuentas_por_pagar.devaluacion).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cuenta por Pagar Especial (9000) */}
        {metrics.cuentas_por_pagar.deuda_especial ? (
          <div className="bg-card rounded-2xl border p-8 flex flex-col gap-4 relative overflow-hidden shadow-sm" style={{ borderColor: "var(--border)" }}>
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <AlertTriangle size={100} className="text-orange-500" />
            </div>
            <div className="flex items-center gap-2 text-orange-600 font-bold">
              <AlertTriangle size={20} />
              Seguimiento de Pasivo Importante
            </div>
            
            <h3 className="text-2xl font-black" style={{ color: "var(--foreground)" }}>
              {metrics.cuentas_por_pagar.deuda_especial.descripcion}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Monto Original Emisión</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
                  {Number(metrics.cuentas_por_pagar.deuda_especial.monto_original).toLocaleString()} {metrics.cuentas_por_pagar.deuda_especial.moneda}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Valuado a: ${Number(metrics.cuentas_por_pagar.deuda_especial.valor_usd_original).toLocaleString('en-US', {minimumFractionDigits:2})}
                </p>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mb-1">Valor Restante Actual</p>
                <p className="text-2xl font-black text-orange-700 dark:text-orange-300">
                  ${Number(metrics.cuentas_por_pagar.deuda_especial.valor_usd_actual).toLocaleString('en-US', {minimumFractionDigits:2})}
                </p>
                <p className="text-sm text-green-600 mt-1 font-semibold flex items-center gap-1">
                  <TrendingDown size={14} />
                  Ahorro: ${Number(metrics.cuentas_por_pagar.deuda_especial.ahorro_devaluacion).toLocaleString('en-US', {minimumFractionDigits:2})}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Emitida el: {metrics.cuentas_por_pagar.deuda_especial.fecha_emision}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border p-8 flex flex-col items-center justify-center shadow-sm text-gray-400 text-center" style={{ borderColor: "var(--border)" }}>
            <Wallet size={48} className="mb-4 opacity-20" />
            No hay cuentas por pagar importantes registradas en el sistema.
          </div>
        )}

      </div>
    </div>
  );
}
