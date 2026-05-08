'use client'
import { useEffect, useState } from 'react'

const PRODUTOS_PADRAO = [
  { nome: 'P13 - 13kg', tipo: 'cheio' },
  { nome: 'P13 - 13kg', tipo: 'vazio' },
  { nome: 'P20 - 20kg', tipo: 'cheio' },
  { nome: 'P20 - 20kg', tipo: 'vazio' },
  { nome: 'P45 - 45kg', tipo: 'cheio' },
  { nome: 'P45 - 45kg', tipo: 'vazio' },
  { nome: 'Galão Água 20L', tipo: 'agua' },
]

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [saved, setSaved] = useState<string|null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const data = await fetch('/api/produtos').then(r => r.json())
    setProdutos(data || [])
  }

  function getPreco(nome: string, tipo: string, campo: string) {
    const p = produtos.find((x: any) => x.nome === nome && x.tipo === tipo)
    return p?.[campo] || 0
  }

  async function salvar(nome: string, tipo: string, campo: string, valor: string) {
    const p = produtos.find((x: any) => x.nome === nome && x.tipo === tipo) || { nome, tipo, preco_compra: 0, preco_venda_carro: 0, preco_venda_portaria: 0 }
    const updated = { ...p, [campo]: parseFloat(valor) || 0 }
    await fetch('/api/produtos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
    setSaved(`${nome}-${tipo}-${campo}`)
    setTimeout(() => setSaved(null), 2000)
    load()
  }

  const tipoLabel: Record<string, string> = { cheio: '🟢 Cheio', vazio: '⚪ Vazio', agua: '💧 Água' }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>Produtos & Preços</h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Defina os preços de compra e venda de cada produto por local de entrega.</p>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Produto', 'Tipo', 'Preço de Compra', 'Venda Carro', 'Venda Portaria'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono', borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRODUTOS_PADRAO.map(({ nome, tipo }) => (
              <tr key={`${nome}-${tipo}`} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{nome}</td>
                <td style={{ padding: '12px 16px', fontSize: 12 }}>{tipoLabel[tipo]}</td>
                {['preco_compra', 'preco_venda_carro', 'preco_venda_portaria'].map(campo => {
                  const key = `${nome}-${tipo}-${campo}`
                  const isSaved = saved === key
                  return (
                    <td key={campo} style={{ padding: '8px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>R$</span>
                        <input type="number" min="0" step="0.01"
                          defaultValue={getPreco(nome, tipo, campo)}
                          key={`${key}-${produtos.length}`}
                          onBlur={e => salvar(nome, tipo, campo, e.target.value)}
                          style={{ width: 90, background: 'var(--surface2)', border: `1px solid ${isSaved ? 'var(--green)' : 'var(--border)'}`, borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontSize: 13, fontFamily: 'IBM Plex Mono' }} />
                        {isSaved && <span style={{ fontSize: 11, color: 'var(--green)' }}>✓</span>}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, background: 'rgba(245,166,35,.08)', border: '1px solid rgba(245,166,35,.2)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
        💡 Os preços são salvos automaticamente ao sair do campo. O preço de venda é preenchido automaticamente no pedido conforme o local selecionado.
      </div>
    </div>
  )
}
