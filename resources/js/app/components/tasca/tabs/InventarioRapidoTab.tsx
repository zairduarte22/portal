import { useState, useEffect } from "react";
import { Package, Search } from "lucide-react";

export function InventarioRapidoTab() {
  const [insumos, setInsumos] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tasca/insumos")
      .then(res => res.json())
      .then(setInsumos)
      .catch(console.error);
  }, []);

  const filtered = insumos.filter(i => 
    i.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (i.categoria && i.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 rounded-2xl shadow-sm bg-white border border-gray-200">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar producto por nombre o categoría..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {filtered.map(i => (
          <div key={i.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center border-b">
              {i.imagen_url || i.imagen ? (
                <img src={i.imagen_url || `/storage/${i.imagen}`} alt={i.nombre} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-gray-300" />
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-1">{i.nombre}</h3>
              <p className="text-sm text-gray-500 mb-3">{i.categoria || "Sin categoría"}</p>
              
              {i.productos && i.productos.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">Presentaciones:</p>
                  <p className="text-xs text-gray-600 font-medium line-clamp-2">
                    {i.productos.map((p: any) => p.nombre).join(", ")}
                  </p>
                </div>
              )}
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Stock Total</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  i.stock_total > 10 ? 'bg-green-100 text-green-700' :
                  i.stock_total > 0 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {i.stock_total || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500">
            No hay productos disponibles.
          </div>
        )}
      </div>
    </div>
  );
}
