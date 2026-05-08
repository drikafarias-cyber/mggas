'use client'
import { useEffect, useState } from 'react'
import type { Pedido, Cliente } from '@/types'

const fmt = (v: number) => 'R$ ' + Number(v).toFixed(2).replace('.', ',')
const PRODUTOS = ['P13 - 13kg', 'P20 - 20kg', 'P45 - 45kg']
const PAGAMENTOS = ['Dinheiro', 'Pix', 'Cartão débito', 'Cartão crédito', 'Fiado']
const STATUS = ['Pendente', 'Em rota', 'Entregue', 'Cancelado']
const statusStyle: Record<string, string> = { Entregue: '#3ddc97', Pendente: '#f5a623', 'Em rota': '#5c9dff', Cancelado: '#ff5c5c' }

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [open, setOpen] = useState(false)
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ cliente_nome: '', cliente_tel: '', endereco_entrega: '', produto: 'P13 - 13kg', quantidade: '1', valor_unitario: '', forma_pagamento: 'Dinheiro', observacao: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const url = filtro ? `/api/pedidos?status=${filtro}` : '/api/pedidos'
    const [peds, clis] = await Promise.all([
      fetch(url).then(r => r.json()),
      fetch('/api/clientes').then(r => r.json()),
    ])
    setPedidos(peds || [])
    setClientes(clis || [])
  }

  async function salvar() {
    if (!form.cliente_nome || !form.valor_unitario) { alert('Preencha cliente e valor.'); return }
    setLoading(true)
    const cli = clientes.find((c: any) => c.nome === form.cliente_nome)
    await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cliente_id: cli?.id || null, quantidade: parseInt(form.quantidade), valor_unitario: parseFloat(form.valor_unitario) })
    })
    setOpen(false)
    setForm({ cliente_nome: '', cliente_tel: '', endereco_entrega: '', produto: 'P13 - 13kg', quantidade: '1', valor_unitario: '', forma_pagamento: 'Dinheiro', observacao: '' })
    setLoading(false)
    load()
  }

  async function changeStatus(id: string, status: string) {
    await fetch(`/api/pedidos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    load()
  }

  const lista = filtro ? pedidos.filter(p => p.status === filtro) : pedidos

  return (<div style={{ padding: 24 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h1 style={{ fontSize: 18, fontWeight: 500 }}>Pedidos</h1></div></div>)
}
