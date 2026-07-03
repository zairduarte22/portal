import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { miembros } from "./mockData";
import { Download } from "lucide-react";

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function Reports() {
  const topHectareas = [...miembros].sort((a, b) => b.hectareas - a.hectareas).map((m) => ({
    name: m.acronimo,
    hectareas: m.hectareas,
    razon: m.razon_social,
  }));

  const topLeche = [...miembros].filter((m) => m.produccion_leche_diaria > 0)
    .sort((a, b) => b.produccion_leche_diaria - a.produccion_leche_diaria)
    .map((m) => ({ name: m.acronimo, leche: m.produccion_leche_diaria }));

  const saldoData = miembros.filter((m) => m.saldo_pendiente > 0).map((m) => ({
    name: m.acronimo,
    saldo: m.saldo_pendiente,
  }));

  const municipios = Object.entries(
    miembros.reduce<Record<string, number>>((acc, m) => {
      acc[m.municipio] = (acc[m.municipio] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)" }}>Reportes</h1>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Indicadores y análisis del padrón de miembros
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "var(--secondary)", color: "var(--secondary-foreground)", fontWeight: 600 }}
        >
          <Download size={15} />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="bg-card rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)" }}>
            Hectáreas por Miembro
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topHectareas} barSize={28} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: "#4b7a5a" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#4b7a5a" }} width={70} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: 12 }}
                formatter={(v: number) => [`${v.toLocaleString()} ha`, "Hectáreas"]}
              />
              <Bar dataKey="hectareas" fill="#22c55e" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)" }}>
            Producción de Leche Diaria (L)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topLeche} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4b7a5a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4b7a5a" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: 12 }}
                formatter={(v: number) => [`${v.toLocaleString()} L`, "Leche/día"]}
              />
              <Bar dataKey="leche" fill="#4ade80" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)" }}>
            Saldos Pendientes (Bs.)
          </h3>
          {saldoData.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: "var(--muted-foreground)" }}>Sin saldos pendientes</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={saldoData} barSize={36} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "#4b7a5a" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#4b7a5a" }} width={70} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: 12 }}
                  formatter={(v: number) => [`Bs. ${v.toLocaleString("es-VE")}`, "Pendiente"]}
                />
                <Bar dataKey="saldo" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
          <h3 className="mb-4" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)" }}>
            Distribución por Municipio
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={municipios} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4b7a5a" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4b7a5a" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", fontSize: 12 }}
                formatter={(v: number) => [v, "Miembros"]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {municipios.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#22c55e" : "#86efac"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
        <h3 className="mb-4" style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)" }}>
          Resumen General
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: "var(--muted)" }}>
              <tr>
                {["Miembro", "Tipo", "Explotación", "Hectáreas", "Animales", "Leche/día", "Tractores", "Solvencia"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {miembros.map((m) => (
                <tr key={m.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 text-sm" style={{ fontWeight: 600, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>{m.acronimo}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{m.tipo}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--muted-foreground)" }}>{m.tipo_explotacion}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{m.hectareas.toLocaleString("es-VE")} ha</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{m.cantidad_animales.toLocaleString("es-VE")}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{m.produccion_leche_diaria > 0 ? `${m.produccion_leche_diaria.toLocaleString()}L` : "—"}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--foreground)" }}>{m.tractores}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-lg" style={{
                      backgroundColor: m.solvencia === "Solvente" ? "#dcfce7" : m.solvencia === "En_Mora" ? "#fef3c7" : "#fee2e2",
                      color: m.solvencia === "Solvente" ? "#166534" : m.solvencia === "En_Mora" ? "#92400e" : "#991b1b",
                      fontWeight: 600,
                    }}>
                      {m.solvencia.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
