'use client'
import { useEffect, useState } from 'react'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nome:'',telefone:'',endereco:'',bairro:'',cpf_cnpj:'',observacao:'' })

  useEffect(() => { fetch('/api/clientes').then(r=>r.json()).then(setClientes) }, [])

  async function salvar() {
    if (!form.nome) { alert('Informe o nome.'); return }
    setLoading(true)
    await fetch('/api/clientes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    setForm({ nome:'',telefone:'',endereco:'',bairro:'',cpf_cnpj:'',observacao:'' })
    setOpen(false); setLoading(false)
    fetch('/api/clientes').then(r=>r.json()).then(setClientes)
  }

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <h1 style={{ fontSize:18,fontWeight:500 }}>Clientes</h1>
        <button onClick={()=>setOpen(true)} style={{ background:'var(--accent)',color:'#000',border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer' }}>+ Novo cliente</button>
      </div>
      <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr>{['Nome','Telefone','Endereço','Bairro','CPF/CNPJ','Cadastrado em'].map(h=>(
            <th key={h} style={{ textAlign:'left',padding:'10px 16px',fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',fontFamily:'IBM Plex Mono',borderBottom:'1px solid var(--border)',fontWeight:500 }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {clientes.map((c:any)=>(
              <tr key={c.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'11px 16px',fontSize:13,fontWeight:500 }}>{c.nome}</td>
                <td style={{ padding:'11px 16px',fontSize:13,fontFamily:'IBM Plex Mono' }}>{c.telefone||'—'}</td>
                <td style={{ padding:'11px 16px',fontSize:12,color:'var(--muted)' }}>{c.endereco||'—'}</td>
                <td style={{ padding:'11px 16px',fontSize:12,color:'var(--muted)' }}>{c.bairro||'—'}</td>
                <td style={{ padding:'11px 16px',fontSize:12,fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>{c.cpf_cnpj||'—'}</td>
                <td style={{ padding:'11px 16px',fontSize:12,color:'var(--muted)' }}>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {clientes.length===0&&<tr><td colSpan={6} style={{ textAlign:'center',color:'var(--muted)',padding:32,fontSize:13 }}>Nenhum cliente cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {open&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100 }}>
          <div style={{ background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:10,width:420 }}>
            <div style={{ padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between' }}>
              <h3 style={{ fontSize:14,fontWeight:500 }}>Novo cliente</h3>
              <button onClick={()=>setOpen(false)} style={{ background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:18 }}>×</button>
            </div>
            <div style={{ padding:20 }}>
              {[{label:'Nome completo',key:'nome',placeholder:'Nome'},{label:'Telefone',key:'telefone',placeholder:'(11) 99999-9999'},{label:'Endereço',key:'endereco',placeholder:'Rua, número'},{label:'Bairro',key:'bairro',placeholder:'Bairro'},{label:'CPF / CNPJ',key:'cpf_cnpj',placeholder:'Opcional'},{label:'Observação',key:'observacao',placeholder:'Preferências...'}].map(f=>(
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ display:'block',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--muted)',marginBottom:5 }}>{f.label}</label>
                  <input type="text" value={(form as any)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                    style={{ width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'8px 12px',color:'var(--text)',fontSize:13 }} />
                </div>
              ))}
            </div>
            <div style={{ padding:'14px 20px',borderTop:'1px solid var(--border)',display:'flex',gap:8,justifyContent:'flex-end' }}>
              <button onClick={()=>setOpen(false)} style={{ background:'transparent',border:'1px solid var(--border2)',borderRadius:6,padding:'8px 16px',color:'var(--muted)',cursor:'pointer',fontSize:13 }}>Cancelar</button>
              <button onClick={salvar} disabled={loading} style={{ background:'var(--accent)',color:'#000',border:'none',borderRadius:6,padding:'8px 16px',fontSize:13,fontWeight:600,cursor:'pointer' }}>{loading?'Salvando...':'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
