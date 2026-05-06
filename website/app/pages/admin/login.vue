<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const email = ref('')
const sent = ref(false)
const error = ref('')
const loading = ref(false)

async function sendMagicLink() {
  error.value = ''
  loading.value = true
  const { error: err } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: { emailRedirectTo: `${window.location.origin}/admin/confirm` },
  })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    sent.value = true
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-tau">τ</span>
        <span class="brand-name">Painel da Paróquia</span>
      </div>

      <template v-if="!sent">
        <p class="login-desc">
          Digite seu e-mail para receber um link de acesso.
        </p>
        <form class="login-form" @submit.prevent="sendMagicLink">
          <input
            v-model="email"
            type="email"
            required
            placeholder="seu@email.com"
            class="login-input"
            :disabled="loading"
          />
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? 'Enviando…' : 'Enviar link de acesso' }}
          </button>
        </form>
        <p v-if="error" class="login-error">{{ error }}</p>
      </template>

      <template v-else>
        <div class="login-sent">
          <p class="sent-msg">
            Link enviado para <strong>{{ email }}</strong>.
          </p>
          <p class="sent-hint">Verifique sua caixa de entrada e clique no link para entrar.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fr-950);
  padding: 24px;
}

.login-card {
  background: #fff;
  border-radius: 10px;
  padding: 40px 36px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.brand-tau {
  font-size: 28px;
  font-weight: 700;
  color: var(--fr-600);
  line-height: 1;
}

.brand-name {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--fr-950);
}

.login-desc {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-input {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  transition: border-color 0.15s;
}

.login-input:focus {
  border-color: var(--fr-600);
}

.login-btn {
  background: var(--fr-600);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.login-btn:hover:not(:disabled) {
  background: var(--fr-800);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #c0392b;
  margin: 4px 0 0;
}

.login-sent {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sent-msg {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--fr-950);
  margin: 0;
}

.sent-hint {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}
</style>
