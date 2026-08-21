import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Store, CreditCard, Package, Receipt, ShoppingBag, Users2, Landmark, BarChart3 } from 'lucide-react';

interface Tienda {
  id: number;
  nombre: string;
  slug: string;
  tipo_negocio: string;
}

interface TiendaContextType {
  tienda: Tienda | null;
  loading: boolean;
}

const TiendaContext = createContext<TiendaContextType>({ tienda: null, loading: true });

export const useTiendaContext = () => useContext(TiendaContext);

let currentTiendaId: number | null = null;

// Intercept fetch calls globally to automatically inject X-Tienda-Id
const originalFetch = window.fetch;
window.fetch = async function () {
  let [resource, config] = arguments as any;
  
  const urlStr = typeof resource === 'string' ? resource : (resource?.url || '');
  
  // If resource is a string and hits the tienda API or if we need to pass the header
  if (urlStr.includes('/api/tienda/') && currentTiendaId) {
    config = config || {};
    const headers = new Headers(config.headers || {});
    headers.set('X-Tienda-Id', currentTiendaId.toString());
    config.headers = headers;
    
    if (resource instanceof Request) {
      resource.headers.set('X-Tienda-Id', currentTiendaId.toString());
    }
  }
  
  return originalFetch.apply(this, [resource, config]);
};

export function TiendaLayout() {
  const { slug } = useParams<{ slug: string }>();
  const [tienda, setTienda] = useState<Tienda | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isPosScreen = location.pathname.match(/\/ventas\/\d+$/);

  useEffect(() => {
    const fetchTienda = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/configuraciones/tiendas/byslug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTienda(data);
        } else {
          navigate('/gestion/dashboard');
        }
      } catch (error) {
        console.error("Error fetching tienda:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTienda();
  }, [slug, navigate]);

  // Update the global store ID variable
  currentTiendaId = tienda?.id || null;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

  if (!tienda) {
    return null;
  }

  const navItems = [
    { id: 'ventas', label: 'Ventas (POS)', icon: Store },
    { id: 'creditos', label: 'Créditos', icon: CreditCard },
    { id: 'catalogo', label: 'Catálogo', icon: Package },
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'gastos', label: 'Gastos', icon: Receipt },
    { id: 'compras', label: 'Compras/Proveedores', icon: ShoppingBag },
    { id: 'clientes', label: 'Clientes', icon: Users2 },
    { id: 'bancos', label: 'Bancos', icon: Landmark },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <TiendaContext.Provider value={{ tienda, loading }}>
      <div className="flex flex-col h-full space-y-4 animate-in fade-in">
        {!isPosScreen && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 shrink-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                <Store size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800 leading-tight">{tienda.nombre}</h1>
                <p className="text-sm text-gray-500 capitalize">{tienda.tipo_negocio.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-2 px-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={`/gestion/tienda/${slug}/${item.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      isActive && !isPosScreen
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-orange-600'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-transparent">
          <Outlet />
        </div>
      </div>
    </TiendaContext.Provider>
  );
}
