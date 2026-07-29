import React from "react";
import { InventarioRapidoTab } from "../tabs/InventarioRapidoTab";

export function UgaviBarCatalogo() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 font-sans">Catálogo de Inventario</h2>
      <InventarioRapidoTab />
    </div>
  );
}
