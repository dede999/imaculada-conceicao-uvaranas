<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const error = ref('')

onMounted(async () => {
  // Handle PKCE flow (?code=...) and implicit flow (#access_token=...)
  const code = new URL(window.location.href).searchParams.get('code')
  if (code) {
    const { error: err } = await supabase.auth.exchangeCodeForSession(code)
    if (err) { error.value = err.message; return }
  }

  const { data: { session }, error: sessErr } = await supabase.auth.getSession()
  if (sessErr || !session) {
    error.value = sessErr?.message ?? 'Link inválido ou expirado'
    return
  }

  await navigateTo('/admin/dashboard')
})
</script>

<template>
  <div class="confirm-page">
    <div class="confirm-card">
      <span class="brand-tau">τ</span>
      <p v-if="!error" class="confirm-msg">Verificando acesso…</p>
      <p v-else class="confirm-error">
        {{ error }}<br />
        <NuxtLink to="/admin/login">Tentar novamente</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.confirm-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fr-950);
}

.confirm-card {
  background: #fff;
  border-radius: 10px;
  padding: 40px 36px;
  text-align: center;
  width: 320px;
}

.brand-tau {
  font-size: 32px;
  font-weight: 700;
  color: var(--fr-600);
}

.confirm-msg {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 16px 0 0;
}

.confirm-error {
  font-family: var(--font-sans);
  font-size: 14px;
  color: #c0392b;
  margin: 16px 0 0;
  line-height: 1.6;
}
</style>
