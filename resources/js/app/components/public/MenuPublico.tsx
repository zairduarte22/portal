import { useState, useEffect } from "react";

const DISCOUNT = 0.10;

function priceBS(usd: number, tasaBcv: number) {
  return (usd * tasaBcv).toFixed(2);
}

function discountedPrice(usd: number) {
  return (usd * (1 - DISCOUNT)).toFixed(2);
}

function ProductCard({ product, tasaBcv }: { product: any, tasaBcv: number }) {
  const [imgError, setImgError] = useState(false);
  const priceUSD = parseFloat(product.precio);
  const memberPrice = discountedPrice(priceUSD);
  const memberBS = priceBS(parseFloat(memberPrice), tasaBcv);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E2E0D8] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-[#D6D4CD]">
        {!imgError && product.imagen ? (
          <img
            src={`/storage/${product.imagen}`}
            alt={product.nombre}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-[#D6D4CD]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#D6D4CD]">
            <span className="text-4xl opacity-40">🍹</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-[#0B1749]/80 text-white backdrop-blur-sm">
          {product.categoria || "Otros"}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-display font-semibold text-[#0B1749] text-lg leading-tight">
          {product.nombre}
        </h3>
        
        {/* Pricing block */}
        <div className="mt-auto pt-3 border-t border-[#E2E0D8] space-y-2">
          {/* Regular price */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-[#1B3FA0] tracking-tight">
                ${priceUSD.toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-[#8A8880] font-medium">
                Bs {priceBS(priceUSD, tasaBcv)}
              </span>
            </div>
          </div>

          {/* Member price */}
          <div className="flex items-center gap-2 bg-[#0B1749]/5 border border-[#C9A843]/30 rounded-xl px-3 py-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#C9A843]">
              Precio Miembro
            </span>
            <div className="flex items-baseline gap-1.5 ml-auto">
              <span className="text-base font-bold text-[#0B1749]">
                ${memberPrice}
              </span>
              <span className="text-xs text-[#8A8880]">
                Bs {memberBS}
              </span>
              <span className="text-[10px] font-bold bg-[#C9A843] text-[#0B1749] rounded-md px-1.5 py-0.5">
                −10%
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AnnouncementBanner() {
  const text = '🌟 SALE — Miembros Solventes: 10% de descuento · Muestra tu membresía activa al pedir · ';
  const repeated = text.repeat(8);

  return (
    <div className="overflow-hidden rounded-xl bg-[#C9A843]/20 border border-[#C9A843]/30 py-2">
      <div className="marquee-track">
        <span className="text-[#E8C96A] text-[11px] font-semibold tracking-wide whitespace-nowrap px-4">
          {repeated}
        </span>
        <span className="text-[#E8C96A] text-[11px] font-semibold tracking-wide whitespace-nowrap px-4" aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  );
}

export function MenuPublico() {
  const [productos, setProductos] = useState<any[]>([]);
  const [tasaBcv, setTasaBcv] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tasca/menu-publico')
      .then(res => res.json())
      .then(data => {
        setProductos(data.productos || []);
        setTasaBcv(Number(data.tasa_bcv) || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const CATEGORIES = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria || "Otros"))).sort()];

  const filtered = productos.filter(p => {
    const cat = p.categoria || "Otros";
    const matchCat = activeCategory === 'Todos' || cat === activeCategory;
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F3EF] menu-publico-container font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .menu-publico-container {
          --navy: #0B1749;
          --royal: #1B3FA0;
          --royal-light: #2952C4;
          --gold: #C9A843;
          --gold-light: #E8C96A;
          --bg: #F4F3EF;
          --card: #FFFFFF;
          --border: #E2E0D8;
          --muted: #8A8880;
          --text: #1A1A2E;
          font-family: 'Inter', sans-serif;
          color: var(--text);
        }
        .menu-publico-container .font-display {
          font-family: 'Playfair Display', serif;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .menu-publico-container .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 45s linear infinite;
        }
        .menu-publico-container .marquee-track:hover {
          animation-play-state: paused;
        }
        .menu-publico-container ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .menu-publico-container ::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }
        .menu-publico-container *:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
        }
      `}</style>
      {/* Hero (reemplaza al header) */}
      <div className="bg-[#0B1749] pt-6 pb-0 px-4 text-center">
        <AnnouncementBanner />

        <div className="pt-8 pb-6">
          <p className="text-[#8A9CC8] text-[10px] tracking-[0.25em] uppercase font-medium mb-1">
            Menú Digital Oficial
          </p>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            UGAVI <span className="text-[#C9A843] italic font-normal">Bar</span>
          </h1>
          <div className="inline-flex items-center mt-4 bg-[#C9A843]/15 border border-[#C9A843]/30 rounded-2xl px-4 py-2">
            <span className="text-[#E8D99A] text-xs font-medium">
              Miembros solventes · <strong>10% de descuento</strong> en toda la carta
            </span>
          </div>
        </div>

      </div>

      {/* Sticky Header: Search + Category Tabs */}
      <div id="menu" className="sticky top-0 z-30 bg-[#0B1749]/95 backdrop-blur-md border-b border-white/10 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9CC8] pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar bebida o snack..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-[#8A9CC8] text-sm focus:outline-none focus:border-[#C9A843]/60 focus:bg-white/15 transition-all shadow-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A9CC8] hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          {!loading && CATEGORIES.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-[#C9A843] text-[#0B1749]'
                      : 'text-[#8A9CC8] hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A843]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8A8880]">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm">Sin resultados para "{search || activeCategory}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} tasaBcv={tasaBcv} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0B1749] text-[#8A9CC8] py-6 mt-4">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-1">
          <p className="font-display text-white text-sm font-semibold">UGAVI Bar</p>
          <p className="text-xs">Precios en USD ($) · Equivalencia referencial en Bs</p>
        </div>
      </footer>
    </div>
  );
}
