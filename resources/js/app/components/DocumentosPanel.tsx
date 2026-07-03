import React, { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Eye, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface Documento {
  id: number;
  id_miembro: number;
  tipo: string;
  ruta_archivo: string;
}

interface DocumentosPanelProps {
  miembroId: number;
}

const TIPOS_DOCUMENTOS = [
  "Registro Mercantil",
  "RIF",
  "Cédula",
  "Documento de Propiedad de la Finca",
  "Doc. del Hierro",
  "Hierro (Imagen)"
];

export function DocumentosPanel({ miembroId }: DocumentosPanelProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  // UI States
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documentos-miembros/${miembroId}`);
      if (res.ok) {
        const data = await res.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error("Error fetching documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, [miembroId]);

  const handleUpload = async (tipo: string, file: File) => {
    try {
      setUploading(tipo);
      const formData = new FormData();
      formData.append("id_miembro", miembroId.toString());
      formData.append("tipo", tipo);
      formData.append("archivo", file);

      const res = await fetch("/api/documentos-miembros", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchDocumentos();
        showNotification("success", "Archivo subido correctamente.");
      } else {
        const data = await res.json().catch(() => null);
        const errorMsg = data?.errors?.archivo?.[0] || data?.message || data?.error || "Error al subir el archivo (quizás excede 10MB o formato no válido).";
        showNotification("error", errorMsg);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("error", "Ocurrió un error inesperado al subir el documento.");
    } finally {
      setUploading(null);
    }
  };

  const executeDelete = async () => {
    if (!confirmDialog.id) return;
    const id = confirmDialog.id;
    setConfirmDialog({ isOpen: false, id: null });

    try {
      const res = await fetch(`/api/documentos-miembros/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDocumentos((prev) => prev.filter((d) => d.id !== id));
        showNotification("success", "Documento eliminado correctamente.");
      } else {
        showNotification("error", "Error al eliminar el documento.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("error", "Ocurrió un error inesperado al eliminar.");
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({ isOpen: true, id });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {TIPOS_DOCUMENTOS.map((tipo) => {
        const doc = documentos.find((d) => d.tipo === tipo);

        return (
          <div key={tipo} className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: doc ? "#d1fae5" : "var(--muted)", color: doc ? "#15803d" : "var(--muted-foreground)" }}>
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{tipo}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {doc ? "Documento cargado correctamente" : "Pendiente por cargar"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {doc ? (
                <>
                  <a
                    href={`/api/documentos-miembros/download/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl transition-colors hover:bg-[rgba(21,128,61,0.1)] text-[#15803d]"
                    title="Ver/Descargar"
                  >
                    <Eye size={18} />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-xl transition-colors hover:bg-[rgba(220,38,38,0.1)] text-red-500"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleUpload(tipo, e.target.files[0]);
                      }
                    }}
                    accept={tipo === "Hierro (Imagen)" ? ".jpg,.jpeg,.png" : ".pdf"}
                    disabled={uploading === tipo}
                  />
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                    disabled={uploading === tipo}
                  >
                    {uploading === tipo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    <span>Subir</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: notification.type === "success" ? "rgba(21,128,61,0.1)" : "rgba(220,38,38,0.1)", color: notification.type === "success" ? "#15803d" : "#dc2626" }}>
              {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                {notification.type === "success" ? "¡Éxito!" : "Atención"}
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDialog({ isOpen: false, id: null })} />
          <div className="relative w-full max-w-sm rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#dc2626" }}>
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "var(--foreground)" }}>¿Eliminar documento?</h3>
            <p className="text-sm text-center mb-6" style={{ color: "var(--muted-foreground)" }}>
              Esta acción no se puede deshacer. Tendrás que volver a subir el archivo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, id: null })}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-black/5"
                style={{ color: "var(--foreground)", border: "1px solid var(--border)" }}
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
