'use client'
import { useEffect, useState } from 'react'
import { TrendingUp, Truck, Clock, Package } from 'lucide-react'

const fmt = (v: number) => 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const statusColor: Record<string, string> = { Entregue: '#3ddc97', Pendente: '#f5a623', 'Em rota': '#5c9dff', Cancelado: '#ff5c5c' }

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [estoque, setEstoque] = useState<any[]>([])
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/pedidos').then(r => r.json()),
      fetch('/api/estoque').then(r => r.json()),
      fetch('/api/lancamentos').then(r => r.json()),
    ]).then(([peds, est, lancs]) => {
      setPedidos(peds)
      setEstoque(est.estoque || [])
      setLancamentos(lancs)
      setLoading(false)
    })
  }, [])

  const hoje = pedidos.filter(p => new Date(p.created_at).toDateString() === new Date().toDateString())
  const vendas = hoje.filter(p => p.status === 'Entregue').reduce((a: number, p: any) => a + Number(p.valor_total), 0)
  const emRota = pedidos.filter(p => p.status === 'Em rota').length
  const pendentes = pedidos.filter(p => p.status === 'Pendente').length
  const p13 = estoque.find((e: any) => e.produto === 'P13 - 13kg')?.quantidade ?? 0

  if (loading) return <div style={{ padding: 32, color: 'var(--muted)' }}>Carregando...</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Vendas hoje', value: fmt(vendas), color: '#3ddc97', sub: `${hoje.length} pedidos`, Icon: TrendingUp },
          { label: 'Em rota', value: String(emRota), color: '#5c9dff', sub: 'entregas agora', Icon: Truck },
          { label: 'Pendentes', value: String(pendentes), color: '#f5a623', sub: 'aguardando saída', Icon: Clock },
          { label: 'Estoque P13', value: `${p13} un`, color: 'var(--text)', sub: 'botijões cheios', Icon: Package },
        ].map(m => (
          <div key={m.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono' }}>{m.label}</div>
              <m.Icon size={14} color="var(--muted)" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'IBM Plex Mono', color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>Últimos pedidos</span>
          <a href="/pedidos" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>Ver todos →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Cliente','Produto','Qtd','Valor','Pgto','Status'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {pedidos.slice(0, 8).map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '11px 16px', fontSize: 13 }}>{p.cliente_nome}</td>
                <td style={{ padding: '11px 16px', fontSize: 13 }}>{p.produto}</td>
                <td style={{ padding: '11px 16px', fontSize: 13 }}>{p.quantidade}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{fmt(Number(p.valor_total))}</td>
                <td style={{ padding: '11px 16px', fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>{p.forma_pagamento}</td>
                <td style={{ padding: '11px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'IBM Plex Mono', background: `${statusColor[p.status]}22`, color: statusColor[p.status] }}>{p.status}</span>
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32, fontSize: 13 }}>Nenhum pedido ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
