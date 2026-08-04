import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const dailySales = [
  { day: '01 Jul', ventas: 4200, costo: 2100 },
  { day: '02 Jul', ventas: 3800, costo: 1900 },
  { day: '03 Jul', ventas: 5600, costo: 2800 },
  { day: '04 Jul', ventas: 4900, costo: 2450 },
  { day: '05 Jul', ventas: 6200, costo: 3100 },
  { day: '06 Jul', ventas: 7100, costo: 3550 },
  { day: '07 Jul', ventas: 5400, costo: 2700 },
  { day: '08 Jul', ventas: 6800, costo: 3400 },
  { day: '09 Jul', ventas: 5200, costo: 2600 },
  { day: '10 Jul', ventas: 7600, costo: 3800 },
  { day: '11 Jul', ventas: 8300, costo: 4150 },
  { day: '12 Jul', ventas: 6900, costo: 3450 },
  { day: '13 Jul', ventas: 7500, costo: 3750 },
  { day: '14 Jul', ventas: 9100, costo: 4550 },
]

const topSoldProducts = [
  { name: 'Cerveza Polar 222ml', units: 1240 },
  { name: 'Ron Santa Teresa', units: 890 },
  { name: 'Refresco Cola 600ml', units: 760 },
  { name: 'Agua Mineral 1.5L', units: 640 },
  { name: 'Whisky Black Label', units: 520 },
]

const topRevenueProducts = [
  { name: 'Whisky Black Label', revenue: 18600 },
  { name: 'Ron Diplomatico', revenue: 14200 },
  { name: 'Cerveza Polar 222ml', revenue: 12400 },
  { name: 'Vino Casillero Del Diablo', revenue: 9800 },
  { name: 'Ron Santa Teresa', revenue: 8900 },
]

const paymentMethods = [
  { name: 'Pago Móvil', value: 38, color: '#1e6b45' },
  { name: 'Efectivo USD', value: 27, color: '#2d9460' },
  { name: 'Zelle', value: 19, color: '#4ab87a' },
  { name: 'Transferencia', value: 11, color: '#7ed4a4' },
  { name: 'Efectivo BsS', value: 5, color: '#b8e8cc' },
]

const stagnantProducts = [
  { name: 'Vino Tinto Reserva 750ml', units: 3, stock: 48, days: 42 },
  { name: 'Coñac Martell VS', units: 5, stock: 24, days: 38 },
  { name: 'Champagne Moët', units: 2, stock: 12, days: 55 },
  { name: 'Tequila José Cuervo', units: 4, stock: 18, days: 30 },
  { name: 'Vodka Absolut 750ml', units: 6, stock: 30, days: 28 },
]

const GROSS_TOTAL = 142_800 + 23_450 + 31_620 + 18_900
const patrimonySlices = [
  { label: 'Inventario Valorizado', raw: 142_800, value: 142_800, pct: (142_800 / GROSS_TOTAL) * 100, color: '#1e6b45', colorLight: '#2d9460', negative: false },
  { label: 'Cuentas por Cobrar', raw: 23_450, value: 23_450, pct: (23_450 / GROSS_TOTAL) * 100, color: '#4ab87a', colorLight: '#7ed4a4', negative: false },
  { label: 'Flujo de Caja Neto', raw: 31_620, value: 31_620, pct: (31_620 / GROSS_TOTAL) * 100, color: '#7ed4a4', colorLight: '#b8e8cc', negative: false },
  { label: 'Cuentas por Pagar', raw: 18_900, value: 18_900, pct: (18_900 / GROSS_TOTAL) * 100, color: '#e05a5a', colorLight: '#f87171', negative: true },
]

const forgottenProducts = [
  { name: 'Cava Freixenet Brut', stock: 6, value: 4200 },
  { name: 'Ginebra Beefeater 1L', stock: 8, value: 5600 },
  { name: 'Vermú Cinzano Bianco', stock: 15, value: 2250 },
  { name: 'Rum Appleton Estate', stock: 4, value: 3120 },
]

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (n: number, prefix = '$') =>
  `${prefix}${n.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtShort = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: string
  accent?: boolean
  hero?: boolean
  trend?: number
}

function KpiCard({ label, value, sub, icon, accent, hero, trend }: KpiCardProps) {
  const isHero = hero
  return (
    <div className={`${isHero ? 'kpi-card-hero' : 'kpi-card'} p-5 flex flex-col gap-3 relative overflow-hidden`}>
      {isHero && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7ed4a4 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        </>
      )}
      <div className="flex items-start justify-between">
        <span className={`text-xs font-medium uppercase tracking-widest ${isHero ? 'text-white/70' : 'text-[#5a7460]'}`}>{label}</span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={isHero
            ? { background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)' }
            : { background: 'linear-gradient(145deg, #f0f5f1, #e8eee9)', boxShadow: '3px 3px 8px rgba(30,107,69,0.08), -2px -2px 6px rgba(255,255,255,0.9)' }
          }
        >
          {icon}
        </span>
      </div>
      <div>
        <div className={`text-2xl mono ${isHero ? 'text-white' : 'text-[#1a2b1f]'}`}>{value}</div>
        {sub && <div className={`text-xs mt-1 ${isHero ? 'text-white/60' : 'text-[#5a7460]'}`}>{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isHero
            ? trend >= 0 ? 'text-white/80' : 'text-red-200'
            : trend >= 0 ? 'text-[#1e6b45]' : 'text-rose-500'
        }`}>
          <span>{trend >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(trend)}% vs período anterior</span>
        </div>
      )}
    </div>
  )
}

interface SectionTitleProps {
  title: string
  subtitle?: string
  badge?: string
}

function SectionTitle({ title, subtitle, badge }: SectionTitleProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="section-header text-xl text-[#1a2b1f]">{title}</h2>
          {badge && (
            <span className="accent-pill text-xs px-3 py-1 font-medium">{badge}</span>
          )}
        </div>
        {subtitle && <p className="text-sm text-[#5a7460] mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="soft-card p-3 text-xs">
      <p className="font-semibold text-[#1a2b1f] mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="mb-1">
          {p.name}: {fmtShort(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const PERIODS = ['Hoy', 'Esta Semana', 'Este Mes', 'Trimestre']

export default function App() {
  const [activePeriod, setActivePeriod] = useState('Este Mes')

  return (
    <div className="page-bg min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50" style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(30,107,69,0.08)',
      }}>
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #1e6b45, #2d9460)', boxShadow: '0 4px 12px rgba(30,107,69,0.35)' }}
            >
              T
            </div>
            <div>
              <h1 className="font-bold text-[#1a2b1f] text-sm leading-tight">Tasca El Rincón</h1>
              <p className="text-[10px] text-[#5a7460] leading-tight">Panel de Control</p>
            </div>
          </div>

          {/* Period selector */}
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: 'linear-gradient(145deg, #e8ede9, #f2f6f2)', boxShadow: 'inset 3px 3px 8px rgba(30,107,69,0.08), inset -2px -2px 6px rgba(255,255,255,0.8)' }}
          >
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200"
                style={activePeriod === p ? {
                  background: 'linear-gradient(135deg, #1e6b45, #2d9460)',
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(30,107,69,0.3)',
                } : { color: '#5a7460' }}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#5a7460]">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: '#2d9460', boxShadow: '0 0 6px rgba(45,148,96,0.6)' }}
            />
            <span>Actualizado: Jul 14, 2026 · 09:42 am</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-6 py-8 space-y-12">

        {/* ── Balance General ───────────────────────────────────────────────── */}
        <section>
          <SectionTitle
            title="Balance General"
            subtitle="Salud financiera actual — independiente del período"
            badge="Hoy"
          />

          {/* Balance KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <KpiCard label="Activos Fijos" value={fmt(142_800)} sub="inventario valorizado" icon="🏪" />
            <KpiCard label="Cuentas por Cobrar" value={fmt(23_450)} sub="ventas a crédito pendientes" icon="📋" trend={-8.3} />
            <KpiCard label="Flujo de Caja Neto" value={fmt(31_620)} sub="efectivo disponible" icon="💵" hero trend={14.7} />
            <KpiCard label="Cuentas por Pagar" value={fmt(18_900)} sub="deuda con proveedores" icon="⚠️" trend={6.1} />
            <KpiCard label="Patrimonio Neto" value={fmt(178_970)} sub="valor real del negocio" icon="🏆" hero trend={11.5} />
          </div>

          {/* Patrimonio breakdown — pie + legend */}
          <div className="soft-card p-6">
            <div className="mb-6">
              <h3 className="section-header text-base text-[#1a2b1f]">Composición del Patrimonio</h3>
              <p className="text-xs text-[#5a7460] mt-1">(Inventario + CxC + Flujo de Caja) − Cuentas por Pagar</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

              {/* Pie */}
              <div className="relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={patrimonySlices}
                      cx="50%" cy="50%"
                      innerRadius={72}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {patrimonySlices.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any, _: any, props: any) => [fmt(props.payload.raw), props.payload.label]}
                      contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute flex flex-col items-center pointer-events-none">
                  <span className="text-[10px] uppercase tracking-widest text-[#5a7460] font-medium">Patrimonio</span>
                  <span className="mono text-2xl text-[#1e6b45]">{fmt(178_970)}</span>
                  <span className="text-[10px] text-[#5a7460] mt-0.5">↑ 11.5% vs anterior</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                {patrimonySlices.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ background: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#1a2b1f] font-medium">{item.label}</span>
                        <span
                          className="mono text-sm ml-2 flex-shrink-0"
                          style={{ color: item.negative ? '#dc2626' : '#1e6b45' }}
                        >
                          {item.negative ? `(${fmt(item.raw)})` : fmt(item.raw)}
                        </span>
                      </div>
                      <div className="mt-1.5 soft-card-inset h-1.5 w-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.pct}%`,
                            background: item.negative
                              ? 'linear-gradient(90deg, #e05a5a, #f87171)'
                              : `linear-gradient(90deg, ${item.color}, ${item.colorLight})`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-[#5a7460] mt-0.5">{item.pct.toFixed(1)}% del total bruto</div>
                    </div>
                  </div>
                ))}

                {/* Total row */}
                <div
                  className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(202,216,204,0.5)]"
                >
                  <span className="text-sm font-semibold text-[#1a2b1f]">Patrimonio Neto Total</span>
                  <span className="mono text-xl text-[#1e6b45]">{fmt(178_970)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,107,69,0.2), transparent)' }} />
          <span className="accent-pill text-xs px-4 py-1.5 font-semibold tracking-wide">📈 Métricas de Ventas</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,107,69,0.2), transparent)' }} />
        </div>

        {/* ── Ventas: KPI Row ────────────────────────────────────────────────── */}
        <section>
          <SectionTitle
            title="Métricas de Ventas"
            subtitle="Rendimiento del período seleccionado"
            badge={activePeriod}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <KpiCard label="Total de Ventas" value="847" sub="tickets / facturas emitidas" icon="🧾" trend={12.4} />
            <KpiCard label="Productos Vendidos" value="4,231" sub="unidades despachadas" icon="📦" trend={8.7} />
            <KpiCard label="Ingresos Totales" value={fmt(98_640)} sub="ventas brutas del período" icon="💰" hero trend={15.2} />
            <KpiCard label="Costo de Ventas" value={fmt(51_290)} sub="costo de adquisición" icon="🏭" trend={-3.1} />
            <KpiCard label="Ganancia Bruta" value={fmt(47_350)} sub="ingresos − costo de ventas" icon="📈" hero trend={18.6} />
            <KpiCard label="Margen Bruto" value="48.0%" sub="ganancia sobre ingresos" icon="🎯" trend={1.4} />
            <KpiCard label="Ticket Promedio" value={fmt(116.46)} sub="gasto promedio por compra" icon="🛒" trend={2.8} />
          </div>
        </section>

        {/* ── Daily Chart + Payment Pie ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Daily Evolution */}
          <div className="xl:col-span-2 soft-card p-6">
            <div className="mb-6">
              <h3 className="section-header text-base text-[#1a2b1f]">Evolución Diaria de Ventas</h3>
              <p className="text-xs text-[#5a7460] mt-1">Ingresos vs Costo — Julio 2026</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailySales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e6b45" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#1e6b45" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,116,96,0.12)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5a7460' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#5a7460', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#5a7460' }} />
                <Line type="monotone" dataKey="ventas" name="Ingresos" stroke="#1e6b45" strokeWidth={2.5} dot={{ r: 3, fill: '#1e6b45' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="costo" name="Costo" stroke="#7ed4a4" strokeWidth={2} strokeDasharray="5 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="soft-card p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="section-header text-base text-[#1a2b1f]">Método de Pago</h3>
              <p className="text-xs text-[#5a7460] mt-1">Distribución del período</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%" cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethods.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2">
                {paymentMethods.map((m, i) => (
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

        {/* ── Top Products ──────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top 5 Más Vendidos */}
          <div className="soft-card p-6">
            <div className="mb-5">
              <h3 className="section-header text-base text-[#1a2b1f]">Top 5 Productos Más Vendidos</h3>
              <p className="text-xs text-[#5a7460] mt-1">Mayor rotación de unidades</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSoldProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,116,96,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#5a7460', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: '#1a2b1f' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} formatter={(v: any) => [`${v} uds`, 'Unidades']} />
                <Bar dataKey="units" radius={[0, 6, 6, 0]}>
                  {topSoldProducts.map((_, i) => (
                    <Cell key={i} fill={`rgba(30,107,69,${1 - i * 0.15})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 Mayor Liquidez */}
          <div className="soft-card p-6">
            <div className="mb-5">
              <h3 className="section-header text-base text-[#1a2b1f]">Top 5 Mayor Liquidez</h3>
              <p className="text-xs text-[#5a7460] mt-1">Productos que más ingresos generan</p>
            </div>
            <div className="space-y-3">
              {topRevenueProducts.map((p, i) => {
                const pct = (p.revenue / topRevenueProducts[0].revenue) * 100
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `rgba(30,107,69,${1 - i * 0.15})` }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#1a2b1f] truncate">{p.name}</span>
                        <span className="mono text-xs font-semibold text-[#1e6b45] ml-2 flex-shrink-0">{fmt(p.revenue)}</span>
                      </div>
                      <div className="soft-card-inset h-2 w-full">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, #1e6b45, #4ab87a)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,107,69,0.2), transparent)' }} />
          <span className="accent-pill text-xs px-4 py-1.5 font-semibold tracking-wide">💼 Métricas de Negocio</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(30,107,69,0.2), transparent)' }} />
        </div>

        {/* ── P&L ──────────────────────────────────────────────────────────── */}
        <section>
          <SectionTitle
            title="Rendimiento Real del Período"
            subtitle="Pérdidas y Ganancias — Julio 2026"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Gastos Operativos" value={fmt(18_400)} sub="egresos del período" icon="💸" trend={5.2} />
            <KpiCard label="Ganancia Neta" value={fmt(28_950)} sub="ganancia bruta − gastos" icon="✅" hero trend={22.1} />
            <KpiCard label="Margen Neto" value="29.4%" sub="sobre ingresos brutos" icon="📊" trend={3.8} />
            <KpiCard label="ROI del Período" value="56.5%" sub="retorno sobre costo total" icon="🚀" hero trend={9.2} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Productos Estancados */}
            <div className="soft-card p-6">
              <div className="mb-5">
                <h3 className="section-header text-base text-[#1a2b1f]">Productos Estancados</h3>
                <p className="text-xs text-[#5a7460] mt-1">Menor salida — candidatos para promoción</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#5a7460] uppercase tracking-wider">
                      <th className="text-left pb-3 font-medium">Producto</th>
                      <th className="text-right pb-3 font-medium">Vendido</th>
                      <th className="text-right pb-3 font-medium">Stock</th>
                      <th className="text-right pb-3 font-medium">Días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagnantProducts.map((p, i) => (
                      <tr key={i} className="border-t border-[rgba(202,216,204,0.4)]">
                        <td className="py-3 font-medium text-[#1a2b1f]">{p.name}</td>
                        <td className="py-3 text-right mono text-amber-600">{p.units} uds</td>
                        <td className="py-3 text-right mono text-[#1a2b1f]">{p.stock}</td>
                        <td className="py-3 text-right">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              background: p.days > 40 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                              color: p.days > 40 ? '#dc2626' : '#d97706',
                            }}
                          >
                            {p.days}d
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Productos Olvidados */}
            <div className="soft-card p-6">
              <div className="mb-5">
                <h3 className="section-header text-base text-[#1a2b1f]">Productos Olvidados</h3>
                <p className="text-xs text-[#5a7460] mt-1">Sin rotación en el período — dinero dormido</p>
              </div>
              <div className="space-y-3">
                {forgottenProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'linear-gradient(145deg, #e8ede9, #f2f6f2)', boxShadow: 'inset 2px 2px 6px rgba(30,107,69,0.08), inset -2px -2px 6px rgba(255,255,255,0.8)' }}>
                    <div>
                      <p className="text-xs font-semibold text-[#1a2b1f]">{p.name}</p>
                      <p className="text-[10px] text-[#5a7460] mt-0.5">{p.stock} unidades en stock</p>
                    </div>
                    <div className="text-right">
                      <p className="mono text-sm font-bold text-rose-500">{fmt(p.value)}</p>
                      <p className="text-[10px] text-[#5a7460]">capital inmovilizado</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(202,216,204,0.4)]">
                  <span className="text-xs font-semibold text-[#5a7460] uppercase tracking-wide">Total Inmovilizado</span>
                  <span className="mono text-sm font-bold text-rose-600">{fmt(forgottenProducts.reduce((a, b) => a + b.value, 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-[#5a7460]">
          <p>Tasca El Rincón · Panel de Control · {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </footer>
      </main>
    </div>
  )
}
