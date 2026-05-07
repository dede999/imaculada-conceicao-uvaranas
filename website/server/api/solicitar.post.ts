import { serverSupabaseServiceRole } from '#supabase/server'
import { getParishId } from '../utils/getParishId'

export default defineEventHandler(async (event) => {
  const { name, email, parish_role } = await readBody<{
    name: string
    email: string
    parish_role: string
  }>(event)

  if (!name?.trim() || !email?.trim() || !parish_role?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Preencha todos os campos' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const parishId = getParishId(event)
  const supabase = serverSupabaseServiceRole(event)

  // Block if there is already a pending or approved request for this email
  const { data: existing } = await supabase
    .from('user_requests')
    .select('status')
    .eq('email', normalizedEmail)
    .eq('parish_id', parishId)
    .neq('status', 'rejected')
    .maybeSingle()

  if (existing?.status === 'pending') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Já existe uma solicitação pendente com este e-mail. Aguarde o contato do administrador.',
    })
  }

  if (existing?.status === 'approved') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Este e-mail já tem acesso ao painel. Use o link de login para entrar.',
    })
  }

  // Block if the email already has an auth account (added via another flow)
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const alreadyHasAccount = users.some(u => u.email?.toLowerCase() === normalizedEmail)

  if (alreadyHasAccount) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Este e-mail já está cadastrado. Use o link de login para acessar o painel.',
    })
  }

  const { error } = await supabase.from('user_requests').insert({
    name: name.trim(),
    email: normalizedEmail,
    parish_role: parish_role.trim(),
    parish_id: parishId,
  } as never)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})
