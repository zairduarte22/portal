import { Users, TrendingUp, AlertTriangle, CheckCircle, Tractor, Droplets } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { miembros } from "./mockData";

const SOLVENCIA_COLORS: Record<string, string> = {
  Solvente: "#22c55e",
  Insolvente: "#ef4444",
  En_Mora: "#f59e0b",
  Exonerado: "#818cf8",
};

const EXPLT_COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#f59e0b", "#fb923c"];

function StatCard({
  title, value, sub, icon: Icon, gradient, iconBg, iconColor, trend,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; gradient: string; iconBg: string; iconColor: string; trend?: string;
}) {
  return (
    <div
      className="relative rounded-3xl p-5 overflow-hidden"
      style={{
        background: gradient,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        {trend && (
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.6)", color: "#166534", fontWeight: 700 }}
          >
            {trend}
          </span>
        )}
      </div>
      <p
        className="text-3xl mb-0.5"
        style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#0d1f14" }}
      >
        {value}
      </p>
      <p className="text-sm" style={{ color: "#4d7a5e", fontWeight: 500 }}>{title}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#6b9e7a", opacity: 0.8 }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl px-4 py-3 shadow-xl" style={{ backgroundColor: "#0a1f12", border: "1px solid rgba(34,197,94,0.2)" }}>
        <p className="text-xs mb-1" style={{ color: "#6ee7b7", fontWeight: 600 }}>{label}</p>
        <p className="text-sm" style={{ color: "#ffffff", fontWeight: 700 }}>{payload[0].value?.toLocaleString("es-VE")}</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const total = miembros.length;
  const solventes = miembros.filter((m) => m.solvencia === "Solvente").length;
  const conMora = miembros.filter((m) => m.solvencia === "En_Mora" || m.solvencia === "Insolvente").length;
  const totalHectareas = miembros.reduce((a, m) => a + m.hectareas, 0);
  const totalAnimales = miembros.reduce((a, m) => a + m.cantidad_animales, 0);
  const totalLeche = miembros.reduce((a, m) => a + m.produccion_leche_diaria, 0);
  const totalPendiente = miembros.reduce((a, m) => a + m.saldo_pendiente, 0);

  const solvenciaData = Object.entries(
    miembros.reduce<Record<string, number>>((acc, m) => { acc[m.solvencia] = (acc[m.solvencia] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name: name.replace("_", " "), value, key: name }));

  const explotacionData = Object.entries(
    miembros.reduce<Record<string, number>>((acc, m) => { acc[m.tipo_explotacion] = (acc[m.tipo_explotacion] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const hectareasByMember = [...miembros]
    .sort((a, b) => b.hectareas - a.hectareas)
    .slice(0, 6)
    .map((m) => ({ name: m.acronimo, hectareas: m.hectareas }));

  return (
    <div className="space-y-7">
      <div>
        <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Resumen general del estado de los miembros registrados
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          title="Total Miembros"
          value={total}
          sub={`${solventes} solventes activos`}
          icon={Users}
          gradient="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
          iconBg="rgba(22,163,74,0.15)"
          iconColor="#16a34a"
          trend={`${Math.round((solventes/total)*100)}%`}
        />
        <StatCard
          title="Con Deuda / Mora"
          value={conMora}
          sub={`Bs. ${totalPendiente.toLocaleString("es-VE")} pendientes`}
          icon={AlertTriangle}
          gradient="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          iconBg="rgba(217,119,6,0.15)"
          iconColor="#d97706"
        />
        <StatCard
          title="Solventes"
          value={solventes}
          sub={`${Math.round((solventes/total)*100)}% del padrón`}
          icon={CheckCircle}
          gradient="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
          iconBg="rgba(22,163,74,0.15)"
          iconColor="#15803d"
        />
        <StatCard
          title="Total Hectáreas"
          value={totalHectareas.toLocaleString("es-VE")}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
          iconBg="rgba(2,132,199,0.15)"
          iconColor="#0284c7"
        />
        <StatCard
          title="Total Animales"
          value={totalAnimales.toLocaleString("es-VE")}
          icon={Tractor}
          gradient="linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)"
          iconBg="rgba(124,58,237,0.15)"
          iconColor="#7c3aed"
        />
        <StatCard
          title="Leche Diaria (L)"
          value={totalLeche.toLocaleString("es-VE")}
          icon={Droplets}
          gradient="linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)"
          iconBg="rgba(8,145,178,0.15)"
          iconColor="#0891b2"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div
          className="bg-card rounded-3xl p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)", border: "1px solid var(--border)" }}
        >
          <h3 className="mb-5" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 700 }}>
            Estado de Solvencia
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={solvenciaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {solvenciaData.map((entry, i) => (
                    <Cell key={i} fill={SOLVENCIA_COLORS[entry.key] || "#94a3b8"} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2.5">
              {solvenciaData.map((entry) => (
                <div key={entry.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SOLVENCIA_COLORS[entry.key] }} />
                    <span className="text-xs" style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>{entry.name}</span>
                  </div>
                  <span className="text-xs" style={{ fontWeight: 700, color: "var(--foreground)" }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="bg-card rounded-3xl p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)", border: "1px solid var(--border)" }}
        >
          <h3 className="mb-5" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 700 }}>
            Tipo de Explotación
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={explotacionData} barSize={30}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4d7a5e" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#4d7a5e" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {explotacionData.map((_, i) => (
                  <Cell key={i} fill={EXPLT_COLORS[i % EXPLT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="bg-card rounded-3xl p-6 lg:col-span-2"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)", border: "1px solid var(--border)" }}
        >
          <h3 className="mb-5" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 700 }}>
            Hectáreas por Miembro
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hectareasByMember} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4d7a5e" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4d7a5e" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hectareas" radius={[10, 10, 0, 0]}>
                {hectareasByMember.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#16a34a" : i === 1 ? "#22c55e" : "#4ade80"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
