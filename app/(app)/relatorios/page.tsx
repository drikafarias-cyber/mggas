'use client'
import { useEffect, useState } from 'react'

const fmt = (v: any) => 'R$ ' + Number(v||0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const today = () => new Date().toISOString().split('T')[0]

const PGTO_LABELS: Record<string, string> = {
  'Pix': '📱 Pix',
  'Dinheiro': '💵 Dinheiro',
  'Cartão Crédito Visa': '💳 Crédito Visa',
  'Cartão Crédito Master': '💳 Crédito Master',
  'Cartão Débito': '💳 Débito',
  'App Ultragaz': '📲 App Ultragaz',
  'Vale Gás Ultragaz': '🎫 Vale Gás',
  'Gás do Povo': '🏛️ Gás do Povo',
  'Fiado': '📋 Fiado',
}

export default function RelatoriosPage() {
  const [aba, setAba] = useState<'diario'|'vendas'|'gastos'>('diario')
  const [data, setData] = useState(today())
  const [de, setDe] = useState(today())
  const [ate, setAte] = useState(today())
  const [dados, setDados] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { buscar() }, [aba, data, de, ate])

  async function buscar() {
    setLoading(true)
    let url = `/api/relatorios?tipo=${aba}&data=${data}`
    if (aba !== 'diario') url += `&de=${de}&ate=${ate}`
    const d = await fetch(url).then(r => r.json())
    setDados(d); setLoading(false)
  }

  const totalRecebido = dados?.porPgto?.filter((p: any) => !['Gás do Povo','Fiado','Vale Gás Ultragaz'].includes(p.forma_pagamento)).reduce((a: number, p: any) => a + Number(p.total), 0) || 0
  const totalAReceber = dados?.aReceber?.reduce((a: number, p: any) => a + Number(p.total), 0) || 0

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Relatórios</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
        {[{k:'diario',l:'📊 Diário'},{k:'vendas',l:'📦 Vendas'},{k:'gastos',l:'💸 Gastos'}].map(({k,l}) => (
          <button key={k} onClick={() => setAba(k as any)}
            style={{ padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: aba===k?500:400, background: aba===k?'var(--accent)':'transparent', color: aba===k?'#000':'var(--muted)' }}>
            {l}
          </button>
        ))}
      </div>

      {aba === 'diario' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>Data:</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', color: 'var(--text)', fontSize: 13 }} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>De:</label>
          <input type="date" value={de} onChange={e => setDe(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', color: 'var(--text)', fontSize: 13 }} />
          <label style={{ fontSize: 12, color: 'var(--muted)' }}>Até:</label>
          <input type="date" value={ate} onChange={e => setAte(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', color: 'var(--text)', fontSize: 13 }} />
        </div>
      )}

      {loading && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Carregando...</div>}

      {!loading && aba === 'diario' && dados && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { l: 'Total vendido', v: fmt(dados.totais?.total_vendas), c: '#3ddc97' },
              { l: 'Recebido hoje', v: fmt(totalRecebido), c: '#5c9dff' },
              { l: 'A receber', v: fmt(totalAReceber), c: '#f5a623' },
              { l: 'Pedidos', v: String(dados.totais?.total_pedidos || 0), c: 'var(--text)' },
            ].map(m => (
              <div key={m.l} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', marginBottom: 6 }}>{m.l}</div>
                <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'IBM Plex Mono', color: m.c }}>{m.v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>Por forma de pagamento</div>
              {(dados.porPgto || []).length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Sem vendas nesta data.</div>}
              {(dados.porPgto || []).map((p: any) => {
                const aRec = ['Gás do Povo','Fiado','Vale Gás Ultragaz'].includes(p.forma_pagamento)
                return (
                  <div key={p.forma_pagamento} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 13 }}>{PGTO_LABELS[p.forma_pagamento] || p.forma_pagamento}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.qtd} pedido{p.qtd > 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 500, color: aRec ? '#f5a623' : '#3ddc97' }}>{fmt(p.total)}</div>
                      {aRec && <div style={{ fontSize: 10, color: '#f5a623' }}>a receber</div>}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>Por local de venda</div>
              {(dados.porLocal || []).length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Sem vendas nesta data.</div>}
              {(dados.porLocal || []).map((p: any) => (
                <div key={p.local_venda} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13 }}>{p.local_venda === 'Carro' ? '🚗 Carro' : '🏢 Portaria'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.qtd} pedido{p.qtd > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 500, color: '#5c9dff' }}>{fmt(p.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!loading && aba === 'vendas' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Produto','Tipo','Local','Pagamento','Pedidos','Unidades','Total'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {(Array.isArray(dados) ? dados : []).map((r: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{r.produto}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--muted)' }}>{r.tipo_produto}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13 }}>{r.local_venda === 'Carro' ? '🚗' : '🏢'} {r.local_venda}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12 }}>{PGTO_LABELS[r.forma_pagamento] || r.forma_pagamento}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{r.qtd_pedidos}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{r.qtd_unidades}</td>
                  <td style={{ padding: '10px 16px', fontSize: 13, fontFamily: 'IBM Plex Mono', color: '#3ddc97' }}>{fmt(r.total)}</td>
                </tr>
              ))}
              {(!Array.isArray(dados) || dados.length === 0) && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>Sem vendas no período.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && aba === 'gastos' && dados && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>Por categoria</div>
            {(dados.resumo || []).map((r: any) => (
              <div key={r.categoria} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13 }}>{r.categoria}</span>
                <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, color: '#ff5c5c' }}>{fmt(r.total)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 16px', background: 'rgba(255,92,92,.05)' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Total</span>
              <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 600, color: '#ff5c5c' }}>{fmt((dados.resumo||[]).reduce((a: number, r: any) => a+Number(r.total), 0))}</span>
            </div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>Detalhamento</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Descrição','Categoria','Valor','Data'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {(dados.detalhe || []).map((r: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 16px', fontSize: 13 }}>{r.descricao}</td>
                    <td style={{ padding: '9px 16px', fontSize: 12, color: 'var(--muted)' }}>{r.categoria}</td>
                    <td style={{ padding: '9px 16px', fontSize: 13, fontFamily: 'IBM Plex Mono', color: '#ff5c5c' }}>{fmt(r.valor)}</td>
                    <td style={{ padding: '9px 16px', fontSize: 12, color: 'var(--muted)' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
                {(dados.detalhe||[]).length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>Sem gastos no período.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
