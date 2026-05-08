'use client'
import { useEffect, useState } from 'react'

const fmt = (v: number) => 'R$ ' + Number(v||0).toFixed(2).replace('.', ',')
const PRODUTOS = ['P13 - 13kg', 'P20 - 20kg', 'P45 - 45kg', 'Galão Água 20L']
const TIPOS = [{ v: 'cheio', l: 'Cheio' }, { v: 'vazio', l: 'Vazio (vasilhame)' }, { v: 'agua', l: 'Água' }]
const LOCAIS = ['Carro', 'Portaria']
const PAGAMENTOS = ['Dinheiro', 'Pix', 'Cartão Crédito Visa', 'Cartão Crédito Master', 'Cartão Débito', 'App Ultragaz', 'Vale Gás Ultragaz', 'Gás do Povo', 'Fiado']
const STATUS = ['Pendente', 'Em rota', 'Entregue', 'Cancelado']
const statusColor: Record<string, string> = { Entregue: '#3ddc97', Pendente: '#f5a623', 'Em rota': '#5c9dff', Cancelado: '#ff5c5c' }
const pgtoAReceber = ['Gás do Povo', 'Fiado', 'Vale Gás Ultragaz']

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [produtos, setProdutos] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    cliente_nome: '', cliente_tel: '', endereco_entrega: '',
    produto: 'P13 - 13kg', tipo_produto: 'cheio', quantidade: '1',
    valor_unitario: '', forma_pagamento: 'Dinheiro', local_venda: 'Carro', observacao: ''
  })

  useEffect(() => { load() }, [])

  async function load() {
    const url = filtro ? `/api/pedidos?status=${filtro}` : '/api/pedidos'
    const [peds, clis, prods] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/clientes').then(r => r.json()),
      fetch('/api/produtos').then(r => r.json()),
    ])
    setPedidos(Array.isArray(peds) ? peds : [])
    setClientes(Array.isArray(clis) ? clis : [])
    setProdutos(Array.isArray(prods) ? prods : [])
  }

  function getPrecoSugerido(produto: string, tipo: string, local: string) {
    const p = produtos.find((x: any) => x.nome === produto && x.tipo === tipo)
    if (!p) return ''
    return local === 'Carro' ? p.preco_venda_carro : p.preco_venda_portaria
  }

  function handleProdutoChange(campo: string, valor: string) {
    const newForm = { ...form, [campo]: valor }
    const preco = getPrecoSugerido(
      campo === 'produto' ? valor : newForm.produto,
      campo === 'tipo_produto' ? valor : newForm.tipo_produto,
      campo === 'local_venda' ? valor : newForm.local_venda
    )
    setForm({ ...newForm, valor_unitario: preco ? String(preco) : newForm.valor_unitario })
  }

  async function salvar() {
    if (!form.cliente_nome || !form.valor_unitario) { alert('Preencha cliente e valor.'); return }
    setLoading(true)
    const cli = clientes.find((c: any) => c.nome === form.cliente_nome)
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cliente_id: cli?.id || null,
        quantidade: parseInt(form.quantidade),
        valor_unitario: parseFloat(form.valor_unitario)
      })
    })
    setOpen(false)
    setForm({ cliente_nome: '', cliente_tel: '', endereco_entrega: '', produto: 'P13 - 13kg', tipo_produto: 'cheio', quantidade: '1', valor_unitario: '', forma_pagamento: 'Dinheiro', local_venda: 'Carro', observacao: '' })
    setLoading(false)
    load()
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/pedidos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const lista = filtro ? pedidos.filter((p: any) => p.status === filtro) : pedidos
  const inputStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '9px 12px', color: 'var(--text)', fontSize: 13 }
  const labelStyle = { display: 'block' as const, fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: 'var(--muted)', marginBottom: 6 }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 500 }}>Pedidos</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filtro} onChange={e => { setFiltro(e.target.value); setTimeout(load, 50) }}
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
            <tr>{['#','Cliente','Produto','Tipo','Local','Qtd','Valor','Pgto','Status','Data'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {lista.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--muted)' }}>#{String(p.numero).padStart(3,'0')}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{p.cliente_nome}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{p.produto}</td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--muted)' }}>{p.tipo_produto}</td>
                <td style={{ padding: '10px 14px', fontSize: 12 }}>{p.local_venda === 'Carro' ? '🚗' : '🏢'} {p.local_venda}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{p.quantidade}</td>
                <td style={{ padding: '10px 14px', fontSize: 13, fontFamily: 'IBM Plex Mono' }}>{fmt(Number(p.valor_total))}</td>
                <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'IBM Plex Mono', color: pgtoAReceber.includes(p.forma_pagamento) ? '#f5a623' : 'var(--muted)' }}>{p.forma_pagamento}</td>
                <td style={{ padding: '10px 14px' }}>
                  <select value={p.status} onChange={e => changeStatus(p.id, e.target.value)}
                    style={{ background: `${statusColor[p.status]}22`, border: 'none', color: statusColor[p.status], padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'IBM Plex Mono', cursor: 'pointer' }}>
                    {STATUS.map(s => <option key={s} style={{ background: '#1a1a1a', color: '#f0f0f0' }}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {lista.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32, fontSize: 13 }}>Nenhum pedido encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 10, width: 480, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 14, fontWeight: 500 }}>Novo pedido</h3>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Cliente</label>
                <input type="text" value={form.cliente_nome} list="clist" onChange={e => setForm(p => ({ ...p, cliente_nome: e.target.value }))} placeholder="Nome do cliente" style={inputStyle} />
                <datalist id="clist">{clientes.map((c: any) => <option key={c.id} value={c.nome} />)}</datalist>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Telefone</label>
                  <input type="tel" value={form.cliente_tel} onChange={e => setForm(p => ({ ...p, cliente_tel: e.target.value }))} placeholder="(11) 99999-9999" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Local de venda</label>
                  <select value={form.local_venda} onChange={e => handleProdutoChange('local_venda', e.target.value)} style={inputStyle}>
                    {LOCAIS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Endereço de entrega</label>
                <input type="text" value={form.endereco_entrega} onChange={e => setForm(p => ({ ...p, endereco_entrega: e.target.value }))} placeholder="Rua, número, bairro" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Produto</label>
                  <select value={form.produto} onChange={e => handleProdutoChange('produto', e.target.value)} style={inputStyle}>
                    {PRODUTOS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select value={form.tipo_produto} onChange={e => handleProdutoChange('tipo_produto', e.target.value)} style={inputStyle}>
                    {TIPOS.filter(t => form.produto === 'Galão Água 20L' ? t.v === 'agua' : t.v !== 'agua').map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Quantidade</label>
                  <input type="number" min="1" value={form.quantidade} onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Valor unitário (R$)</label>
                  <input type="number" min="0" step="0.01" value={form.valor_unitario} onChange={e => setForm(p => ({ ...p, valor_unitario: e.target.value }))} placeholder="Auto" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Forma de pagamento</label>
                <select value={form.forma_pagamento} onChange={e => setForm(p => ({ ...p, forma_pagamento: e.target.value }))} style={inputStyle}>
                  {PAGAMENTOS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              {pgtoAReceber.includes(form.forma_pagamento) && (
                <div style={{ background: 'rgba(245,166,35,.1)', border: '1px solid rgba(245,166,35,.3)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#f5a623', marginBottom: 14 }}>
                  ⚠️ {form.forma_pagamento === 'Gás do Povo' ? 'Programa social — recebimento em ~2 dias úteis' : form.forma_pagamento === 'Vale Gás Ultragaz' ? 'Vale Gás — desconto aplicado no próximo pedido Ultragaz' : 'Fiado — registrar recebimento posteriormente'}
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Observação</label>
                <input type="text" value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} placeholder="Troca de vasilhame, etc." style={inputStyle} />
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border2)', borderRadius: 6, padding: '8px 16px', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
              <button onClick={salvar} disabled={loading} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Salvando...' : 'Registrar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
