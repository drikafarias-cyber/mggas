'use client'
import { useEffect, useState } from 'react'

import type { Pedido, Cliente } from '@/types'

const fmt = (v: number) => 'R$ ' + Number(v).toFixed(2).replace('.', ',')
const PRODUTOS = ['P13 - 13kg', 'P20 - 20kg', 'P45 - 45kg']
const PAGAMENTOS = ['Dinheiro', 'Pix', 'Cartão débito', 'Cartão crédito', 'Fiado']
const STATUS = ['Pendente', 'Em rota', 'Entregue', 'Cancelado']
const statusStyle: Record<string, string> = {
  Entregue: '#3ddc97', Pendente: '#f5a623', 'Em rota': '#5c9dff', Cancelado: '#ff5c5c'
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ cliente_nome: '', cliente_tel: '', endereco_entrega: '', produto: 'P13 - 13kg', quantidade: '1', valor_unitario: '', forma_pagamento: 'Dinheiro', observacao: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: peds }, { data: clis }] = await Promise.all([
      supabase.from('pedidos').select('*').order('created_at', { ascending: false }),
      supabase.from('clientes').select('*').order('nome'),
    ])
    setPedidos(peds || [])
    setClientes(clis || [])
  }

  async function salvar() {
    if (!form.cliente_nome || !form.valor_unitario) { alert('Preencha cliente e valor.'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const cli = clientes.find(c => c.nome === form.cliente_nome)
    await supabase.from('pedidos').insert({
      user_id: user!.id,
      cliente_id: cli?.id || null,
      cliente_nome: form.cliente_nome,
      cliente_tel: form.cliente_tel,
      endereco_entrega: form.endereco_entrega,
      produto: form.produto,
      quantidade: parseInt(form.quantidade),
      valor_unitario: parseFloat(form.valor_unitario),
      forma_pagamento: form.forma_pagamento,
      observacao: form.observacao,
    })
    setOpen(false)
    setForm({ cliente_nome: '', cliente_tel: '', endereco_entrega: '', produto: 'P13 - 13kg', quantidade: '1', valor_unitario: '', forma_pagamento: 'Dinheiro', observacao: '' })
    setLoading(false)
    load()
  }

  async function changeStatus(id: string, status: string) {
    await supabase.from('pedidos').update({ status }).eq('id', id)
    load()
  }

  const lista = filtro ? pedidos.filter(p => p.status === filtro) : pedidos

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Pedidos</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', borderRadius: 6, fontSize: 13 }}>
            <option value="">Todos os status</option>
            {STATUS.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setOpen(true)}
            style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Novo pedido
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['#', 'Cliente', 'Endereço', 'Produto', 'Qtd', 'Valor', 'Pgto', 'Status', 'Data'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>#{String(p.numero).padStart(3, '0')}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{p.cliente_nome}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--muted)' }}>{p.endereco_entrega || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{p.produto}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{p.quantidade}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{fmt(Number(p.valor_total))}</td>
                <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>{p.forma_pagamento}</td>
                <td style={{ padding: '10px 14px' }}>
                  <select value={p.status} onChange={e => changeStatus(p.id, e.target.value)}
                    style={{ background: `${statusStyle[p.status]}22`, border: 'none', color: statusStyle[p.status], padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'IBM Plex Mono', cursor: 'pointer' }}>
                    {STATUS.map(s => <option key={s} style={{ background: 'var(--surface)', color: 'var(--text)' }}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32, fontSize: 13 }}>Nenhum pedido encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, width: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 500 }}>Novo pedido</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {[
                { label: 'Cliente', key: 'cliente_nome', type: 'text', placeholder: 'Nome do cliente', list: 'clist' },
                { label: 'Telefone', key: 'cliente_tel', type: 'tel', placeholder: '(11) 99999-9999' },
                { label: 'Endereço de entrega', key: 'endereco_entrega', type: 'text', placeholder: 'Rua, número, bairro' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} list={f.list}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }} />
                  {f.list && <datalist id={f.list}>{clientes.map(c => <option key={c.id} value={c.nome} />)}</datalist>}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>Produto</label>
                  <select value={form.produto} onChange={e => setForm(p => ({ ...p, produto: e.target.value }))}
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }}>
                    {PRODUTOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>Quantidade</label>
                  <input type="number" min="1" value={form.quantidade} onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))}
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>Valor unitário (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.valor_unitario} onChange={e => setForm(p => ({ ...p, valor_unitario: e.target.value }))} placeholder="0,00"
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>Pagamento</label>
                  <select value={form.forma_pagamento} onChange={e => setForm(p => ({ ...p, forma_pagamento: e.target.value }))}
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }}>
                    {PAGAMENTOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }}>Observação</label>
                <input type="text" value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} placeholder="Troca de vasilhame, etc."
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }} />
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 6, padding: '8px 16px', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={salvar} disabled={loading}
                style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Salvando...' : 'Registrar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
