import { useState } from 'react'

const EXCHANGE = 6.9
const DISCOUNT = 0.10

interface Product {
  id: number
  name: string
  description: string
  category: string
  priceUSD: number
  image: string
  badge?: string
}

const CATEGORIES = ['Todos', 'Cocktails', 'Spirits', 'Cervezas & Vinos', 'Picoteos', 'Sin Alcohol']

const products: Product[] = [
  {
    id: 1,
    name: 'Mojito Clásico',
    description: 'Ron blanco, menta fresca, limón, azúcar y agua con gas. Refrescante e icónico.',
    category: 'Cocktails',
    priceUSD: 8,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 2,
    name: 'Margarita Premium',
    description: 'Tequila reposado, triple sec, jugo de limón fresco y sal de grano en el borde.',
    category: 'Cocktails',
    priceUSD: 10,
    image: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 3,
    name: 'Gin Tonic Artesanal',
    description: 'Gin premium, tónica artesanal, pepino y enebro. Elegante y aromático.',
    category: 'Cocktails',
    priceUSD: 9,
    image: 'https://images.unsplash.com/photo-1615887026505-00283cf0ff83?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 4,
    name: 'Daiquiri de Fresa',
    description: 'Ron blanco, fresas naturales, jugo de limón y jarabe de azúcar.',
    category: 'Cocktails',
    priceUSD: 9,
    badge: 'Chef\'s Pick',
    image: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 5,
    name: 'Old Fashioned',
    description: 'Bourbon añejo, bitters de angostura, azúcar y cáscara de naranja.',
    category: 'Spirits',
    priceUSD: 12,
    image: 'https://images.unsplash.com/photo-1598994671512-395d7a6147e0?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 6,
    name: 'Whisky Escocés 12Y',
    description: 'Single malt escocés envejecido 12 años. Notas de turba, vainilla y frutos secos.',
    category: 'Spirits',
    priceUSD: 15,
    badge: 'Premium',
    image: 'https://images.unsplash.com/photo-1671713682331-98086e7b9804?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 7,
    name: 'Ron Añejo Reserva',
    description: 'Ron caribeño envejecido en barrica de roble. Suave, dulce y con cuerpo.',
    category: 'Spirits',
    priceUSD: 13,
    image: 'https://images.unsplash.com/photo-1615887625746-f3d2aa27e048?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 8,
    name: 'Vodka Premium',
    description: 'Vodka triple destilado de grano, puro o con mixer de tu elección.',
    category: 'Spirits',
    priceUSD: 11,
    image: 'https://images.unsplash.com/photo-1615887023544-3a566f29d822?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 9,
    name: 'Cerveza Artesanal IPA',
    description: 'IPA local con lúpulos cítricos, espuma cremosa y amargor equilibrado.',
    category: 'Cervezas & Vinos',
    priceUSD: 6,
    image: 'https://images.unsplash.com/photo-1632173517757-1e87c79de596?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 10,
    name: 'Vino Tinto Malbec',
    description: 'Malbec argentino de Mendoza. Rubíes, taninos suaves y aromas de ciruela y chocolate.',
    category: 'Cervezas & Vinos',
    priceUSD: 11,
    badge: 'Sommelier\'s Choice',
    image: 'https://images.unsplash.com/photo-1612528443702-f6741f70a049?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 11,
    name: 'Nachos con Dips',
    description: 'Nachos crujientes acompañados de guacamole, pico de gallo y crema agria.',
    category: 'Picoteos',
    priceUSD: 7,
    image: 'https://images.unsplash.com/photo-1768192498181-fd1e22ab076e?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 12,
    name: 'Tabla de Entradas',
    description: 'Selección de quesos importados, embutidos, aceitunas y pan artesanal.',
    category: 'Picoteos',
    priceUSD: 14,
    badge: 'Para compartir',
    image: 'https://images.unsplash.com/photo-1770670644198-a9eb1df927c6?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 13,
    name: 'Alitas BBQ',
    description: 'Alitas crujientes bañadas en salsa BBQ ahumada, servidas con dip ranch.',
    category: 'Picoteos',
    priceUSD: 9,
    image: 'https://images.unsplash.com/photo-1771395834098-ded1cc2b297c?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 14,
    name: 'Limonada Natural',
    description: 'Limones frescos, agua mineral, menta y un toque de jarabe de agave.',
    category: 'Sin Alcohol',
    priceUSD: 5,
    image: 'https://images.unsplash.com/photo-1623408859815-22534357b3db?w=600&h=420&fit=crop&auto=format',
  },
  {
    id: 15,
    name: 'Mojito Sin Alcohol',
    description: 'Toda la frescura del mojito clásico sin el alcohol. Menta, limón y soda.',
    category: 'Sin Alcohol',
    priceUSD: 6,
    image: 'https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=600&h=420&fit=crop&auto=format',
  },
]

function priceBS(usd: number) {
  return (usd * EXCHANGE).toFixed(1)
}

function discountedPrice(usd: number) {
  return (usd * (1 - DISCOUNT)).toFixed(2)
}

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false)
  const memberPrice = discountedPrice(product.priceUSD)
  const memberBS = priceBS(parseFloat(memberPrice))

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E2E0D8] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-[#D6D4CD]">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
          {product.category}
        </span>

        {/* Optional badge */}
        {product.badge && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-[#C9A843] text-[#0B1749]">
            {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-display font-semibold text-[#0B1749] text-lg leading-tight">
          {product.name}
        </h3>
        <p className="text-[#8A8880] text-sm leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Pricing block */}
        <div className="mt-3 pt-3 border-t border-[#E2E0D8] space-y-2">
          {/* Regular price */}
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-[#1B3FA0] tracking-tight">
                ${product.priceUSD.toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-[#8A8880] font-medium">
                Bs {priceBS(product.priceUSD)}
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
  )
}

function AnnouncementBanner() {
  const text = '🌟 SALE — Miembros Solventes: 10% de descuento · Muestra tu membresía activa al pedir · '
  const repeated = text.repeat(8)

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
  )
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'Todos' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Hero (reemplaza al header) */}
      <div className="bg-[#0B1749] pt-6 pb-0 px-4 text-center">
        <AnnouncementBanner />

        <div className="pt-8 pb-6">
          <p className="text-[#8A9CC8] text-[10px] tracking-[0.25em] uppercase font-medium mb-1">
            Craft Cocktails & Spirits
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

        {/* Search bar — fija visualmente al fondo del hero */}
        <div className="pb-5">
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9CC8] pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar bebida o plato..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-[#8A9CC8] text-sm focus:outline-none focus:border-[#C9A843]/60 focus:bg-white/15 transition-all"
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
        </div>
      </div>

      {/* Category Tabs — sticky */}
      <div id="menu" className="sticky top-0 z-30 bg-[#0B1749]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
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
        </div>
      </div>

      {/* Product Grid */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8A8880]">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm">Sin resultados para "{search || activeCategory}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
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
  )
}
