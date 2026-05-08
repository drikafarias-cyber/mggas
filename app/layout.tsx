import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GasFlow — Gestão de Revenda de Gás',
  description: 'Sistema de gestão para revenda de gás',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
