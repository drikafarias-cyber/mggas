// scripts/criar-usuario.js
// Rode: node scripts/criar-usuario.js
// Edite email, nome e senha antes de rodar

const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_l3pAbDMROW9V@ep-patient-heart-ac35g80s.sa-east-1.aws.neon.tech/neondb?sslmode=require'

// ✏️ EDITE AQUI
const USUARIO = {
  email: 'seu@email.com',
  senha: 'suasenha123',
  nome: 'Seu Nome',
}

async function criar() {
  const sql = neon(DATABASE_URL)
  const hash = await bcrypt.hash(USUARIO.senha, 12)

  const rows = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${USUARIO.email}, ${hash}, ${USUARIO.nome})
    ON CONFLICT (email) DO UPDATE SET password = ${hash}, name = ${USUARIO.nome}
    RETURNING id, email, name
  `
  const user = rows[0]
  console.log('✅ Usuário criado:', user)

  // Cria estoque inicial
  await sql`
    INSERT INTO estoque (user_id, produto, quantidade)
    VALUES
      (${user.id}, 'P13 - 13kg', 0),
      (${user.id}, 'P20 - 20kg', 0),
      (${user.id}, 'P45 - 45kg', 0)
    ON CONFLICT (user_id, produto) DO NOTHING
  `
  console.log('✅ Estoque inicial criado')
  console.log('\n🎉 Pronto! Você já pode fazer login com:')
  console.log('   Email:', USUARIO.email)
  console.log('   Senha:', USUARIO.senha)
}

criar().catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
