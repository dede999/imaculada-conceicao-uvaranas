import { getParishId } from '../utils/getParishId'

export default defineEventHandler(async (event) => {
  const { name, email, parish_role, password } = await readBody<{
    name: string
    email: string
    parish_role: string
    password: string
  }>(event)

  if (!name?.trim() || !email?.trim() || !parish_role?.trim() || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Preencha todos os campos' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'A senha deve ter pelo menos 8 caracteres.' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const parishId = getParishId(event)
  const supabase = useServiceRole()

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

  // Create the auth user immediately with the provided password.
  // The account exists but has no parish access until the admin approves the request.
  const { data: { user: newAuthUser }, error: authErr } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { name: name.trim(), parish_role: parish_role.trim() },
  })

  if (authErr || !newAuthUser) {
    throw createError({ statusCode: 500, statusMessage: authErr?.message ?? 'Erro ao criar conta' })
  }

  const { error: insertErr } = await supabase.from('user_requests').insert({
    name: name.trim(),
    email: normalizedEmail,
    parish_role: parish_role.trim(),
    parish_id: parishId,
  } as never)

  if (insertErr) {
    // Clean up the auth user if the request record couldn't be created
    await supabase.auth.admin.deleteUser(newAuthUser.id)
    throw createError({ statusCode: 500, statusMessage: insertErr.message })
  }

  return { ok: true }
})
