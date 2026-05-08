'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErro('')
    const res = await signIn('credentials', { email, password: senha, redirect: false })
    if (res?.error) { setErro('Email ou senha incorretos.'); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px 36px', width: 380 }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 22, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em' }}>GASFLOW</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>gestão de revenda de gás</div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
              placeholder="seu@email.com" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: 6 }}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
              placeholder="••••••••" required />
          </div>
          {erro && <div style={{ background: 'rgba(255,92,92,.1)', border: '1px solid rgba(255,92,92,.3)', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>{erro}</div>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '11px', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
