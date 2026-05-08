'use client'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, ShoppingCart, DollarSign, Users, Package, FileText, LogOut, Tag, BarChart2 } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Principal' },
  { href: '/pedidos',   label: 'Pedidos',   icon: ShoppingCart },
  { href: '/caixa',     label: 'Caixa',     icon: DollarSign,  section: 'Gestão' },
  { href: '/clientes',  label: 'Clientes',  icon: Users },
  { href: '/estoque',   label: 'Estoque',   icon: Package },
  { href: '/nf',        label: 'Notas Fiscais', icon: FileText },
  { href: '/produtos',  label: 'Produtos',      icon: Tag,      section: 'Configurações' },
  { href: '/relatorios',label: 'Relatórios',    icon: BarChart2 },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{ width: 200, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>GasFlow</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>gestão de revenda</div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV.map((item) => {
          const Icon = item.icon
          const active = path.startsWith(item.href)
          return (
            <div key={item.href}>
              {item.section && (
                <div style={{ padding: '16px 16px 4px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontFamily: 'IBM Plex Mono' }}>
                  {item.section}
                </div>
              )}
              <a href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
                color: active ? 'var(--accent)' : 'var(--muted)', fontSize: 13, textDecoration: 'none',
                borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                background: active ? 'rgba(245,166,35,.07)' : 'transparent', transition: 'all .15s'
              }}>
                <Icon size={16} />{item.label}
              </a>
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', color: 'var(--muted)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  )
}
