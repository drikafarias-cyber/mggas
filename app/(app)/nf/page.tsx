'use client'
import { useEffect, useState } from 'react'

const fmt = (v: number) => 'R$ ' + Number(v).toFixed(2).replace('.', ',')
const statusColor: Record<string, string> = { emitida:'#3ddc97',pendente:'#f5a623',cancelada:'#ff5c5c',erro:'#ff5c5c' }

export default function NFPage() {
  const [pedidosEntregues, setPedidosEntregues] = useState<any[]>([])
  const [notas, setNotas] = useState<any[]>([])
  const [loading, setLoading] = useState<string|null>(null)

  async function load() {
    const [peds, nfs] = await Promise.all([
      fetch('/api/pedidos?status=Entregue').then(r=>r.json()),
      fetch('/api/nf').then(r=>r.json()),
    ])
    setPedidosEntregues(peds); setNotas(nfs)
  }
  useEffect(() => { load() }, [])

  const pedidosSemNF = pedidosEntregues.filter(p => !notas.find((n:any) => n.pedido_id === p.id))

  async function emitirNF(pedido: any) {
    setLoading(pedido.id)
    await fetch('/api/nf', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ pedido_id: pedido.id }) })
    setLoading(null); load()
  }

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:18,fontWeight:500,marginBottom:16 }}>Notas Fiscais</h1>
      <div style={{ background:'rgba(245,166,35,.08)',border:'1px solid rgba(245,166,35,.25)',borderRadius:8,padding:'14px 16px',marginBottom:20,fontSize:13,lineHeight:1.6 }}>
        <strong style={{ color:'var(--accent)' }}>Integração Focus NF-e</strong><br/>
        Adicione <code style={{ fontSize:12,background:'rgba(255,255,255,.05)',padding:'1px 6px',borderRadius:4 }}>FOCUS_NFE_TOKEN</code> nas variáveis do Vercel para ativar a emissão automática.
        Plano gratuito: até 5 NFs/mês · Plano pago: R$ 29/mês ilimitado.
      </div>
      {pedidosSemNF.length > 0 && (
        <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden',marginBottom:16 }}>
          <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>
            Aguardando emissão ({pedidosSemNF.length})
          </div>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>{['Cliente','Produto','Valor','Data','Ação'].map(h=>(
              <th key={h} style={{ textAlign:'left',padding:'10px 16px',fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',fontFamily:'IBM Plex Mono',borderBottom:'1px solid var(--border)',fontWeight:500 }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {pedidosSemNF.map((p:any)=>(
                <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'11px 16px',fontSize:13 }}>{p.cliente_nome}</td>
                  <td style={{ padding:'11px 16px',fontSize:13 }}>{p.produto} × {p.quantidade}</td>
                  <td style={{ padding:'11px 16px',fontSize:13,fontFamily:'IBM Plex Mono' }}>{fmt(Number(p.valor_total))}</td>
                  <td style={{ padding:'11px 16px',fontSize:12,color:'var(--muted)' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding:'11px 16px' }}>
                    <button onClick={()=>emitirNF(p)} disabled={loading===p.id}
                      style={{ background:'var(--accent)',color:'#000',border:'none',borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:600,cursor:'pointer' }}>
                      {loading===p.id?'Emitindo...':'Emitir NF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden' }}>
        <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:12,fontWeight:500,textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'IBM Plex Mono',color:'var(--muted)' }}>Histórico</div>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr>{['Nº NF','Status','Data','PDF'].map(h=>(
            <th key={h} style={{ textAlign:'left',padding:'10px 16px',fontSize:10,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',fontFamily:'IBM Plex Mono',borderBottom:'1px solid var(--border)',fontWeight:500 }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {notas.map((n:any)=>(
              <tr key={n.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'11px 16px',fontSize:13,fontFamily:'IBM Plex Mono' }}>{n.numero_nf||'—'}</td>
                <td style={{ padding:'11px 16px' }}><span style={{ fontSize:11,padding:'2px 8px',borderRadius:4,fontFamily:'IBM Plex Mono',background:`${statusColor[n.status]}22`,color:statusColor[n.status] }}>{n.status}</span></td>
                <td style={{ padding:'11px 16px',fontSize:12,color:'var(--muted)' }}>{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                <td style={{ padding:'11px 16px' }}>{n.pdf_url?<a href={n.pdf_url} target="_blank" style={{ color:'var(--accent)',fontSize:12 }}>Baixar</a>:'—'}</td>
              </tr>
            ))}
            {notas.length===0&&<tr><td colSpan={4} style={{ textAlign:'center',color:'var(--muted)',padding:32,fontSize:13 }}>Nenhuma nota emitida.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
