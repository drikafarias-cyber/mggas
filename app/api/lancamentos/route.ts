import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await sql`SELECT * FROM lancamentos WHERE user_id = ${session.user.id} ORDER BY created_at DESC`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { descricao, valor, tipo, categoria } = await req.json()
  if (!descricao || !valor) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })

  const rows = await sql`
    INSERT INTO lancamentos (user_id, descricao, valor, tipo, categoria)
    VALUES (${session.user.id}, ${descricao}, ${valor}, ${tipo}, ${categoria})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
