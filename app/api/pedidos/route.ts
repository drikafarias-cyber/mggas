import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const rows = status
    ? await sql`SELECT * FROM pedidos WHERE user_id = ${session.user.id} AND status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM pedidos WHERE user_id = ${session.user.id} ORDER BY created_at DESC`

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { cliente_id, cliente_nome, cliente_tel, endereco_entrega, produto, tipo_produto, quantidade, valor_unitario, forma_pagamento, local_venda, observacao } = body

  if (!cliente_nome || !produto || !valor_unitario) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO pedidos (user_id, cliente_id, cliente_nome, cliente_tel, endereco_entrega, produto, tipo_produto, quantidade, valor_unitario, forma_pagamento, local_venda, observacao)
    VALUES (${session.user.id}, ${cliente_id || null}, ${cliente_nome}, ${cliente_tel || null}, ${endereco_entrega || null}, ${produto}, ${tipo_produto || 'cheio'}, ${quantidade}, ${valor_unitario}, ${forma_pagamento}, ${local_venda || 'Carro'}, ${observacao || null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
