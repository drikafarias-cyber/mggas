import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { status } = body

  const rows = await sql`
    UPDATE pedidos SET status = ${status}
    WHERE id = ${params.id} AND user_id = ${session.user.id}
    RETURNING *
  `
  return NextResponse.json(rows[0])
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await sql`DELETE FROM pedidos WHERE id = ${params.id} AND user_id = ${session.user.id}`
  return NextResponse.json({ ok: true })
}
