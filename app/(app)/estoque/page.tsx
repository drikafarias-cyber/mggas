'use client'
import { useEffect, useState } from 'react'

const PRODUTOS = ['P13 - 13kg','P20 - 20kg','P45 - 45kg']

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<any[]>([])
  const [movs, setMovs] = useState<any[]>([])
  const [form, setForm] = useState({ produto:'P13 - 13kg',operacao:'entrada',quantidade:'',motivo:'' })
  const [loading, setLoading] = useState(false)

  async function load() {
    const data = await fetch('/api/estoque').then(r=>r.json())
    setEstoque(data.estoque||[]); setMovs(data.movimentacoes||[])
  }
  useEffect(() => { load() }, [])

  async function ajustar() {
    if (!form.quantidade) { alert('Informe a quantidade.'); return }
    setLoading(true)
    await fetch('/api/estoque', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setForm(p=>({...p,quantidade:'',motivo:''})); setLoading(false); load()
  }

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:18,fontWeight:500,marginBottom:20 }}>Estoque</h1>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24 }}>
        {PRODUTOS.map(p=>{
          const item=estoque.find((e:any)=>e.produto===p); const qtd=item?.quantidade??0
          const color=qtd>10?'#3ddc97':qtd>3?'#f5a623':'#ff5c5c'
          return <div key={p} style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'14px 16px' }}>
            <div style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',fontFamily:'IBM Plex Mono',marginBottom:6 }}>{p}</div>
            <div style={{ fontSize:28,fontWeight:600,fontFamily:'IBM Plex Mono',color }}>{qtd}</div>
            <div style={{ fontSize:11,color:'var(--muted)',marginTop:4 }}>unidades</div>
          </div>
        })}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:16 }}>
        <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
          <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>Movimentações</div>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>{['Data','Produto','Op','Qtd','Motivo'].map(h=>(
              <th key={h} style={{ textAlign:'left',padding:'8px 16px',fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',fontFamily:'IBM Plex Mono',borderBottom:'1px solid var(--border)',fontWeight:500 }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {movs.map((m:any)=>(
                <tr key={m.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'9px 16px',fontSize:11,color:'var(--muted)' }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding:'9px 16px',fontSize:13 }}>{m.produto}</td>
                  <td style={{ padding:'9px 16px' }}><span style={{ fontSize:11,padding:'2px 8px',borderRadius:4,fontFamily:'IBM Plex Mono',background:m.operacao==='entrada'?'rgba(61,220,151,.12)':'rgba(255,92,92,.12)',color:m.operacao==='entrada'?'#3ddc97':'#ff5c5c' }}>{m.operacao}</span></td>
                  <td style={{ padding:'9px 16px',fontSize:13,fontFamily:'IBM Plex Mono',color:m.operacao==='entrada'?'#3ddc97':'#ff5c5c' }}>{m.operacao==='entrada'?'+':'-'}{m.quantidade}</td>
                  <td style={{ padding:'9px 16px',fontSize:12,color:'var(--muted)' }}>{m.motivo||'—'}</td>
                </tr>
              ))}
              {movs.length===0&&<tr><td colSpan={5} style={{ textAlign:'center',color:'var(--muted)',padding:24,fontSize:13 }}>Sem movimentações.</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8 }}>
          <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>Ajustar estoque</div>
          <div style={{ padding:16 }}>
            {[{label:'Produto',key:'produto',opts:PRODUTOS},{label:'Operação',key:'operacao',opts:['entrada','saida']}].map(f=>(
              <div key={f.key} style={{ marginBottom:14 }}>
                <label style={{ display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',marginBottom:6 }}>{f.label}</label>
                <select value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  style={{ width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'9px 12px',color:'var(--text)',fontSize:13 }}>
                  {f.opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',marginBottom:6 }}>Quantidade</label>
              <input type="number" min="1" value={form.quantidade} onChange={e=>setForm(p=>({...p,quantidade:e.target.value}))}
                style={{ width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'9px 12px',color:'var(--text)',fontSize:13 }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',marginBottom:6 }}>Motivo</label>
              <input type="text" value={form.motivo} onChange={e=>setForm(p=>({...p,motivo:e.target.value}))} placeholder="Compra do distribuidor..."
                style={{ width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'9px 12px',color:'var(--text)',fontSize:13 }} />
            </div>
            <button onClick={ajustar} disabled={loading} style={{ width:'100%',background:'var(--accent)',color:'#000',border:'none',borderRadius:6,padding:10,fontSize:13,fontWeight:600,cursor:'pointer' }}>
              {loading?'Salvando...':'Registrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
