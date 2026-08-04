import React, { useState } from "react";
import { AbonosCreditoTab } from "../tabs/AbonosCreditoTab";
import { DetalleFacturaModal } from "../DetalleFacturaModal";
import { useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";

export function UgaviBarCreditos() {
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any>(null);
  const navigate = useNavigate();

  const handleVerDetalles = (v: any) => {
    if (v.estado === 'Pendiente') {
      navigate(`/gestion/ugavibar/ventas/${v.id}`);
    } else {
      setVentaSeleccionada(v);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black font-sans text-gray-900 tracking-tight flex items-center gap-2">
          <Wallet size={28} className="text-orange-600" />
          Créditos y Abonos
        </h2>
      </div>
      <AbonosCreditoTab onOpenDetalle={handleVerDetalles} />
      
      {ventaSeleccionada && (
        <DetalleFacturaModal
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  );
}
