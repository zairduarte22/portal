import { useState } from 'react'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  navy: '#0C2340',
  royal: '#1A52A8',
  royalLight: '#2563EB',
  royalMuted: '#EBF2FF',
  emerald: '#059669',
  emeraldBg: '#ECFDF5',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  rose: '#DC2626',
  roseMid: '#EF4444',
  roseBg: '#FFF1F1',
  roseBorder: '#FECACA',
  violet: '#7C3AED',
  violetBg: '#F5F3FF',
  violetBorder: '#DDD6FE',
  slate: '#64748B',
  slateMuted: '#94A3B8',
  slateLight: '#F1F5F9',
  border: '#E2E8F0',
  borderMid: '#CBD5E1',
  white: '#FFFFFF',
  ink: '#0F172A',
  inkMid: '#1E293B',
  muted: '#64748B',
}

// ─── Logo / Brand Mark ───────────────────────────────────────────────────────
function BrandHeader({ center = false }: { center?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: center ? 'center' : 'flex-start',
      flexDirection: center ? 'column' : 'row',
      gap: '10px',
    }}>
      {/* Icon mark */}
      <div style={{
        width: 40, height: 40,
        background: `linear-gradient(135deg, ${C.royal} 0%, ${C.royalLight} 100%)`,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 17L8 12L11 15L16 9L19 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11" cy="7" r="2.5" fill="white" fillOpacity="0.4" />
          <path d="M4 5h14M4 5v12" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
      {/* Text */}
      <div style={{ textAlign: center ? 'center' : 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: C.navy, lineHeight: 1 }}>
          SIGAMA
        </div>
        <div style={{ fontSize: 8.5, fontWeight: 400, color: C.muted, letterSpacing: '0.04em', marginTop: 2, lineHeight: 1 }}>
          Sistema de Gestión · UGAVI
        </div>
      </div>
    </div>
  )
}

// ─── Company Info Block ───────────────────────────────────────────────────────
function CompanyInfo() {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 9, color: C.muted, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, color: C.inkMid, fontSize: 9.5 }}>Fondo de UGAVI para Desarrollo Agropecuario</div>
        <div>RIF: J-30646602-9 · Tel: 0424-6088302</div>
        <div>Av. 23 Esq. 27, Edif. UGAVI PB OF-01, Sector UGAVI</div>
        <div>Villa del Rosario, Mpio. Rosario de Perijá, Edo. Zulia · CP 4047</div>
      </div>
    </div>
  )
}

// ─── Report 1: {titulo} ──────────────────────────────────────
export function ReporteGeneral({ data, periodo, titulo = 'Reporte de Pagos' }: { data: any, periodo?: string, titulo?: string }) {
  const fmt = (n: number) => 'Bs ' + Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
  const fmtUsd = (n: number) => '$ ' + Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })

  const pagosBs: any[] = (data?.pagoMovil || []).map((p: any) => ({
    fecha: p.FECHA ? new Date(p.FECHA + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    fact: p.FACT_UGAVI,
    monto: p['Monto Original Bs'] || 0,
    p60: p['UGAVI 60% Bs'] || 0,
    p20: p['Club 20% Bs'] || 0
  }))

  const pagosDiv: any[] = (data?.otrosMetodos || []).map((p: any) => ({
    fecha: p.FECHA ? new Date(p.FECHA + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    fact: p.FACT_UGAVI,
    usd: p['Monto $'] || 0,
    monto: p.MONTO_BS || 0,
    p60: p['60% Bs.'] || 0,
    p20: p['20% Bs.'] || 0
  }))

  const pagosCruces: any[] = (data?.cruces || []).map((p: any) => ({
    fecha: p.FECHA ? new Date(p.FECHA + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    fact: p.FACT_UGAVI,
    monto: p['Monto Original Bs'] || 0,
    p60: p['UGAVI 60% Bs'] || 0,
    p20: p['Club 20% Bs'] || 0
  }))

  const totalBs = pagosBs.reduce((s, r) => s + r.monto, 0) + pagosCruces.reduce((s, r) => s + r.monto, 0);
  const totalDivisas = pagosDiv.reduce((s, r) => s + r.usd, 0);

  const kpis = [
    { label: 'Total Recaudado', sub: 'Bolívares (Bs)', value: fmt(totalBs), color: C.royal, bg: C.royalMuted },
    { label: 'Total Recaudado', sub: 'Dólares (USD)', value: fmtUsd(totalDivisas), color: C.emerald, bg: C.emeraldBg },
  ]

  const bsUgavi = pagosBs.reduce((s, r) => s + r.p60, 0) + pagosCruces.reduce((s, r) => s + r.p60, 0);
  const bsClub = pagosBs.reduce((s, r) => s + r.p20, 0) + pagosCruces.reduce((s, r) => s + r.p20, 0);
  const bsFondo = pagosBs.reduce((s, r) => s + (r.monto - r.p60 - r.p20), 0) + pagosCruces.reduce((s, r) => s + (r.monto - r.p60 - r.p20), 0);

  const usdUgavi = totalDivisas * 0.60;
  const usdClub = totalDivisas * 0.20;
  const usdFondo = totalDivisas - usdUgavi - usdClub;

  const distribucion = [
    { ente: 'UGAVI', porcentaje: 60, color: C.royal, bg: C.royalMuted, bs: fmt(bsUgavi), usd: fmtUsd(usdUgavi) },
    { ente: 'Club', porcentaje: 20, color: C.emerald, bg: C.emeraldBg, bs: fmt(bsClub), usd: fmtUsd(usdClub) },
    { ente: 'Fondo', porcentaje: 20, color: C.amber, bg: C.amberBg, bs: fmt(bsFondo), usd: fmtUsd(usdFondo) },
  ]


  const thStyle: React.CSSProperties = {
    padding: '9px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: C.muted, textAlign: 'left', borderBottom: `1px solid ${C.border}`, background: C.slateLight, whiteSpace: 'nowrap',
  }
  const thRight: React.CSSProperties = { ...thStyle, textAlign: 'right' }

  // --- PAGINATION LOGIC ---
  const PAGE_HEIGHT = 1056;
  const FOOTER_HEIGHT = 60;
  const TOP_PADDING = 40;
  const BOTTOM_PADDING = 40; // gap between content and footer
  const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - FOOTER_HEIGHT - TOP_PADDING - BOTTOM_PADDING;

  const HEADER_HEIGHT = 200; // Logo, title, KPI cards
  const SECTION_TITLE_HEIGHT = 45; // "Pagos en Bolívares", etc.
  const TABLE_HEADER_HEIGHT = 33; // <thead>
  const ROW_HEIGHT = 28; // slightly increased to prevent overflow due to borders/padding
  const SUBTOTAL_HEIGHT = 35; // table subtotal <tr>
  const CRUCES_BANNER_HEIGHT = 42; // purple banner for cruces
  const CRUCES_FOOTER_NOTE_HEIGHT = 32; // text below cruces table

  type RenderItem = 
    | { type: 'BOLIVARES_TITLE', cont?: boolean } | { type: 'BOLIVARES_HEAD' } | { type: 'BOLIVARES_ROW', data: any, index: number } | { type: 'BOLIVARES_SUBTOTAL' }
    | { type: 'DIVISAS_TITLE', cont?: boolean } | { type: 'DIVISAS_HEAD' } | { type: 'DIVISAS_ROW', data: any, index: number } | { type: 'DIVISAS_SUBTOTAL' }
    | { type: 'CRUCES_TITLE', cont?: boolean } | { type: 'CRUCES_HEAD' } | { type: 'CRUCES_ROW', data: any, index: number } | { type: 'CRUCES_SUBTOTAL' }
    | { type: 'DISTRIBUCION' };

  const pages: RenderItem[][] = [];
  let currentPage: RenderItem[] = [];
  let currentY = HEADER_HEIGHT; // first page has header

  const pushItem = (item: RenderItem, itemHeight: number) => {
    if (currentY + itemHeight > MAX_CONTENT_HEIGHT) {
      pages.push(currentPage);
      currentPage = [];
      currentY = 0;

      // Handle table continuations
      if (item.type === 'BOLIVARES_ROW') {
        currentPage.push({ type: 'BOLIVARES_TITLE', cont: true });
        currentPage.push({ type: 'BOLIVARES_HEAD' });
        currentY += SECTION_TITLE_HEIGHT + TABLE_HEADER_HEIGHT;
      } else if (item.type === 'DIVISAS_ROW') {
        currentPage.push({ type: 'DIVISAS_TITLE', cont: true });
        currentPage.push({ type: 'DIVISAS_HEAD' });
        currentY += SECTION_TITLE_HEIGHT + TABLE_HEADER_HEIGHT;
      } else if (item.type === 'CRUCES_ROW') {
        currentPage.push({ type: 'CRUCES_TITLE', cont: true });
        currentPage.push({ type: 'CRUCES_HEAD' });
        currentY += SECTION_TITLE_HEIGHT + CRUCES_BANNER_HEIGHT + TABLE_HEADER_HEIGHT;
      }
    }
    currentPage.push(item);
    currentY += itemHeight;
  };

  // 1. Bolivares
  if (pagosBs.length > 0) {
    pushItem({ type: 'BOLIVARES_TITLE' }, SECTION_TITLE_HEIGHT);
    pushItem({ type: 'BOLIVARES_HEAD' }, TABLE_HEADER_HEIGHT);
    pagosBs.forEach((row, idx) => pushItem({ type: 'BOLIVARES_ROW', data: row, index: idx }, ROW_HEIGHT));
    pushItem({ type: 'BOLIVARES_SUBTOTAL' }, SUBTOTAL_HEIGHT);
  }

  // 2. Divisas
  if (pagosDiv.length > 0) {
    pushItem({ type: 'DIVISAS_TITLE' }, SECTION_TITLE_HEIGHT);
    pushItem({ type: 'DIVISAS_HEAD' }, TABLE_HEADER_HEIGHT);
    pagosDiv.forEach((row, idx) => pushItem({ type: 'DIVISAS_ROW', data: row, index: idx }, ROW_HEIGHT));
    pushItem({ type: 'DIVISAS_SUBTOTAL' }, SUBTOTAL_HEIGHT);
  }

  // 3. Cruces
  if (pagosCruces.length > 0) {
    pushItem({ type: 'CRUCES_TITLE' }, SECTION_TITLE_HEIGHT + CRUCES_BANNER_HEIGHT);
    pushItem({ type: 'CRUCES_HEAD' }, TABLE_HEADER_HEIGHT);
    pagosCruces.forEach((row, idx) => pushItem({ type: 'CRUCES_ROW', data: row, index: idx }, ROW_HEIGHT));
    pushItem({ type: 'CRUCES_SUBTOTAL' }, SUBTOTAL_HEIGHT + CRUCES_FOOTER_NOTE_HEIGHT);
  }
  
  pushItem({ type: 'DISTRIBUCION' }, 120); // 120px height for the distribution cards


  if (currentPage.length > 0) pages.push(currentPage);

  // --- RENDERERS ---
  const renderBolivaresHead = () => (
    <thead key="b-head">
      <tr>
        <th style={{ ...thStyle, width: 82 }}>Fecha</th>
        <th style={{ ...thStyle, width: 140 }}>Fact.</th>
        <th style={{ ...thRight }}>Monto Bs</th>
        <th style={{ ...thRight, width: 110 }}>Monto 60%</th>
        <th style={{ ...thRight, width: 110 }}>Monto 20%</th>
      </tr>
    </thead>
  );

  const renderDivisasHead = () => (
    <thead key="d-head">
      <tr>
        <th style={{ ...thStyle, width: 82 }}>Fecha</th>
        <th style={{ ...thStyle, width: 140 }}>Fact.</th>
        <th style={{ ...thRight, width: 90 }}>Monto USD</th>
        <th style={{ ...thRight }}>Monto Bs</th>
        <th style={{ ...thRight, width: 100 }}>Monto 60%</th>
        <th style={{ ...thRight, width: 100 }}>Monto 20%</th>
      </tr>
    </thead>
  );

  const renderCrucesHead = () => (
    <thead key="c-head">
      <tr style={{ background: '#EDE9FE' }}>
        <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'left', width: 82 }}>Fecha</th>
        <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'left', width: 140 }}>Fact.</th>
        <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'right' }}>Monto Bs</th>
        <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'right', width: 110 }}>Monto 60%</th>
        <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'right', width: 110 }}>Monto 20%</th>
      </tr>
    </thead>
  );

  return (
    <div className="bg-slate-200 py-5 min-h-screen flex flex-col gap-6 print:bg-white print:py-0 print:gap-0 print:min-h-0">
      {pages.map((pageItems, pageIdx) => {
        const isFirst = pageIdx === 0;

        return (
          <div key={`page-${pageIdx}`} style={{
            width: 816, height: PAGE_HEIGHT, background: C.white, margin: '0 auto',
            fontFamily: "'Inter', sans-serif", color: C.ink, position: 'relative',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            overflow: 'hidden'
          }} className="print:shadow-none print:my-0 print:border-none print:break-after-page">
            
            {/* Top accent bar */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${C.navy} 0%, ${C.royalLight} 60%, ${C.emerald} 100%)` }} />

            {/* Content Area */}
            <div style={{ padding: '0 36px', height: PAGE_HEIGHT - 60 /* footer */ }}>
              {isFirst && (
                <div style={{ paddingTop: 16 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <BrandHeader />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em', lineHeight: 1 }}>{titulo}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <CompanyInfo />
                      <div style={{ background: C.royalMuted, border: `1px solid ${C.royal}30`, borderRadius: 20, padding: '5px 14px', fontSize: 10, fontWeight: 600, color: C.royal, letterSpacing: '0.02em' }}>
                        {periodo}
                      </div>
                      <div style={{ fontSize: 9, color: C.slateMuted }}>Emitido: {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, paddingBottom: 16 }}>
                    {kpis.map((k, i) => (
                      <div key={i} style={{ background: k.bg, border: `1px solid ${k.color}20`, borderRadius: 10, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.color, borderRadius: '10px 10px 0 0' }} />
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: k.color, marginBottom: 6 }}>{k.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em', lineHeight: 1 }}>{k.value}</div>
                        <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC ITEMS */}
              <div style={{ paddingTop: isFirst ? 0 : 24 }}>
                {pageItems.map((item, i) => {
                  if (item.type === 'BOLIVARES_TITLE') {
                    return (
                      <div key={`bs-title-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: i === 0 && !isFirst ? 0 : 12 }}>
                        <div style={{ width: 3, height: 16, background: C.royal, borderRadius: 2 }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: '-0.01em' }}>Pagos en Bolívares (Bs) {item.cont && '(Continuación)'}</div>
                        {!item.cont && <div style={{ marginLeft: 'auto', fontSize: 9, color: C.muted }}>{pagosBs.length} registros</div>}
                      </div>
                    );
                  }
                  if (item.type === 'BOLIVARES_HEAD') {
                    return <table key={`bs-table-${i}`} style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.border}`, borderBottom: 'none', tableLayout: 'fixed' }}>{renderBolivaresHead()}</table>;
                  }
                  if (item.type === 'BOLIVARES_ROW') {
                    const r = item.data;
                    const isLast = i === pageItems.length - 1 || pageItems[i+1].type !== 'BOLIVARES_ROW';
                    return (
                      <table key={`bs-row-${i}`} style={{ width: '100%', borderCollapse: 'collapse', borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: isLast ? `1px solid ${C.border}` : 'none', tableLayout: 'fixed' }}>
                        <tbody>
                          <tr style={{ background: item.index % 2 === 0 ? C.white : '#F8FAFC' }}>
                            <td style={{ padding: '7px 12px', fontSize: 9, color: C.muted, borderBottom: `1px solid ${C.border}`, width: 82 }}>{r.fecha}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9, fontWeight: 600, color: C.inkMid, borderBottom: `1px solid ${C.border}`, width: 140 }}>{r.fact}</td>
                            <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.royal, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.monto)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.border}`, width: 110 }}>{fmt(r.p60)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.slate, textAlign: 'right', borderBottom: `1px solid ${C.border}`, width: 110 }}>{fmt(r.p20)}</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  }
                  if (item.type === 'BOLIVARES_SUBTOTAL') {
                    return (
                      <table key={`bs-sub-${i}`} style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.border}`, borderTop: 'none', tableLayout: 'fixed' }}>
                        <tbody>
                          <tr style={{ background: C.royalMuted }}>
                            <td style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: C.navy, width: 222 }}>Subtotal Bolívares</td>
                            <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: C.navy, textAlign: 'right' }}>{fmt(pagosBs.reduce((s, r) => s + r.monto, 0))}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.navy, textAlign: 'right', width: 110 }}>{fmt(pagosBs.reduce((s, r) => s + r.p60, 0))}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.navy, textAlign: 'right', width: 110 }}>{fmt(pagosBs.reduce((s, r) => s + r.p20, 0))}</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  }

                  if (item.type === 'DIVISAS_TITLE') {
                    return (
                      <div key={`div-title-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: i === 0 && !isFirst ? 0 : 16 }}>
                        <div style={{ width: 3, height: 16, background: C.emerald, borderRadius: 2 }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: '-0.01em' }}>Pagos en Divisas {item.cont && '(Continuación)'}</div>
                        {!item.cont && <div style={{ marginLeft: 'auto', fontSize: 9, color: C.muted }}>{pagosDiv.length} registros</div>}
                      </div>
                    );
                  }
                  if (item.type === 'DIVISAS_HEAD') {
                    return <table key={`div-table-${i}`} style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.border}`, borderBottom: 'none', tableLayout: 'fixed' }}>{renderDivisasHead()}</table>;
                  }
                  if (item.type === 'DIVISAS_ROW') {
                    const r = item.data;
                    const isLast = i === pageItems.length - 1 || pageItems[i+1].type !== 'DIVISAS_ROW';
                    return (
                      <table key={`div-row-${i}`} style={{ width: '100%', borderCollapse: 'collapse', borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderBottom: isLast ? `1px solid ${C.border}` : 'none', tableLayout: 'fixed' }}>
                        <tbody>
                          <tr style={{ background: item.index % 2 === 0 ? C.white : '#F8FAFC' }}>
                            <td style={{ padding: '7px 12px', fontSize: 9, color: C.muted, borderBottom: `1px solid ${C.border}`, width: 82 }}>{r.fecha}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9, fontWeight: 600, color: C.inkMid, borderBottom: `1px solid ${C.border}`, width: 140 }}>{r.fact}</td>
                            <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.emerald, textAlign: 'right', borderBottom: `1px solid ${C.border}`, width: 90 }}>{fmtUsd(r.usd)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.monto)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.border}`, width: 100 }}>{fmt(r.p60)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.slate, textAlign: 'right', borderBottom: `1px solid ${C.border}`, width: 100 }}>{fmt(r.p20)}</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  }
                  if (item.type === 'DIVISAS_SUBTOTAL') {
                    return (
                      <table key={`div-sub-${i}`} style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.border}`, borderTop: 'none', tableLayout: 'fixed' }}>
                        <tbody>
                          <tr style={{ background: C.emeraldBg }}>
                            <td style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: '#065F46', width: 222 }}>Subtotal Divisas</td>
                            <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: C.emerald, textAlign: 'right', width: 90 }}>{fmtUsd(pagosDiv.reduce((s, r) => s + r.usd, 0))}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 800, color: '#065F46', textAlign: 'right' }}>{fmt(pagosDiv.reduce((s, r) => s + r.monto, 0))}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#065F46', textAlign: 'right', width: 100 }}>{fmt(pagosDiv.reduce((s, r) => s + r.p60, 0))}</td>
                            <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#065F46', textAlign: 'right', width: 100 }}>{fmt(pagosDiv.reduce((s, r) => s + r.p20, 0))}</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  }

                  if (item.type === 'CRUCES_TITLE') {
                    return (
                      <div key={`cruce-title-${i}`} style={{ marginTop: i === 0 && !isFirst ? 0 : 16 }}>
                        <div style={{ background: C.violetBg, border: `1px solid ${C.violetBorder}`, borderRadius: '10px 10px 0 0', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.violet, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v3.5M5.5 8h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                          </div>
                          <div>
                            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.violet }}>Pagos por Cruce de Cuentas {item.cont && '(Continuación)'}</span>
                            {!item.cont && <span style={{ fontSize: 8.5, color: '#6D28D9', marginLeft: 8 }}>No representan depósito físico en banco.</span>}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (item.type === 'CRUCES_HEAD') {
                    return <table key={`cruce-table-${i}`} style={{ width: '100%', borderCollapse: 'collapse', borderLeft: `1px solid ${C.violetBorder}`, borderRight: `1px solid ${C.violetBorder}`, borderTop: 'none', borderBottom: 'none', tableLayout: 'fixed' }}>{renderCrucesHead()}</table>;
                  }
                  if (item.type === 'CRUCES_ROW') {
                    const r = item.data;
                    const isLast = i === pageItems.length - 1 || pageItems[i+1].type !== 'CRUCES_ROW';
                    return (
                      <table key={`cruce-row-${i}`} style={{ width: '100%', borderCollapse: 'collapse', borderLeft: `1px solid ${C.violetBorder}`, borderRight: `1px solid ${C.violetBorder}`, borderBottom: isLast ? `1px solid ${C.violetBorder}` : 'none', tableLayout: 'fixed' }}>
                        <tbody>
                          <tr style={{ background: item.index % 2 === 0 ? C.white : '#FAF8FF' }}>
                            <td style={{ padding: '7px 12px', fontSize: 9, color: C.muted, borderBottom: `1px solid ${C.violetBorder}`, width: 82 }}>{r.fecha}</td>
                            <td style={{ padding: '7px 12px', borderBottom: `1px solid ${C.violetBorder}`, width: 140 }}>
                              <span style={{ fontSize: 9, fontWeight: 600, color: C.inkMid }}>{r.fact}</span>
                            </td>
                            <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.violet, textAlign: 'right', borderBottom: `1px solid ${C.violetBorder}` }}>{fmt(r.monto)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.violetBorder}`, width: 110 }}>{fmt(r.p60)}</td>
                            <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.slate, textAlign: 'right', borderBottom: `1px solid ${C.violetBorder}`, width: 110 }}>{fmt(r.p20)}</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  }
                  if (item.type === 'CRUCES_SUBTOTAL') {
                    return (
                      <div key={`cruce-sub-${i}`}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.violetBorder}`, borderTop: 'none', borderRadius: '0 0 8px 8px', tableLayout: 'fixed' }}>
                          <tbody>
                            <tr style={{ background: '#EDE9FE' }}>
                              <td style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: '#5B21B6', width: 222 }}>Subtotal Cruces</td>
                              <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: '#5B21B6', textAlign: 'right' }}>{fmt(pagosCruces.reduce((s, r) => s + r.monto, 0))}</td>
                              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#5B21B6', textAlign: 'right', width: 110 }}>{fmt(pagosCruces.reduce((s, r) => s + r.p60, 0))}</td>
                              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#5B21B6', textAlign: 'right', width: 110 }}>{fmt(pagosCruces.reduce((s, r) => s + r.p20, 0))}</td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ marginTop: 6, padding: '6px 12px', background: '#FAF8FF', border: `1px dashed ${C.violetBorder}`, borderRadius: 6, fontSize: 8.5, color: '#6D28D9', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="#7C3AED" strokeWidth="1" /><path d="M5 3v2.5l1.5 1" stroke="#7C3AED" strokeWidth="1" strokeLinecap="round" /></svg>
                          Este subtotal sí se incluye en el Total Bruto Recaudado, pero no genera flujo bancario. Este monto será descontado en la liquidación bancaria.
                        </div>
                      </div>
                    );
                  }
                  if (item.type === 'DISTRIBUCION') {
                    return (
                      <div key={`distribucion-${i}`} style={{ marginTop: 24, paddingBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 3, height: 16, background: C.navy, borderRadius: 2 }} />
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Distribución de Recaudación</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          {distribucion.map((d, idx) => (
                            <div key={idx} style={{ border: `1px solid ${d.color}25`, borderRadius: 10, overflow: 'hidden' }}>
                              <div style={{ background: d.color, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: C.white, letterSpacing: '0.05em' }}>{d.ente}</span>
                                <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>{d.porcentaje}%</span>
                              </div>
                              <div style={{ background: d.bg, padding: '10px 14px' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: d.color }}>{d.bs}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: d.color, opacity: 0.7, marginTop: 2 }}>{d.usd}</div>
                                <div style={{ marginTop: 6, height: 4, background: `${d.color}20`, borderRadius: 4, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${d.porcentaje}%`, background: d.color, borderRadius: 4 }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Absolute Footer */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
              borderTop: `1px solid ${C.border}`, padding: '12px 36px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: C.slateLight,
            }}>
              <div style={{ fontSize: 8.5, color: C.slateMuted }}>
                SIGAMA · Reporte Generado Automáticamente · Documento de carácter informativo interno
              </div>
              <div style={{ fontSize: 8.5, color: C.slateMuted, fontWeight: 600 }}>Página {pageIdx + 1} de {pages.length}</div>
            </div>
          </div>
        );
      })}
    </div>
  )
}


export function ComprobanteEntrega({ data, rango, periodo, config }: { data: any, rango?: string, periodo?: string, config?: any }) {
  const entrega = data?.entrega || data || {}
  const deducciones = data?.deducciones || []

  const fmt = (n: number) => 'Bs ' + Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
  const fmtUsd = (n: number) => '$ ' + Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })

  const ugaviBs = parseFloat(entrega?.monto_pagado_ugavi_bs) || 0
  const ugaviUsd = parseFloat(entrega?.monto_pagado_ugavi_usd) || 0
  const ugaviBaseBs = parseFloat(entrega?.ugavi_base_bs) || 0
  const ugaviBaseUsd = parseFloat(entrega?.ugavi_base_usd) || 0
  
  const clubBs = parseFloat(entrega?.monto_pagado_club_bs) || 0
  const clubUsd = parseFloat(entrega?.monto_pagado_club_usd) || 0
  const clubBaseBs = parseFloat(entrega?.club_base_bs) || 0
  const clubBaseUsd = parseFloat(entrega?.club_base_usd) || 0

  const deduccionUgaviBs = Math.max(0, ugaviBaseBs - ugaviBs)
  const deduccionUgaviUsd = Math.max(0, ugaviBaseUsd - ugaviUsd)
  
  const deduccionClubBs = Math.max(0, clubBaseBs - clubBs)
  const deduccionClubUsd = Math.max(0, clubBaseUsd - clubUsd)

  const fondoBaseBs = parseFloat(entrega?.fondo_base_bs) || 0
  const fondoBaseUsd = parseFloat(entrega?.fondo_base_usd) || 0

  const totalDeduccionesBs = deducciones.reduce((acc: number, d: any) => acc + d.bs, 0)
  const totalDeduccionesUsd = deducciones.reduce((acc: number, d: any) => acc + d.usd, 0)


  const transferencias = [
    {
      ente: 'UGAVI',
      descripcion: 'Fondo de UGAVI para Desarrollo Agropecuario',
      porcentaje: '60%',
      brutoBs: fmt(ugaviBaseBs),
      brutoUsd: fmtUsd(ugaviBaseUsd),
      deduccionBs: deduccionUgaviBs > 0 ? '- ' + fmt(deduccionUgaviBs) : '-',
      deduccionUsd: deduccionUgaviUsd > 0 ? '- ' + fmtUsd(deduccionUgaviUsd) : '-',
      netoBs: fmt(ugaviBs),
      netoUsd: fmtUsd(ugaviUsd),
      color: C.royal,
      bg: C.royalMuted,
      banco: 'Banco Bicentenario del Pueblo',
      cuenta: 'Cta. Cte. · 0175-0102-44-1020234801',
      titular: 'Fondo UGAVI – RIF J-30646602-9',
    },
    {
      ente: 'Club',
      descripcion: 'Club Social y Deportivo – Distribución Operativa',
      porcentaje: '20%',
      brutoBs: fmt(clubBaseBs),
      brutoUsd: fmtUsd(clubBaseUsd),
      deduccionBs: deduccionClubBs > 0 ? '- ' + fmt(deduccionClubBs) : '-',
      deduccionUsd: deduccionClubUsd > 0 ? '- ' + fmtUsd(deduccionClubUsd) : '-',
      netoBs: fmt(clubBs),
      netoUsd: fmtUsd(clubUsd),
      color: C.emerald,
      bg: C.emeraldBg,
      banco: 'Banco de Venezuela',
      cuenta: 'Cta. Cte. · 0102-0251-07-0000125634',
      titular: 'Club Social y Deportivo – RIF J-29187451-3',
    },
  ]

  const lineStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 0',
    borderBottom: `1px solid ${C.border}`,
  }
  const labelStyle: React.CSSProperties = { fontSize: 9.5, color: C.muted }
  const valueStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, color: C.inkMid }

  return (
    <div style={{
      width: 816,
      minHeight: 1020,
      background: C.white,
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      color: C.ink,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top accent */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.navy} 0%, ${C.royalLight} 60%, ${C.emerald} 100%)` }} />

      {/* Header */}
      <div style={{
        padding: '16px 36px 16px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <BrandHeader />
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginBottom: 4 }}>
              Comprobante de Liquidación
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.03em', lineHeight: 1 }}>
              #ENT-{entrega?.id?.toString().padStart(4, '0')}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <CompanyInfo />

        </div>
      </div>

      {/* Meta block */}
      <div style={{ padding: '12px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Left col */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: C.slateLight, padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>
              Datos de la Liquidación
            </span>
          </div>
          <div style={{ padding: '4px 14px' }}>
            <div style={lineStyle}>
              <span style={labelStyle}>Fecha de Emisión</span>
              <span style={valueStyle}>{entrega?.fecha ? new Date(entrega.fecha + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</span>
            </div>
            <div style={{ ...lineStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Período que Abarca</span>
              <span style={valueStyle}>{entrega?.rango_desde ? new Date(entrega.rango_desde + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : ''} – {entrega?.rango_hasta ? new Date(entrega.rango_hasta + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
            </div>
          </div>
        </div>
        {/* Right col */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: C.slateLight, padding: '8px 14px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted }}>
              Totales Globales
            </span>
          </div>
          <div style={{ padding: '4px 14px' }}>
            <div style={lineStyle}>
              <span style={labelStyle}>Total Recaudado (Bs)</span>
              <span style={{ ...valueStyle, color: C.royal, fontSize: 12, fontWeight: 800 }}>{fmt(parseFloat(entrega?.total_bs) || 0)}</span>
            </div>
            <div style={{ ...lineStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Total Recaudado (USD)</span>
              <span style={{ ...valueStyle, color: C.emerald, fontSize: 12, fontWeight: 800 }}>{fmtUsd(parseFloat(entrega?.total_usd) || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer blocks */}
      <div style={{ padding: '0 36px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 3, height: 16, background: C.navy, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Desglose de Transferencias por Beneficiario</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {transferencias.map((t, i) => (
            <div key={i} style={{
              border: `1px solid ${t.color}25`,
              borderRadius: 10,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: t.bg,
            }}>
              {/* Top: info */}
              <div style={{ padding: '10px 14px', borderBottom: `1px solid ${t.color}20`, background: C.white, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 8.5, fontWeight: 800, color: 'white' }}>{t.porcentaje.replace('%', '')}</span>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: C.navy, lineHeight: 1 }}>{t.ente}</div>
                  <div style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{t.porcentaje} del total recaudado</div>
                </div>
              </div>

              {/* Bottom: amounts */}
              <div style={{ padding: '10px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '3px 10px', fontSize: 9.5, alignItems: 'center' }}>
                  <div style={{ color: C.muted }}>Bruto:</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: C.ink }}>{t.brutoBs}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: C.inkMid }}>{t.brutoUsd}</div>

                  <div style={{ color: C.rose, fontStyle: 'italic' }}>Deduc.:</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: C.rose }}>{t.deduccionBs}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: C.roseMid }}>{t.deduccionUsd}</div>

                  <div style={{ gridColumn: '1 / -1', height: 1, background: `${t.color}30`, margin: '3px 0' }} />

                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase', color: t.color }}>Neto Transferido</div>
                  <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' }}>{t.netoBs}</div>
                  <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 700, color: C.emerald }}>{t.netoUsd}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deducciones / Cuentas por Cobrar */}
      <div style={{ padding: '0 36px 12px' }}>
        {/* Header band */}
        <div style={{
          background: C.roseBg,
          border: `1px solid ${C.roseBorder}`,
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: C.rose,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M3 8L8 3M3 3l5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.rose, letterSpacing: '0.02em' }}>
                Deducciones Aplicadas — Cuentas por Cobrar
              </div>
              <div style={{ fontSize: 8.5, color: '#B91C1C', marginTop: 1 }}>
                Descuentos descontados del bruto antes de liquidar. El total neto refleja estos ajustes.
              </div>
            </div>
          </div>
          <div style={{
            background: C.rose, color: 'white',
            fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
            padding: '3px 10px', borderRadius: 20,
          }}>DESCUENTOS</div>
        </div>

        {/* Deductions table */}
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          border: `1px solid ${C.roseBorder}`,
          borderTop: 'none',
          tableLayout: 'fixed',
        }}>
          <thead>
            <tr style={{ background: '#FEE2E2' }}>
              <th style={{ padding: '7px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#991B1B', textAlign: 'left', width: 36 }}>#</th>
              <th style={{ padding: '7px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#991B1B', textAlign: 'left' }}>Concepto de la Deducción</th>
              <th style={{ padding: '7px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#991B1B', textAlign: 'left', width: 90 }}>Afecta a</th>
              <th style={{ padding: '7px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#991B1B', textAlign: 'right', width: 110 }}>Monto Bs</th>
              <th style={{ padding: '7px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#991B1B', textAlign: 'right', width: 90 }}>Monto USD</th>
            </tr>
          </thead>
          <tbody>
            {deducciones.map((r: any, i: number) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#FFFAFAFA' : '#FFF5F5' }}>
                <td style={{ padding: '5px 8px', fontSize: 9, color: C.roseMid, borderBottom: `1px solid ${C.roseBorder}` }}>{(i + 1).toString().padStart(2, '0')}</td>
                <td style={{ padding: '5px 8px', fontSize: 9, color: C.inkMid, borderBottom: `1px solid ${C.roseBorder}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.concepto}</td>
                <td style={{ padding: '5px 8px', borderBottom: `1px solid ${C.roseBorder}` }}>
                  <span style={{
                    fontSize: 8.5, fontWeight: 700,
                    color: r.afecta === 'UGAVI' ? C.royal : C.emerald,
                    background: r.afecta === 'UGAVI' ? C.royalMuted : C.emeraldBg,
                    padding: '2px 7px', borderRadius: 4,
                  }}>{r.afecta}</span>
                </td>
                <td style={{ padding: '5px 8px', fontSize: 10, fontWeight: 700, color: C.rose, textAlign: 'right', borderBottom: `1px solid ${C.roseBorder}` }}>{r.bs > 0 ? `− ${fmt(r.bs)}` : '-'}</td>
                <td style={{ padding: '5px 8px', fontSize: 9.5, fontWeight: 600, color: C.roseMid, textAlign: 'right', borderBottom: `1px solid ${C.roseBorder}` }}>{r.usd > 0 ? `− ${fmtUsd(r.usd)}` : '-'}</td>
              </tr>
            ))}
            {deducciones.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '12px', fontSize: 10, color: C.roseMid, textAlign: 'center' }}>No hay deducciones aplicadas en esta entrega.</td>
              </tr>
            )}
            {/* Subtotal deducciones */}
            <tr style={{ background: '#FEE2E2' }}>
              <td colSpan={3} style={{ padding: '6px 8px', fontSize: 9.5, fontWeight: 700, color: '#991B1B', textAlign: 'right' }}>
                Total Deducciones:
              </td>
              <td style={{ padding: '6px 8px', fontSize: 11, fontWeight: 800, color: C.rose, textAlign: 'right' }}>{totalDeduccionesBs > 0 ? `− ${fmt(totalDeduccionesBs)}` : '-'}</td>
              <td style={{ padding: '6px 8px', fontSize: 10, fontWeight: 700, color: C.rose, textAlign: 'right' }}>{totalDeduccionesUsd > 0 ? `− ${fmtUsd(totalDeduccionesUsd)}` : '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>



      {/* Grand total row */}
      <div style={{ margin: '0 36px 16px', background: C.navy, borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Total Neto Liquidado</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Bruto {fmt(ugaviBaseBs + clubBaseBs)} menos deducciones {fmt(totalDeduccionesBs)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>{fmt(ugaviBs + clubBs)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: `${C.emerald}`, marginTop: 2 }}>{fmtUsd(ugaviUsd + clubUsd)}</div>
          {totalDeduccionesBs > 0 && (
            <div style={{ fontSize: 8.5, color: `${C.roseMid}`, marginTop: 3 }}>
              − {fmt(totalDeduccionesBs)} deducidos (ver detalle arriba)
            </div>
          )}
        </div>
      </div>

      {/* Signatures */}
      <div style={{ margin: '0 36px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, height: 16, background: C.navy, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Firmas y Conformidad</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, padding: '0 40px' }}>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: 36, borderBottom: `1.5px solid ${C.borderMid}`, marginBottom: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
              {/* Espacio para la firma manual */}
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: C.inkMid }}>
              {config?.firma_secretario_nombre || '________________________'}
            </div>
            <div style={{ fontSize: 8.5, color: C.slateMuted, marginTop: 2 }}>
              C.I. {config?.firma_secretario_cedula || '_________________'}
            </div>
            <div style={{ fontSize: 8, color: C.slateMuted, marginTop: 2 }}>Secretario(a) Fondo de UGAVI para Desarrollo Agropecuario</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ height: 36, borderBottom: `1.5px solid ${C.borderMid}`, marginBottom: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
              {/* Espacio para la firma manual */}
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: C.inkMid }}>
              {config?.firma_admin_nombre || '________________________'}
            </div>
            <div style={{ fontSize: 8.5, color: C.slateMuted, marginTop: 2 }}>
              C.I. {config?.firma_admin_cedula || '_________________'}
            </div>
            <div style={{ fontSize: 8, color: C.slateMuted, marginTop: 2 }}>Administrador(a) de UGAVI</div>
          </div>

        </div>
      </div>

      {/* Legal note */}
      <div style={{ margin: '0 36px 0', padding: '8px 14px', background: '#FFFBEB', border: `1px solid ${C.amber}25`, borderRadius: 8 }}>
        <div style={{ fontSize: 8.5, color: '#92400E', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>Nota Legal:</span> Este comprobante certifica la liquidación y distribución de fondos recaudados durante el período indicado. Documento válido con firma de los responsables. · SIGAMA
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        borderTop: `1px solid ${C.border}`,
        padding: '12px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: C.slateLight,
      }}>
        <div style={{ fontSize: 8.5, color: C.slateMuted }}>
          SIGAMA · Comprobante de Liquidación · Documento oficial sujeto a verificación
        </div>
        <div style={{ fontSize: 8.5, color: C.slateMuted }}>#ENT-{entrega?.id?.toString().padStart(4, '0') || '0000'} · {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DummyApp() {
  const [active, setActive] = useState<'reporte' | 'comprobante'>('reporte')

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 24px',
    fontSize: 12,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? C.white : C.muted,
    background: isActive ? C.royal : 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    letterSpacing: '0.01em',
    fontFamily: "'Inter', sans-serif",
  })

  return (
    <div className="print-wrapper" style={{ minHeight: '100vh', background: '#DDE3EF', padding: '28px 20px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white !important; }
          .no-print { display: none !important; }
          .print-wrapper { padding: 0 !important; background: white !important; min-height: 0 !important; }
          @page { margin: 0; size: letter; }
        }
      `}</style>

      {/* Controls bar */}
      <div className="no-print" style={{
        maxWidth: 860,
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' }}>SIGAMA · Reportes PDF</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Vista previa de documentos · Resolución Carta (816 × 1056 px)</div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.6)', padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <button style={tabStyle(active === 'reporte')} onClick={() => setActive('reporte')}>
            Reporte de Pagos
          </button>
          <button style={tabStyle(active === 'comprobante')} onClick={() => setActive('comprobante')}>
            Comprobante de Entrega
          </button>
        </div>
      </div>

      {/* Document shadow wrapper */}
      <div style={{
        maxWidth: 860,
        margin: '0 auto',
        boxShadow: '0 4px 40px rgba(12,35,64,0.18)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        {active === 'reporte' ? <ReporteGeneral data={{}} periodo="" /> : <ComprobanteEntrega data={{}} />}
      </div>

      {/* Bottom hint */}
      <div style={{ maxWidth: 860, margin: '16px auto 0', textAlign: 'center', fontSize: 10, color: C.slateMuted }}>
        Estos documentos están optimizados para generación PDF (Dompdf / TCPDF). Los estilos son inline-compatible.
      </div>
    </div>
  )
}
