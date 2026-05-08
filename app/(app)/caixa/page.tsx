'use client'
import { useEffect, useState } from 'react'

const fmt = (v: number) => 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const CATEGORIAS = ['Estoque','Combustível','Funcionário','Aluguel','Manutenção','Imposto','Outro']

export default function CaixaPage() {
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [form, setForm] = useState({ descricao: '', valor: '', categoria: 'Estoque' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetch('/api/lancamentos').then(r => r.json()).then(setLancamentos) }, [])

  async function addDespesa() {
    if (!form.descricao || !form.valor) { alert('Preencha descrição e valor.'); return }
    setLoading(true)
    await fetch('/api/lancamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, valor: parseFloat(form.valor), tipo: 'saida' }) })
    setForm({ descricao: '', valor: '', categoria: 'Estoque' })
    setLoading(false)
    fetch('/api/lancamentos').then(r => r.json()).then(setLancamentos)
  }

  const entradas = lancamentos.filter(l => l.tipo === 'entrada').reduce((a, l) => a + Number(l.valor), 0)
  const saidas   = lancamentos.filter(l => l.tipo === 'saida').reduce((a, l) => a + Number(l.valor), 0)
  const saldo = entradas - saidas

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Caixa</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[{label:'Entradas',value:fmt(entradas),color:'#3ddc97'},{label:'Saídas',value:fmt(saidas),color:'#ff5c5c'},{label:'Saldo',value:fmt(saldo),color:saldo>=0?'#3ddc97':'#ff5c5c'}].map(m=>(
          <div key={m.label} style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'14px 16px' }}>
            <div style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',fontFamily:'IBM Plex Mono',marginBottom:6 }}>{m.label}</div>
            <div style={{ fontSize:22,fontWeight:600,fontFamily:'IBM Plex Mono',color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 340px',gap:16 }}>
        <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
          <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>Lançamentos</div>
          {lancamentos.length === 0 && <div style={{ textAlign:'center',color:'var(--muted)',padding:32,fontSize:13 }}>Sem lançamentos.</div>}
          {lancamentos.map((l:any) => (
            <div key={l.id} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 16px',borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:13 }}>{l.descricao}</div>
                <div style={{ fontSize:11,color:'var(--muted)',fontFamily:'IBM Plex Mono',marginTop:2 }}>{l.categoria} · {new Date(l.created_at).toLocaleDateString('pt-BR')}</div>
              </div>
              <div style={{ fontFamily:'IBM Plex Mono',fontSize:13,fontWeight:500,color:l.tipo==='entrada'?'#3ddc97':'#ff5c5c' }}>{l.tipo==='entrada'?'+':'-'}{fmt(Number(l.valor))}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8 }}>
          <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>Nova despesa</div>
          <div style={{ padding:16 }}>
            {[{label:'Descrição',key:'descricao',type:'text',placeholder:'Ex: Reposição de botijões'},{label:'Valor (R$)',key:'valor',type:'number',placeholder:'0,00'}].map(f=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                  style={{ width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'9px 12px',color:'var(--text)',fontSize:13 }} />
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',marginBottom:6 }}>Categoria</label>
              <select value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))}
                style={{ width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'9px 12px',color:'var(--text)',fontSize:13 }}>
                {CATEGORIAS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={addDespesa} disabled={loading} style={{ width:'100%',background:'var(--accent)',color:'#000',border:'none',borderRadius:6,padding:10,fontSize:13,fontWeight:600,cursor:'pointer' }}>
              {loading?'Salvando...':'Registrar despesa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
