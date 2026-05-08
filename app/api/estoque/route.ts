import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [estoque, movs] = await Promise.all([
    sql`SELECT * FROM estoque WHERE user_id = ${session.user.id}`,
    sql`SELECT * FROM movimentacoes_estoque WHERE user_id = ${session.user.id} ORDER BY created_at DESC LIMIT 30`,
  ])
  return NextResponse.json({ estoque, movimentacoes: movs })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { produto, operacao, quantidade, motivo } = await req.json()
  const qtd = parseInt(quantidade)
  if (!produto || !qtd) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })

  // Pega quantidade atual
  const atual = await sql`SELECT quantidade FROM estoque WHERE user_id = ${session.user.id} AND produto = ${produto}`
  const qtdAtual = atual[0]?.quantidade ?? 0
  const novoQtd = operacao === 'entrada' ? qtdAtual + qtd : Math.max(0, qtdAtual - qtd)

  // Upsert estoque
  await sql`
    INSERT INTO estoque (user_id, produto, quantidade)
    VALUES (${session.user.id}, ${produto}, ${novoQtd})
    ON CONFLICT (user_id, produto)
    DO UPDATE SET quantidade = ${novoQtd}, updated_at = NOW()
  `

  // Registra movimentação
  await sql`
    INSERT INTO movimentacoes_estoque (user_id, produto, operacao, quantidade, motivo)
    VALUES (${session.user.id}, ${produto}, ${operacao}, ${qtd}, ${motivo || null})
  `

  return NextResponse.json({ ok: true, quantidade: novoQtd })
}
