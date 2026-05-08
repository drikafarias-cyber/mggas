// scripts/migrate.js
// Rode: node scripts/migrate.js

const { neon } = require('@neondatabase/serverless')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_l3pAbDMROW9V@ep-patient-heart-ac35g80s.sa-east-1.aws.neon.tech/neondb?sslmode=require'

const sql = neon(DATABASE_URL)

async function migrate() {
  console.log('🚀 Criando tabelas...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ users')

  await sql`
    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      nome TEXT NOT NULL,
      telefone TEXT,
      endereco TEXT,
      bairro TEXT,
      cep TEXT,
      cpf_cnpj TEXT,
      observacao TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ clientes')

  await sql`
    CREATE TABLE IF NOT EXISTS pedidos (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      numero SERIAL,
      cliente_id TEXT REFERENCES clientes(id) ON DELETE SET NULL,
      cliente_nome TEXT NOT NULL,
      cliente_tel TEXT,
      endereco_entrega TEXT,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 1,
      valor_unitario NUMERIC(10,2) NOT NULL,
      valor_total NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
      forma_pagamento TEXT NOT NULL DEFAULT 'Dinheiro',
      status TEXT NOT NULL DEFAULT 'Pendente'
        CHECK (status IN ('Pendente','Em rota','Entregue','Cancelado')),
      observacao TEXT,
      entregador TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ pedidos')

  await sql`
    CREATE TABLE IF NOT EXISTS lancamentos (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      descricao TEXT NOT NULL,
      valor NUMERIC(10,2) NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida')),
      categoria TEXT NOT NULL DEFAULT 'Outro',
      pedido_id TEXT REFERENCES pedidos(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ lancamentos')

  await sql`
    CREATE TABLE IF NOT EXISTS estoque (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      produto TEXT NOT NULL,
      quantidade INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, produto)
    )
  `
  console.log('✅ estoque')

  await sql`
    CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      produto TEXT NOT NULL,
      operacao TEXT NOT NULL CHECK (operacao IN ('entrada','saida')),
      quantidade INTEGER NOT NULL,
      motivo TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ movimentacoes_estoque')

  await sql`
    CREATE TABLE IF NOT EXISTS notas_fiscais (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pedido_id TEXT REFERENCES pedidos(id) ON DELETE SET NULL,
      numero_nf TEXT,
      chave_acesso TEXT,
      status TEXT NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente','emitida','cancelada','erro')),
      pdf_url TEXT,
      xml_url TEXT,
      resposta_api JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✅ notas_fiscais')

  // Índices
  await sql`CREATE INDEX IF NOT EXISTS idx_pedidos_user ON pedidos(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_lancamentos_user ON lancamentos(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_clientes_user ON clientes(user_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_estoque_user ON estoque(user_id)`
  console.log('✅ índices')

  // Trigger updated_at
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql
  `
  await sql`DROP TRIGGER IF EXISTS pedidos_updated_at ON pedidos`
  await sql`CREATE TRIGGER pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION set_updated_at()`

  // Trigger caixa automático
  await sql`
    CREATE OR REPLACE FUNCTION auto_lancamento_caixa()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status = 'Entregue' AND OLD.status != 'Entregue' THEN
        INSERT INTO lancamentos(user_id, descricao, valor, tipo, categoria, pedido_id)
        VALUES(NEW.user_id, 'Venda - ' || NEW.cliente_nome, NEW.valor_total, 'entrada', 'Venda', NEW.id);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `
  await sql`DROP TRIGGER IF EXISTS pedido_entregue_lancamento ON pedidos`
  await sql`CREATE TRIGGER pedido_entregue_lancamento AFTER UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION auto_lancamento_caixa()`

  // Trigger baixa de estoque
  await sql`
    CREATE OR REPLACE FUNCTION auto_baixa_estoque()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status = 'Em rota' AND OLD.status = 'Pendente' THEN
        UPDATE estoque
        SET quantidade = GREATEST(0, quantidade - NEW.quantidade), updated_at = NOW()
        WHERE user_id = NEW.user_id AND produto = NEW.produto;
        INSERT INTO movimentacoes_estoque(user_id, produto, operacao, quantidade, motivo)
        VALUES(NEW.user_id, NEW.produto, 'saida', NEW.quantidade, 'Pedido #' || NEW.numero);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `
  await sql`DROP TRIGGER IF EXISTS pedido_rota_estoque ON pedidos`
  await sql`CREATE TRIGGER pedido_rota_estoque AFTER UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION auto_baixa_estoque()`

  console.log('✅ triggers')
  console.log('\n🎉 Migration concluída! Agora rode: node scripts/criar-usuario.js')
}

migrate().catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
