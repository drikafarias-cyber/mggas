import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await sql`SELECT * FROM notas_fiscais WHERE user_id = ${session.user.id} ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { pedido_id } = await req.json()

  // Registra NF como pendente
  const rows = await sql`
    INSERT INTO notas_fiscais (user_id, pedido_id, status)
    VALUES (${session.user.id}, ${pedido_id}, 'pendente')
    RETURNING *
  `

  // TODO: Integrar com Focus NF-e
  // const pedido = await sql`SELECT * FROM pedidos WHERE id = ${pedido_id}`
  // const resp = await fetch('https://api.focusnfe.com.br/v2/nfe', {
  //   method: 'POST',
  //   headers: { Authorization: 'Token ' + process.env.FOCUS_NFE_TOKEN },
  //   body: JSON.stringify({ ... montar payload com dados do pedido ... })
  // })

  return NextResponse.json(rows[0])
}
