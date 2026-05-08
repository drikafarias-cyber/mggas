import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await sql`SELECT * FROM clientes WHERE user_id = ${session.user.id} ORDER BY nome`
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, telefone, endereco, bairro, cep, cpf_cnpj, observacao } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const rows = await sql`
    INSERT INTO clientes (user_id, nome, telefone, endereco, bairro, cep, cpf_cnpj, observacao)
    VALUES (${session.user.id}, ${nome}, ${telefone||null}, ${endereco||null}, ${bairro||null}, ${cep||null}, ${cpf_cnpj||null}, ${observacao||null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
