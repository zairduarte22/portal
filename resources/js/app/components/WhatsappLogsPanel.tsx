import { useState, useEffect } from "react";
import { MessageCircle, Search, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";

export function WhatsappLogsPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cobranzas/logs');
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    String(l.nombre_miembro || "").toLowerCase().includes(search.toLowerCase()) ||
    String(l.telefono || "").toLowerCase().includes(search.toLowerCase()) ||
    String(l.estado || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
            Historial de WhatsApp
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Registro de notificaciones de cobranza enviadas
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all hover:opacity-90 border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)", fontWeight: 700 }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      <div className="bg-card rounded-2xl border p-4" style={{ borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="flex-1 min-w-52 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-green-200"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
            placeholder="Buscar por nombre, teléfono o estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-3xl border overflow-hidden" style={{ borderColor: "var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3.5 text-left whitespace-nowrap text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap text-xs font-semibold text-gray-500 uppercase tracking-wider">Miembro</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3.5 text-left whitespace-nowrap text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <MessageCircle size={28} style={{ color: "var(--muted-foreground)", margin: "0 auto 8px", opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No hay registros de WhatsApp</p>
                  </td>
                </tr>
              )}
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-t transition-colors hover:bg-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "var(--foreground)", fontWeight: 600 }}>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} style={{ color: "var(--muted-foreground)" }} />
                      {new Date(log.created_at).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm" style={{ fontWeight: 700, color: "var(--foreground)", fontFamily: "Nunito, sans-serif" }}>
                      {log.nombre_miembro || 'Desconocido'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{log.rif || 'Sin RIF'}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                    {log.telefono}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-max ${
                      log.estado === 'Enviado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.estado === 'Enviado' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {log.estado}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "var(--muted-foreground)", maxWidth: "300px" }}>
                    <div className="truncate" title={log.detalles}>
                      {log.detalles || '-'}
                    </div>
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
