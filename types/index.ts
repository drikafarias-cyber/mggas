export type StatusPedido = 'Pendente' | 'Em rota' | 'Entregue' | 'Cancelado'
export type TipoLancamento = 'entrada' | 'saida'
export type StatusNF = 'pendente' | 'emitida' | 'cancelada' | 'erro'

export interface Cliente {
  id: string; user_id: string; nome: string; telefone?: string
  endereco?: string; bairro?: string; cep?: string; cpf_cnpj?: string
  observacao?: string; created_at: string
}

export interface Pedido {
  id: string; user_id: string; numero: number; cliente_id?: string
  cliente_nome: string; cliente_tel?: string; endereco_entrega?: string
  produto: string; quantidade: number; valor_unitario: number; valor_total: number
  forma_pagamento: string; status: StatusPedido; observacao?: string
  entregador?: string; created_at: string; updated_at: string
}

export interface Lancamento {
  id: string; user_id: string; descricao: string; valor: number
  tipo: TipoLancamento; categoria: string; pedido_id?: string; created_at: string
}

export interface Estoque {
  id: string; user_id: string; produto: string; quantidade: number; updated_at: string
}

export interface MovimentacaoEstoque {
  id: string; user_id: string; produto: string; operacao: 'entrada' | 'saida'
  quantidade: number; motivo?: string; created_at: string
}

export interface NotaFiscal {
  id: string; user_id: string; pedido_id?: string; numero_nf?: string
  chave_acesso?: string; status: StatusNF; pdf_url?: string
  xml_url?: string; resposta_api?: Record<string, unknown>; created_at: string
}
