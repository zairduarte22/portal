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

// ─── Report 1: Reporte General de Pagos ──────────────────────────────────────
function ReporteGeneral() {
  const kpis = [
    { label: 'Total Recaudado', sub: 'Bolívares (Bs)', value: 'Bs 1.842.560,00', color: C.royal, bg: C.royalMuted, icon: '₿' },
    { label: 'Total Recaudado', sub: 'Dólares (USD)', value: '$ 45.960,25', color: C.emerald, bg: C.emeraldBg, icon: '$' },
    { label: 'Nº Transacciones', sub: 'En el período', value: '214', color: C.amber, bg: C.amberBg, icon: '#' },
    { label: 'Tasa Promedio', sub: 'BCV aplicada', value: 'Bs 40,09', color: C.slate, bg: C.slateLight, icon: '~' },
  ]

  // FECHA | FACT | MONTO BS | 60% UGAVI | 20% (Club o Fondo)
  const pagosBs = [
    { fecha: '02/07/2026', fact: 'F-0081', monto: 4800,   p60:  2880,  p20:  960  },
    { fecha: '03/07/2026', fact: 'F-0082', monto: 4800,   p60:  2880,  p20:  960  },
    { fecha: '05/07/2026', fact: 'F-0083', monto: 12000,  p60:  7200,  p20:  2400 },
    { fecha: '08/07/2026', fact: 'F-0084', monto: 4800,   p60:  2880,  p20:  960  },
    { fecha: '10/07/2026', fact: 'F-0085', monto: 9200,   p60:  5520,  p20:  1840 },
    { fecha: '12/07/2026', fact: 'F-0086', monto: 4800,   p60:  2880,  p20:  960  },
    { fecha: '15/07/2026', fact: 'F-0087', monto: 4800,   p60:  2880,  p20:  960  },
    { fecha: '18/07/2026', fact: 'F-0088', monto: 6000,   p60:  3600,  p20:  1200 },
  ]

  const pagosDiv = [
    { fecha: '01/07/2026', fact: 'D-0021', usd: 120.00,  monto: 4812,   p60:  2887,  p20:  962  },
    { fecha: '04/07/2026', fact: 'D-0022', usd: 250.00,  monto: 10020,  p60:  6012,  p20:  2004 },
    { fecha: '07/07/2026', fact: 'D-0023', usd: 120.00,  monto: 4812,   p60:  2887,  p20:  962  },
    { fecha: '11/07/2026', fact: 'D-0024', usd: 120.00,  monto: 4814,   p60:  2889,  p20:  963  },
    { fecha: '14/07/2026', fact: 'D-0025', usd: 500.00,  monto: 20075,  p60:  12045, p20:  4015 },
  ]
  const fmtUsd = (n: number) => '$ ' + n.toLocaleString('es-VE', { minimumFractionDigits: 2 })

  const pagosCruces = [
    { fecha: '06/07/2026', fact: 'C-0011', monto: 8500,   p60:  5100,  p20:  1700 },
    { fecha: '13/07/2026', fact: 'C-0012', monto: 4800,   p60:  2880,  p20:  960  },
    { fecha: '20/07/2026', fact: 'C-0013', monto: 12000,  p60:  7200,  p20:  2400 },
  ]

  const fmt = (n: number) => 'Bs ' + n.toLocaleString('es-VE', { minimumFractionDigits: 2 })

  const distribucion = [
    { ente: 'UGAVI', porcentaje: 60, color: C.royal, bg: C.royalMuted, bs: 'Bs 1.105.536,00', usd: '$ 27.576,15' },
    { ente: 'Club', porcentaje: 20, color: C.emerald, bg: C.emeraldBg, bs: 'Bs 368.512,00', usd: '$ 9.192,05' },
    { ente: 'Fondo', porcentaje: 20, color: C.amber, bg: C.amberBg, bs: 'Bs 368.512,00', usd: '$ 9.192,05' },
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
      width: 794,
      minHeight: 1123,
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
              Reporte General de Pagos
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Resumen Financiero del Período</div>
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
function ComprobanteLiquidacion() {
  const transferencias = [
    {
      ente: 'UGAVI',
      descripcion: 'Fondo de UGAVI para Desarrollo Agropecuario',
      porcentaje: '60%',
      brutoBs: 'Bs 1.105.536,00',
      brutoUsd: '$ 27.576,15',
      deduccionBs: '− Bs 68.000,00',
      deduccionUsd: '− $ 1.696,69',
      netoBs: 'Bs 1.037.536,00',
      netoUsd: '$ 25.879,46',
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
      brutoBs: 'Bs 368.512,00',
      brutoUsd: '$ 9.192,05',
      deduccionBs: '− Bs 15.200,00',
      deduccionUsd: '− $ 379,20',
      netoBs: 'Bs 353.312,00',
      netoUsd: '$ 8.812,85',
      color: C.emerald,
      bg: C.emeraldBg,
      banco: 'Banco de Venezuela',
      cuenta: 'Cta. Cte. · 0102-0251-07-0000125634',
      titular: 'Club Social y Deportivo – RIF J-29187451-3',
    },
    {
      ente: 'Fondo de Reserva',
      descripcion: 'Fondo Especial de Contingencias y Mantenimiento',
      porcentaje: '20%',
      brutoBs: 'Bs 368.512,00',
      brutoUsd: '$ 9.192,05',
      color: C.amber,
      bg: C.amberBg,
      banco: 'Banco Provincial BBVA',
      cuenta: 'Cta. Ahorro · 0108-0185-32-0100145922',
      titular: 'Fondo de Reserva UGAVI – RIF J-30646602-9',
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
      width: 794,
      minHeight: 1123,
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
              #ENT-0045
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
              <span style={valueStyle}>04 de Agosto, 2026</span>
            </div>
            <div style={lineStyle}>
              <span style={labelStyle}>Período que Abarca</span>
              <span style={valueStyle}>01/Jul/2026 – 31/Jul/2026</span>
            </div>
            <div style={lineStyle}>
              <span style={labelStyle}>Referencia Reporte</span>
              <span style={valueStyle}>RPG-2026-07</span>
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
              <span style={{ ...valueStyle, color: C.royal, fontSize: 12, fontWeight: 800 }}>Bs 1.842.560,00</span>
            </div>
            <div style={lineStyle}>
              <span style={labelStyle}>Total Recaudado (USD)</span>
              <span style={{ ...valueStyle, color: C.emerald, fontSize: 12, fontWeight: 800 }}>$ 45.960,25</span>
            </div>
            <div style={lineStyle}>
              <span style={labelStyle}>Tasa BCV Promedio</span>
              <span style={valueStyle}>Bs 40,09 / USD</span>
            </div>
            <div style={{ ...lineStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>Nº Transacciones</span>
              <span style={valueStyle}>214</span>
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
                {t.ente !== 'Fondo de Reserva' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 16px', fontSize: 10 }}>
                    <div style={{ color: C.muted }}>Ingreso Bruto:</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: C.ink }}>{t.brutoBs}</div>
                    
                    <div style={{ color: C.rose, fontStyle: 'italic' }}>Deducciones (CxC):</div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: C.rose }}>{t.deduccionBs}</div>
                    
                    <div style={{ gridColumn: '1 / -1', height: 1, background: `${t.color}30`, margin: '4px 0' }} />
                    
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: t.color, marginTop: 2 }}>Neto a Transferir</div>
                    <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' }}>{t.netoBs}</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: t.color, marginBottom: 4 }}>Monto Bruto Retenido</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em' }}>{t.brutoBs}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.color, marginTop: 2 }}>{t.brutoUsd}</div>
                  </div>
                )}
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
            {[
              { id: '01', concepto: 'Abono a Factura de Compras · Insumos agropecuarios Lote #2026-04', afecta: 'UGAVI', bs: '− Bs 48.000,00', usd: '− $ 1.197,56' },
              { id: '02', concepto: 'Descuento por Adelanto de Fondos · Préstamo operativo Ene-2026', afecta: 'UGAVI', bs: '− Bs 20.000,00', usd: '− $ 499,13' },
              { id: '03', concepto: 'Retención por Servicio de Mantenimiento · Contrato Club Mar-2026', afecta: 'Club', bs: '− Bs 15.200,00', usd: '− $ 379,20' },
            ].map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#FFFAFAFA' : '#FFF5F5' }}>
                <td style={{ padding: '7px 12px', fontSize: 9, color: C.roseMid, borderBottom: `1px solid ${C.roseBorder}` }}>{r.id}</td>
                <td style={{ padding: '7px 12px', fontSize: 9, color: C.inkMid, borderBottom: `1px solid ${C.roseBorder}` }}>{r.concepto}</td>
                <td style={{ padding: '7px 12px', borderBottom: `1px solid ${C.roseBorder}` }}>
                  <span style={{
                    fontSize: 8.5, fontWeight: 700,
                    color: r.afecta === 'UGAVI' ? C.royal : C.emerald,
                    background: r.afecta === 'UGAVI' ? C.royalMuted : C.emeraldBg,
                    padding: '2px 7px', borderRadius: 4,
                  }}>{r.afecta}</span>
                </td>
                <td style={{ padding: '7px 12px', fontSize: 10, fontWeight: 700, color: C.rose, textAlign: 'right', borderBottom: `1px solid ${C.roseBorder}` }}>{r.bs}</td>
                <td style={{ padding: '7px 12px', fontSize: 9.5, fontWeight: 600, color: C.roseMid, textAlign: 'right', borderBottom: `1px solid ${C.roseBorder}` }}>{r.usd}</td>
              </tr>
            ))}
            {/* Subtotal deducciones */}
            <tr style={{ background: '#FEE2E2' }}>
              <td colSpan={3} style={{ padding: '8px 12px', fontSize: 9.5, fontWeight: 700, color: '#991B1B', textAlign: 'right' }}>
                Total Deducciones:
              </td>
              <td style={{ padding: '8px 12px', fontSize: 11, fontWeight: 800, color: C.rose, textAlign: 'right' }}>− Bs 83.200,00</td>
              <td style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: C.rose, textAlign: 'right' }}>− $ 2.075,89</td>
            </tr>
          </tbody>
        </table>

        {/* Bruto → Neto bridge */}
        <div style={{
          border: `1px solid ${C.roseBorder}`,
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          background: C.roseBg,
          padding: '10px 14px',
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '0 24px',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 8.5, color: '#B91C1C', fontStyle: 'italic' }}>
            El total neto a liquidar resulta del ingreso bruto recaudado menos las deducciones listadas arriba.
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ingreso Bruto</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMid }}>Bs 1.842.560,00</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 8, color: C.rose, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>Neto a Liquidar</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>Bs 1.759.360,00</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.emerald }}>$ 43.884,36</div>
          </div>
        </div>
      </div>

      {/* Grand total row */}
      <div style={{ margin: '0 36px 24px', background: C.navy, borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Total Neto a Liquidar</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Bruto Bs 1.842.560,00 menos deducciones Bs 83.200,00</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>Bs 1.759.360,00</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: `${C.emerald}`, marginTop: 2 }}>$ 43.884,36</div>
          <div style={{ fontSize: 8.5, color: `${C.roseMid}`, marginTop: 3 }}>
            − Bs 83.200,00 deducidos (ver detalle arriba)
          </div>
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
export default function App() {
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
        {active === 'reporte' ? <ReporteGeneral /> : <ComprobanteLiquidacion />}
      </div>

      {/* Bottom hint */}
      <div style={{ maxWidth: 860, margin: '16px auto 0', textAlign: 'center', fontSize: 10, color: C.slateMuted }}>
        Estos documentos están optimizados para generación PDF (Dompdf / TCPDF). Los estilos son inline-compatible.
      </div>
    </div>
  )
}
