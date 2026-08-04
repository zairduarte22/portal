import { useState } from 'react'

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  navy:        '#0C2340',
  royal:       '#1A52A8',
  royalLight:  '#2563EB',
  royalMuted:  '#EBF2FF',
  emerald:     '#059669',
  emeraldBg:   '#ECFDF5',
  amber:       '#D97706',
  amberBg:     '#FFFBEB',
  rose:        '#DC2626',
  roseMid:     '#EF4444',
  roseBg:      '#FFF1F1',
  roseBorder:  '#FECACA',
  violet:      '#7C3AED',
  violetBg:    '#F5F3FF',
  violetBorder:'#DDD6FE',
  slate:       '#64748B',
  slateMuted:  '#94A3B8',
  slateLight:  '#F1F5F9',
  border:      '#E2E8F0',
  borderMid:   '#CBD5E1',
  white:       '#FFFFFF',
  ink:         '#0F172A',
  inkMid:      '#1E293B',
  muted:       '#64748B',
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
          <path d="M3 17L8 12L11 15L16 9L19 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="11" cy="7" r="2.5" fill="white" fillOpacity="0.4"/>
          <path d="M4 5h14M4 5v12" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
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
export function ReporteGeneral({ data, periodo, titulo = '{titulo}' }: { data: any, periodo: string, titulo?: string }) {
  const fmt = (n: number) => 'Bs ' + Number(n).toLocaleString('es-VE', { minimumFractionDigits: 2 })
  const fmtUsd = (n: number) => '$ ' + Number(n).toLocaleString('es-VE', { minimumFractionDigits: 2 })
  const nTransacciones = (data?.pagoMovil?.length || 0) + (data?.otrosMetodos?.length || 0) + (data?.cruces?.length || 0)
  
  const kpis = [
    { label: 'Total Recaudado', sub: 'Bolívares (Bs)', value: fmt(data?.totales?.grandTotalRecibidoBs || 0), color: C.royal, bg: C.royalMuted, icon: '💰' },
    { label: 'Total Recaudado', sub: 'Dólares (USD)', value: fmtUsd(data?.totales?.grandTotalRecibidoDivisas || 0), color: C.emerald, bg: C.emeraldBg, icon: '$' },
    { label: 'Nº Transacciones', sub: 'En el período', value: nTransacciones.toString(), color: C.amber, bg: C.amberBg, icon: '#' },
    { label: 'Tasa Promedio', sub: 'BCV (Estimado)', value: 'N/A', color: C.slate, bg: C.slateLight, icon: '~' },
  ]
  const pagosBs: any[] = data?.pagoMovil || []
  const pagosDiv: any[] = data?.otrosMetodos || []
  const pagosCruces: any[] = data?.cruces || []


  // FECHA | FACT | MONTO BS | 60% UGAVI | 20% (Club o Fondo)




  const distribucion = [
    { ente: 'UGAVI', porcentaje: 60, color: C.royal, bg: C.royalMuted, bs: fmt(data?.totales?.repartoUgaviBs || 0), usd: fmtUsd(data?.totales?.repartoUgaviDivisas || 0) },
    { ente: 'Club', porcentaje: 20, color: C.emerald, bg: C.emeraldBg, bs: fmt(data?.totales?.repartoClubBs || 0), usd: fmtUsd(data?.totales?.repartoClubDivisas || 0) },
    { ente: 'Fondo', porcentaje: 20, color: C.amber, bg: C.amberBg, bs: fmt(data?.totales?.repartoFondoBs || 0), usd: fmtUsd(data?.totales?.repartoFondoDivisas || 0) },
  ]

  const thStyle: React.CSSProperties = {
    padding: '9px 12px',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: C.muted,
    textAlign: 'left',
    borderBottom: `1px solid ${C.border}`,
    background: C.slateLight,
    whiteSpace: 'nowrap',
  }
  const thRight: React.CSSProperties = { ...thStyle, textAlign: 'right' }

  return (
    <div style={{
      width: 816,
      minHeight: 1056,
      background: C.white,
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      color: C.ink,
      position: 'relative',
    }}>
      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.navy} 0%, ${C.royalLight} 60%, ${C.emerald} 100%)` }} />

      {/* Header */}
      <div style={{ padding: '24px 36px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BrandHeader />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {titulo}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{periodo}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <CompanyInfo />
          <div style={{
            background: C.royalMuted,
            border: `1px solid ${C.royal}30`,
            borderRadius: 20,
            padding: '5px 14px',
            fontSize: 10,
            fontWeight: 600,
            color: C.royal,
            letterSpacing: '0.02em',
          }}>
            01/Jul/2026 — 31/Jul/2026
          </div>
          <div style={{ fontSize: 9, color: C.slateMuted }}>
            Emitido: 04/Ago/2026 · Ref: RPG-2026-07
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ padding: '20px 36px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{
            background: k.bg,
            border: `1px solid ${k.color}20`,
            borderRadius: 10,
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: k.color, borderRadius: '10px 10px 0 0',
            }} />
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: k.color, marginBottom: 6 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Shared table head renderer */}
      {/* Table Bs */}
      <div style={{ padding: '0 36px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, background: C.royal, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: '-0.01em' }}>Pagos en Bolívares (Bs)</div>
          <div style={{ marginLeft: 'auto', fontSize: 9, color: C.muted }}>{pagosBs.length} registros</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 82 }}>Fecha</th>
              <th style={{ ...thStyle, width: 72 }}>Fact.</th>
              <th style={{ ...thRight }}>Monto Bs</th>
              <th style={{ ...thRight, width: 110 }}>Monto 60%</th>
              <th style={{ ...thRight, width: 110 }}>Monto 20%</th>
            </tr>
          </thead>
          <tbody>
            {pagosBs.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.white : '#F8FAFC' }}>
                <td style={{ padding: '7px 12px', fontSize: 9, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{r.fecha}</td>
                <td style={{ padding: '7px 12px', fontSize: 9, fontWeight: 600, color: C.inkMid, borderBottom: `1px solid ${C.border}` }}>{r.fact}</td>
                <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.royal, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.monto)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.p60)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.slate, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.p20)}</td>
              </tr>
            ))}
            <tr style={{ background: C.royalMuted }}>
              <td colSpan={2} style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: C.navy }}>Subtotal Bolívares</td>
              <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: C.navy, textAlign: 'right' }}>{fmt(pagosBs.reduce((s,r)=>s+r.monto,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.navy, textAlign: 'right' }}>{fmt(pagosBs.reduce((s,r)=>s+r.p60,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.navy, textAlign: 'right' }}>{fmt(pagosBs.reduce((s,r)=>s+r.p20,0))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table Divisas */}
      <div style={{ padding: '0 36px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 3, height: 16, background: C.emerald, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: '-0.01em' }}>Pagos en Divisas</div>
          <div style={{ marginLeft: 'auto', fontSize: 9, color: C.muted }}>{pagosDiv.length} registros</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 82 }}>Fecha</th>
              <th style={{ ...thStyle, width: 68 }}>Fact.</th>
              <th style={{ ...thRight, width: 90 }}>Monto USD</th>
              <th style={{ ...thRight }}>Monto Bs</th>
              <th style={{ ...thRight, width: 100 }}>Monto 60%</th>
              <th style={{ ...thRight, width: 100 }}>Monto 20%</th>
            </tr>
          </thead>
          <tbody>
            {pagosDiv.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.white : '#F8FAFC' }}>
                <td style={{ padding: '7px 12px', fontSize: 9, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{r.fecha}</td>
                <td style={{ padding: '7px 12px', fontSize: 9, fontWeight: 600, color: C.inkMid, borderBottom: `1px solid ${C.border}` }}>{r.fact}</td>
                <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.emerald, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtUsd(r.usd)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.monto)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.p60)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.slate, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmt(r.p20)}</td>
              </tr>
            ))}
            <tr style={{ background: C.emeraldBg }}>
              <td colSpan={2} style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: '#065F46' }}>Subtotal Divisas</td>
              <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: C.emerald, textAlign: 'right' }}>{fmtUsd(pagosDiv.reduce((s,r)=>s+r.usd,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 800, color: '#065F46', textAlign: 'right' }}>{fmt(pagosDiv.reduce((s,r)=>s+r.monto,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#065F46', textAlign: 'right' }}>{fmt(pagosDiv.reduce((s,r)=>s+r.p60,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#065F46', textAlign: 'right' }}>{fmt(pagosDiv.reduce((s,r)=>s+r.p20,0))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table Cruces de Cuentas */}
      <div style={{ padding: '0 36px 20px' }}>
        {/* Alert banner */}
        <div style={{
          background: C.violetBg,
          border: `1px solid ${C.violetBorder}`,
          borderRadius: '10px 10px 0 0',
          padding: '9px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: C.violet,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 2v3.5M5.5 8h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: C.violet }}>Pagos por Cruce de Cuentas — Dinero Contabilizado / No Bancario</span>
            <span style={{ fontSize: 8.5, color: '#6D28D9', marginLeft: 8 }}>
              Estos montos fueron compensados internamente. No representan depósito físico en banco.
            </span>
          </div>
        </div>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          border: `1px solid ${C.violetBorder}`,
          borderTop: 'none',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
          tableLayout: 'fixed',
        }}>
          <thead>
            <tr style={{ background: '#EDE9FE' }}>
              <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'left', width: 82 }}>Fecha</th>
              <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'left', width: 72 }}>Fact.</th>
              <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'right' }}>Monto Bs</th>
              <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'right', width: 110 }}>Monto 60%</th>
              <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5B21B6', textAlign: 'right', width: 110 }}>Monto 20%</th>
            </tr>
          </thead>
          <tbody>
            {pagosCruces.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.white : '#FAF8FF' }}>
                <td style={{ padding: '7px 12px', fontSize: 9, color: C.muted, borderBottom: `1px solid ${C.violetBorder}` }}>{r.fecha}</td>
                <td style={{ padding: '7px 12px', borderBottom: `1px solid ${C.violetBorder}` }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 7.5, fontWeight: 700, background: C.violet, color: 'white', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.05em' }}>NB</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: C.inkMid }}>{r.fact}</span>
                  </div>
                </td>
                <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.violet, textAlign: 'right', borderBottom: `1px solid ${C.violetBorder}` }}>{fmt(r.monto)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.navy, textAlign: 'right', borderBottom: `1px solid ${C.violetBorder}` }}>{fmt(r.p60)}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.slate, textAlign: 'right', borderBottom: `1px solid ${C.violetBorder}` }}>{fmt(r.p20)}</td>
              </tr>
            ))}
            <tr style={{ background: '#EDE9FE' }}>
              <td colSpan={2} style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: '#5B21B6' }}>Subtotal Cruces (no bancario)</td>
              <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: '#5B21B6', textAlign: 'right' }}>{fmt(pagosCruces.reduce((s,r)=>s+r.monto,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#5B21B6', textAlign: 'right' }}>{fmt(pagosCruces.reduce((s,r)=>s+r.p60,0))}</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#5B21B6', textAlign: 'right' }}>{fmt(pagosCruces.reduce((s,r)=>s+r.p20,0))}</td>
            </tr>
          </tbody>
        </table>
        <div style={{
          marginTop: 6,
          padding: '6px 12px',
          background: '#FAF8FF',
          border: `1px dashed ${C.violetBorder}`,
          borderRadius: 6,
          fontSize: 8.5,
          color: '#6D28D9',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="#7C3AED" strokeWidth="1"/>
            <path d="M5 3v2.5l1.5 1" stroke="#7C3AED" strokeWidth="1" strokeLinecap="round"/>
          </svg>
          Este subtotal <strong style={{ margin: '0 3px' }}>sí se incluye</strong> en el Total Bruto Recaudado, pero <strong style={{ margin: '0 3px' }}>no genera flujo bancario</strong>. Revisar con tesorería antes de conciliar.
        </div>
      </div>

      {/* Distribution */}
      <div style={{ padding: '0 36px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 3, height: 16, background: C.navy, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Distribución de Recaudación</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {distribucion.map((d, i) => (
            <div key={i} style={{
              border: `1px solid ${d.color}25`,
              borderRadius: 10,
              overflow: 'hidden',
            }}>
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

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '12px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: C.slateLight,
      }}>
        <div style={{ fontSize: 8.5, color: C.slateMuted }}>
          SIGAMA · Reporte Generado Automáticamente · Documento de carácter informativo interno
        </div>
        <div style={{ fontSize: 8.5, color: C.slateMuted }}>Página 1 de 1 · RPG-2026-07</div>
      </div>
    </div>
  )
}

// ─── Report 2: Comprobante de Liquidación ─────────────────────────────────────
export function ComprobanteEntrega({ data, rango, periodo }: { data: any, rango?: string, periodo?: string }) {
  const entrega = data?.entrega || data || {}
  const deducciones = data?.deducciones || []

  const fmt = (n: number) => 'Bs ' + Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
  const fmtUsd = (n: number) => '$ ' + Number(n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })

  const ugaviBs = parseFloat(entrega?.monto_pagado_ugavi_bs) || 0
  const ugaviUsd = parseFloat(entrega?.monto_pagado_ugavi_usd) || 0
  const ugaviBaseBs = parseFloat(entrega?.ugavi_base_bs) || 0
  const ugaviBaseUsd = parseFloat(entrega?.ugavi_base_usd) || 0
  const deduccionUgaviBs = deducciones.filter((d: any) => d.afecta === 'UGAVI').reduce((acc: number, d: any) => acc + d.bs, 0)
  const deduccionUgaviUsd = deducciones.filter((d: any) => d.afecta === 'UGAVI').reduce((acc: number, d: any) => acc + d.usd, 0)
  
  const clubBs = parseFloat(entrega?.monto_pagado_club_bs) || 0
  const clubUsd = parseFloat(entrega?.monto_pagado_club_usd) || 0
  const clubBaseBs = parseFloat(entrega?.club_base_bs) || 0
  const clubBaseUsd = parseFloat(entrega?.club_base_usd) || 0
  const deduccionClubBs = deducciones.filter((d: any) => d.afecta === 'Club').reduce((acc: number, d: any) => acc + d.bs, 0)
  const deduccionClubUsd = deducciones.filter((d: any) => d.afecta === 'Club').reduce((acc: number, d: any) => acc + d.usd, 0)
  
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
      minHeight: 1056,
      background: C.white,
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      color: C.ink,
      position: 'relative',
    }}>
      {/* Top accent */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${C.navy} 0%, ${C.royalLight} 60%, ${C.emerald} 100%)` }} />

      {/* Header */}
      <div style={{
        padding: '28px 36px 24px',
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
          <div style={{
            background: '#FFF8F0',
            border: `1px solid ${C.amber}30`,
            borderRadius: 8,
            padding: '8px 14px',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.amber, marginBottom: 3 }}>
              Estado
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>● Pendiente de Firma</div>
          </div>
        </div>
      </div>

      {/* Meta block */}
      <div style={{ padding: '20px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
            <div style={lineStyle}>
              <span style={labelStyle}>Período que Abarca</span>
              <span style={valueStyle}>{entrega?.rango_desde ? new Date(entrega.rango_desde + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : ''} – {entrega?.rango_hasta ? new Date(entrega.rango_hasta + 'T00:00:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
            </div>
            <div style={lineStyle}>
              <span style={labelStyle}>Referencia Reporte</span>
              <span style={valueStyle}>RPG-{entrega?.fecha?.substring(0, 7) || ''}</span>
            </div>
            <div style={{ ...lineStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Elaborado por</span>
              <span style={valueStyle}>Adm. Sistema SIGAMA</span>
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
            <div style={lineStyle}>
              <span style={labelStyle}>Total Recaudado (USD)</span>
              <span style={{ ...valueStyle, color: C.emerald, fontSize: 12, fontWeight: 800 }}>{fmtUsd(parseFloat(entrega?.total_usd) || 0)}</span>
            </div>
            <div style={lineStyle}>
              <span style={labelStyle}>Tasa BCV Referencial</span>
              <span style={valueStyle}>Bs {parseFloat(entrega?.tasa_cambio || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} / USD</span>
            </div>
            <div style={{ ...lineStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Nº Transacciones</span>
              <span style={valueStyle}>{data?.pagos_count || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer blocks */}
      <div style={{ padding: '0 36px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 3, height: 16, background: C.navy, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Desglose de Transferencias por Beneficiario</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transferencias.map((t, i) => (
            <div key={i} style={{
              border: `1px solid ${t.color}25`,
              borderRadius: 10,
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
            }}>
              {/* Left: info */}
              <div style={{ padding: '14px 18px', borderRight: `1px solid ${t.color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'white' }}>{t.porcentaje.replace('%','')}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{t.ente}</div>
                    <div style={{ fontSize: 8.5, color: C.muted }}>{t.descripcion} · {t.porcentaje} del total</div>
                  </div>
                </div>
                <div style={{ height: 1, background: C.border, margin: '8px 0' }} />
                <div style={{ fontSize: 8.5, color: C.slateMuted, lineHeight: 1.7 }}>
                  <div><span style={{ fontWeight: 600, color: C.muted }}>Banco:</span> {t.banco}</div>
                  <div><span style={{ fontWeight: 600, color: C.muted }}>Cuenta:</span> {t.cuenta}</div>
                  <div><span style={{ fontWeight: 600, color: C.muted }}>Titular:</span> {t.titular}</div>
                </div>
              </div>
              {/* Right: amounts */}
              <div style={{ background: t.bg, padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 260 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px 16px', fontSize: 10, alignItems: 'center' }}>
                    <div style={{ color: C.muted }}>Ingreso Bruto:</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: C.ink }}>{t.brutoBs}</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: C.inkMid }}>{t.brutoUsd}</div>
                    
                    <div style={{ color: C.rose, fontStyle: 'italic' }}>Deducciones (CxC):</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: C.rose }}>{t.deduccionBs}</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: C.roseMid }}>{t.deduccionUsd}</div>
                    
                    <div style={{ gridColumn: '1 / -1', height: 1, background: `${t.color}30`, margin: '4px 0' }} />
                    
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.color, marginTop: 2 }}>Neto a Transferir</div>
                    <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' }}>{t.netoBs}</div>
                    <div style={{ textAlign: 'right', fontSize: 11, fontWeight: 700, color: C.emerald }}>{t.netoUsd}</div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deducciones / Cuentas por Cobrar */}
      <div style={{ padding: '0 36px 16px' }}>
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
                <path d="M3 8L8 3M3 3l5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
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
      <div style={{ margin: '0 36px 24px', background: C.navy, borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Total Neto a Liquidar</div>
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
      <div style={{ margin: '0 36px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, height: 16, background: C.navy, borderRadius: 2 }} />
          <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>Firmas y Conformidad</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {['Elaborado por', 'Revisado por', 'Aprobado por'].map((label, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ height: 48, borderBottom: `1.5px solid ${C.borderMid}`, marginBottom: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
                {i === 0 && (
                  <div style={{ fontSize: 8.5, color: C.slateMuted, fontStyle: 'italic' }}>Sistema SIGAMA</div>
                )}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.inkMid }}>{label}</div>
              <div style={{ fontSize: 8.5, color: C.slateMuted, marginTop: 2 }}>
                {i === 0 ? 'Administrador · SIGAMA' : i === 1 ? 'Gerencia Administrativa · UGAVI' : 'Directiva del Club'}
              </div>
              <div style={{ fontSize: 8, color: C.slateMuted, marginTop: 2 }}>Fecha: ___/___/______</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal note */}
      <div style={{ margin: '0 36px 0', padding: '12px 14px', background: '#FFFBEB', border: `1px solid ${C.amber}25`, borderRadius: 8 }}>
        <div style={{ fontSize: 8.5, color: '#92400E', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700 }}>Nota Legal:</span> Este comprobante certifica la liquidación y distribución de fondos recaudados durante el período indicado conforme a los estatutos vigentes de UGAVI y el acuerdo de distribución aprobado en asamblea. Documento válido con firma y sello de los responsables. · Ref. #ENT-0045 · SIGAMA v2.0
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: '12px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: C.slateLight,
        marginTop: 20,
      }}>
        <div style={{ fontSize: 8.5, color: C.slateMuted }}>
          SIGAMA · Comprobante de Liquidación · Documento oficial sujeto a verificación
        </div>
        <div style={{ fontSize: 8.5, color: C.slateMuted }}>#ENT-0045 · 04/Ago/2026</div>
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
    <div style={{ minHeight: '100vh', background: '#DDE3EF', padding: '28px 20px', fontFamily: "'Inter', sans-serif" }}>
      {/* Controls bar */}
      <div style={{
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
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Vista previa de documentos · Resolución A4 (794 × 1123 px)</div>
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
