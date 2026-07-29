import React, { useState } from "react";
import { AbonosCreditoTab } from "../tabs/AbonosCreditoTab";
import { DetalleFacturaModal } from "../DetalleFacturaModal";
import { useNavigate } from "react-router-dom";

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
      <h2 className="text-3xl font-bold text-gray-800 mb-6 font-sans">Créditos y Abonos</h2>
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
