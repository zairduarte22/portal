import { CheckCircle, Clock, XCircle, ChevronUp, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { PagoCredito, EstadoPago } from "./carnetData";
import { Miembro } from "../mockData";

interface TablaPagosProps {
  pagos: PagoCredito[];
  miembros: Miembro[];
  onAprobar: (id: number) => void;
}

const ESTADO_CFG: Record<EstadoPago, { bg: string; color: string; icon: React.ElementType; label: string; dot: string }> = {
  Aprobado: { bg: "#dcfce7", color: "#15803d", icon: CheckCircle, label: "Aprobado", dot: "#22c55e" },
  Pendiente: { bg: "#fef3c7", color: "#92400e", icon: Clock, label: "Pendiente", dot: "#f59e0b" },
  Rechazado: { bg: "#fee2e2", color: "#991b1b", icon: XCircle, label: "Rechazado", dot: "#ef4444" },
};

const METODO_STYLE: Record<string, { bg: string; color: string }> = {
  "Transferencia / Pago Móvil": { bg: "#e0e7ff", color: "#4338ca" },
  Zelle: { bg: "#f3e8ff", color: "#7e22ce" },
  "Efectivo $": { bg: "#dcfce7", color: "#15803d" },
  "Efectivo Bs": { bg: "#ffedd5", color: "#c2410c" },
};

type SortKey = "fecha" | "monto" | "cantidad_carnets" | "estado";

export function TablaPagos({ pagos, miembros, onAprobar }: TablaPagosProps) {
  const [sortKey, setSortKey] = useState<SortKey>("fecha");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  const getMiembro = (id: number) => miembros.find((m) => m.id === id);

  const filtered = pagos.filter((p) => {
    if (!search) return true;
    const m = getMiembro(p.id_miembro);
    const text = `${m?.razon_social || ''} ${p.referencia || ''} ${p.metodo_pago || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a: any, b: any) => {
    const av = String(a[sortKey]), bv = String(b[sortKey]);
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ sk }: { sk: SortKey }) =>
    sortKey === sk ? (sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null;

  const Th = ({ label, sk, align }: { label: string; sk?: SortKey; align?: string }) => (
    <th
      className={`px-4 py-3.5 text-xs uppercase tracking-wider whitespace-nowrap ${align ?? "text-left"}`}
      style={{ color: "var(--muted-foreground)", fontWeight: 700, cursor: sk ? "pointer" : "default" }}
      onClick={sk ? () => toggleSort(sk) : undefined}
    >
      <span className="flex items-center gap-1">{label}{sk && <SortIcon sk={sk} />}</span>
    </th>
  );

  const totalAprobado = pagos.filter(p => p.estado === "Aprobado").reduce((s, p: any) => s + Number(p.monto || p.monto_usd), 0);
  const pendientesCount = pagos.filter(p => p.estado === "Pendiente").length;

  return (
    <div className="space-y-4">
      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Aprobado", value: `$${totalAprobado.toLocaleString("es-VE")}`, bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "#bbf7d0", color: "#15803d" },
          { label: "Pendientes", value: String(pendientesCount), bg: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "#fde68a", color: "#92400e" },
          { label: "Total Pagos", value: String(pagos.length), bg: "linear-gradient(135deg,#f8fafc,#f1f5f9)", border: "#e2e8f0", color: "#334155" },
        ].map(({ label, value, bg, border, color }) => (
          <div key={label} className="rounded-2xl px-4 py-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "1.25rem", color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color, opacity: 0.7, fontWeight: 600 }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por Razón Social o Referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full rounded-2xl outline-none transition-all"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: "0.875rem" }}
          />
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr style={{ backgroundColor: "#f8faf8", borderBottom: "1px solid var(--border)" }}>
                <Th label="Miembro / Razón Social" />
                <Th label="Fecha" sk="fecha" />
                <Th label="Método" />
                <Th label="Referencia" />
                <Th label="Monto ($)" sk="monto" />
                <Th label="Créditos" sk="cantidad_carnets" />
                <Th label="Estado" sk="estado" />
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p: any, idx) => {
                const m = getMiembro(p.id_miembro);
                const est = ESTADO_CFG[p.estado as EstadoPago];
                const metStyle = METODO_STYLE[p.metodo_pago] ?? { bg: "#f1f5f9", color: "#475569" };
                const EstIcon = est.icon;
                return (
                  <tr
                    key={p.id}
                    className="border-t transition-colors duration-100"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8faf8")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "var(--foreground)" }}>
                        {m?.razon_social ?? "Desconocido"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{m?.acronimo}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: "var(--foreground)", fontWeight: 500 }}>
                        {new Date(p.fecha + "T12:00:00Z").toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: metStyle.bg, color: metStyle.color, fontWeight: 700 }}>
                        {p.metodo_pago}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{p.referencia || "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "#15803d" }}>
                        ${Number(p.monto || p.monto_usd || 0).toLocaleString("es-VE")}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Bs. {Number(p.monto_bs || 0).toLocaleString("es-VE")}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="flex items-center justify-center gap-1 text-sm rounded-full px-3 py-1 w-fit"
                        style={{ backgroundColor: "#dcfce7", color: "#15803d", fontFamily: "Nunito, sans-serif", fontWeight: 800 }}
                      >
                        +{(p.cantidad_carnets || p.creditos)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full w-fit"
                        style={{ backgroundColor: est.bg, color: est.color, fontWeight: 700 }}
                      >
                        <EstIcon size={11} />
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {p.estado === "Pendiente" && (
                        <button
                          onClick={() => onAprobar(p.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all hover:opacity-90"
                          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 700, boxShadow: "0 2px 8px rgba(22,163,74,0.35)" }}
                        >
                          <CheckCircle size={12} />
                          Aprobar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    Sin pagos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
