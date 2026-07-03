import { useState, useMemo } from "react";
import { X, FileDown, FileText, Check } from "lucide-react";
import { Miembro, Persona, Vinculacion, ESTADOS_SOLVENCIA, TIPOS_EXPLOTACION } from "./mockData";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportModalProps {
  members: Miembro[];
  personas: Persona[];
  vinculaciones: Vinculacion[];
  onClose: () => void;
}

const AVAILABLE_FIELDS = [
  { key: "id", label: "Cod." },
  { key: "razon_social", label: "Razón Social" },
  { key: "rif", label: "RIF" },
  { key: "tipo", label: "Tipo" },
  { key: "hacienda", label: "Hacienda" },
  { key: "hectareas", label: "Hectáreas" },
  { key: "tipo_explotacion", label: "Explotación" },
  { key: "solvencia", label: "Solvencia" },
  { key: "saldo_pendiente", label: "Saldo Pend." },
  { key: "municipio", label: "Municipio" },
  { key: "correo", label: "Correo" },
  { key: "telefono", label: "Teléfono" },
  { key: "representante", label: "Representante Legal" },
];

export function ReportModal({ members, personas, vinculaciones, onClose }: ReportModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "id", "razon_social", "rif", "tipo_explotacion", "solvencia"
  ]);

  const [filterSolvencia, setFilterSolvencia] = useState("Todos");
  const [filterExplotacion, setFilterExplotacion] = useState("Todos");

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => filterSolvencia === "Todos" || m.solvencia === filterSolvencia)
      .filter((m) => filterExplotacion === "Todos" || m.tipo_explotacion === filterExplotacion);
  }, [members, filterSolvencia, filterExplotacion]);

  const generateData = () => {
    return filteredMembers.map((m) => {
      const row: any = {};
      selectedFields.forEach((key) => {
        const field = AVAILABLE_FIELDS.find((f) => f.key === key);
        if (field) {
          if (key === "id") {
            row[field.label] = `#${String(m[key]).padStart(4, "0")}`;
          } else if (key === "representante") {
            const v = vinculaciones.find(v => v.id_miembro === m.id && v.representante);
            const p = v ? personas.find(p => p.id === v.id_persona) : null;
            row[field.label] = p ? p.nombre : "Sin asignar";
          } else {
            row[field.label] = m[key as keyof Miembro];
          }
        }
      });
      return row;
    });
  };

  const downloadExcel = () => {
    const data = generateData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Miembros");
    XLSX.writeFile(wb, "Reporte_Miembros.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const data = generateData();
    
    // Configurar cabeceras
    const headers = selectedFields.map((key) => AVAILABLE_FIELDS.find((f) => f.key === key)?.label || key);
    const rows = data.map((row) => headers.map((h) => row[h] || ""));

    doc.text("Reporte de Miembros", 14, 15);
    doc.setFontSize(10);
    doc.text(`Filtros: Solvencia: ${filterSolvencia} | Explotación: ${filterExplotacion}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] } // Verde principal
    });

    doc.save("Reporte_Miembros.pdf");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="bg-card w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border" style={{ borderColor: "var(--border)" }}>
        <div className="sticky top-0 bg-card px-6 py-5 border-b flex items-center justify-between rounded-t-3xl z-10" style={{ borderColor: "var(--border)" }}>
          <h3 style={{ fontFamily: "Nunito, sans-serif", color: "var(--foreground)", fontWeight: 800 }}>
            Generar Reporte Personalizado
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--muted)" }}>
            <X size={14} style={{ color: "var(--muted-foreground)" }} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Filtros */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>1. Filtros a Aplicar</h4>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
                value={filterSolvencia}
                onChange={(e) => setFilterSolvencia(e.target.value)}
              >
                <option value="Todos">Solvencia: Todos</option>
                {ESTADOS_SOLVENCIA.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
              <select
                className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
                value={filterExplotacion}
                onChange={(e) => setFilterExplotacion(e.target.value)}
              >
                <option value="Todos">Explotación: Todos</option>
                {TIPOS_EXPLOTACION.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Se exportarán <strong style={{ color: "var(--foreground)" }}>{filteredMembers.length}</strong> registros con estos filtros.
            </p>
          </div>

          {/* Columnas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>2. Columnas a Incluir</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_FIELDS.map((field) => {
                const isActive = selectedFields.includes(field.key);
                return (
                  <button
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border"
                    style={{
                      borderColor: isActive ? "#22c55e" : "var(--border)",
                      backgroundColor: isActive ? "#dcfce7" : "var(--card)",
                      color: isActive ? "#15803d" : "var(--foreground)"
                    }}
                  >
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ border: isActive ? "none" : "1px solid var(--border)", backgroundColor: isActive ? "#22c55e" : "transparent" }}>
                      {isActive && <Check size={12} color="#fff" />}
                    </div>
                    <span className="truncate">{field.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedFields.length === 0 && (
              <p className="text-xs text-red-500 font-semibold">Debes seleccionar al menos una columna.</p>
            )}
          </div>

          {/* Botones de Descarga */}
          <div className="pt-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
            <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>3. Descargar</h4>
            <div className="flex gap-3">
              <button
                onClick={downloadExcel}
                disabled={selectedFields.length === 0 || filteredMembers.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#107c41", color: "#fff", boxShadow: "0 4px 14px rgba(16,124,65,0.3)" }}
              >
                <FileText size={16} />
                Excel (.xlsx)
              </button>
              <button
                onClick={downloadPDF}
                disabled={selectedFields.length === 0 || filteredMembers.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#dc2626", color: "#fff", boxShadow: "0 4px 14px rgba(220,38,38,0.3)" }}
              >
                <FileDown size={16} />
                PDF (.pdf)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
