-- TABELA DE PRODUTOS E PREÇOS
CREATE TABLE IF NOT EXISTS produtos (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo        TEXT NOT NULL DEFAULT 'cheio' CHECK (tipo IN ('cheio','vazio','agua')),
  preco_compra NUMERIC(10,2) DEFAULT 0,
  preco_venda_carro    NUMERIC(10,2) DEFAULT 0,
  preco_venda_portaria NUMERIC(10,2) DEFAULT 0,
  ativo       BOOLEAN DEFAULT true,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, nome, tipo)
);

-- NOVAS COLUNAS NA TABELA PEDIDOS
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS local_venda TEXT NOT NULL DEFAULT 'Carro';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_produto TEXT NOT NULL DEFAULT 'cheio';

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_produtos_user ON produtos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_local ON pedidos(local_venda);
CREATE INDEX IF NOT EXISTS idx_pedidos_pgto ON pedidos(forma_pagamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_data ON pedidos(created_at);
