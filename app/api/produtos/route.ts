import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await sql`SELECT * FROM produtos WHERE user_id = ${session.user.id} ORDER BY nome, tipo`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { nome, tipo, preco_compra, preco_venda_carro, preco_venda_portaria } = await req.json()
  const rows = await sql`
    INSERT INTO produtos (user_id, nome, tipo, preco_compra, preco_venda_carro, preco_venda_portaria)
    VALUES (${session.user.id}, ${nome}, ${tipo}, ${preco_compra||0}, ${preco_venda_carro||0}, ${preco_venda_portaria||0})
    ON CONFLICT (user_id, nome, tipo)
    DO UPDATE SET preco_compra = ${preco_compra||0}, preco_venda_carro = ${preco_venda_carro||0}, preco_venda_portaria = ${preco_venda_portaria||0}, updated_at = NOW()
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
