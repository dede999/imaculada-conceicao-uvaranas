export default defineEventHandler(async (event) => {
  const { name, email, parish_role } = await readBody<{
    name: string
    email: string
    parish_role: string
  }>(event)

  if (!name?.trim() || !email?.trim() || !parish_role?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Preencha todos os campos' })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { error } = await supabase.from('user_requests').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    parish_role: parish_role.trim(),
  })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { ok: true }
})
