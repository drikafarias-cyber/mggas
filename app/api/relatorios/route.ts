import { auth } from '@/lib/auth'
import sql from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'diario'
  const data = searchParams.get('data') || new Date().toISOString().split('T')[0]

  if (tipo === 'diario') {
    const [porPgto, porLocal, totais, aReceber] = await Promise.all([
      sql`
        SELECT forma_pagamento, COUNT(*) as qtd, SUM(valor_total) as total
        FROM pedidos
        WHERE user_id = ${session.user.id}
          AND status = 'Entregue'
          AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = ${data}
        GROUP BY forma_pagamento
        ORDER BY total DESC
      `,
      sql`
        SELECT local_venda, COUNT(*) as qtd, SUM(valor_total) as total
        FROM pedidos
        WHERE user_id = ${session.user.id}
          AND status = 'Entregue'
          AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = ${data}
        GROUP BY local_venda
      `,
      sql`
        SELECT COUNT(*) as total_pedidos, SUM(valor_total) as total_vendas, SUM(quantidade) as total_unidades
        FROM pedidos
        WHERE user_id = ${session.user.id}
          AND status = 'Entregue'
          AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = ${data}
      `,
      sql`
        SELECT forma_pagamento, COUNT(*) as qtd, SUM(valor_total) as total
        FROM pedidos
        WHERE user_id = ${session.user.id}
          AND status = 'Entregue'
          AND forma_pagamento IN ('Gás do Povo','Fiado','Vale Gás Ultragaz')
          AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') = ${data}
        GROUP BY forma_pagamento
      `,
    ])
    return NextResponse.json({ porPgto, porLocal, totais: totais[0], aReceber })
  }

  if (tipo === 'vendas') {
    const rows = await sql`
      SELECT produto, tipo_produto, local_venda, forma_pagamento,
             COUNT(*) as qtd_pedidos, SUM(quantidade) as qtd_unidades, SUM(valor_total) as total
      FROM pedidos
      WHERE user_id = ${session.user.id} AND status = 'Entregue'
        AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') >= ${searchParams.get('de') || data}
        AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') <= ${searchParams.get('ate') || data}
      GROUP BY produto, tipo_produto, local_venda, forma_pagamento
      ORDER BY total DESC
    `
    return NextResponse.json(rows)
  }

  if (tipo === 'gastos') {
    const rows = await sql`
      SELECT categoria, COUNT(*) as qtd, SUM(valor) as total
      FROM lancamentos
      WHERE user_id = ${session.user.id} AND tipo = 'saida'
        AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') >= ${searchParams.get('de') || data}
        AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') <= ${searchParams.get('ate') || data}
      GROUP BY categoria ORDER BY total DESC
    `
    const detalhe = await sql`
      SELECT descricao, valor, categoria, created_at
      FROM lancamentos
      WHERE user_id = ${session.user.id} AND tipo = 'saida'
        AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') >= ${searchParams.get('de') || data}
        AND DATE(created_at AT TIME ZONE 'America/Sao_Paulo') <= ${searchParams.get('ate') || data}
      ORDER BY created_at DESC
    `
    return NextResponse.json({ resumo: rows, detalhe })
  }

  return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
}
