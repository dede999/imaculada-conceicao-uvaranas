<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const email   = ref('')
const sent    = ref(false)
const error   = ref('')
const loading = ref(false)

async function send() {
  error.value   = ''
  loading.value = true
  const { error: err } = await supabase.auth.resetPasswordForEmail(
    email.value.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/admin/confirm` },
  )
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    sent.value = true
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="brand">
        <span class="brand-tau">τ</span>
        <span class="brand-name">Recuperar senha</span>
      </div>

      <template v-if="!sent">
        <p class="desc">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <form class="form" @submit.prevent="send">
          <div class="field">
            <label for="recovery-email" class="field-label">E-mail</label>
            <input
              id="recovery-email"
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="input"
              :disabled="loading"
              autocomplete="username"
            />
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn" :disabled="loading || !email">
            {{ loading ? 'Enviando…' : 'Enviar link de recuperação' }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="success">
          <p class="success-title">Link enviado!</p>
          <p class="success-desc">
            Verifique sua caixa de entrada em <strong>{{ email }}</strong> e clique no link para redefinir sua senha.
          </p>
        </div>
      </template>

      <div class="back-link">
        <NuxtLink to="/admin/login" class="link">← Voltar ao login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fr-950);
  padding: 24px;
}

.card {
  background: #fff;
  border-radius: 10px;
  padding: 40px 36px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
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

.desc {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #6b6b5e;
  margin: 0 0 20px;
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-600);
  letter-spacing: 0.04em;
}

.input {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  transition: border-color 0.15s;
}

.input:focus { border-color: var(--fr-600); }

.error-msg {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
  margin: 0;
}

.btn {
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

.btn:hover:not(:disabled) { background: var(--fr-800); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.success {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.success-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  color: #166534;
  margin: 0;
}

.success-desc {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #6b6b5e;
  margin: 0;
  line-height: 1.5;
}

.back-link {
  margin-top: 20px;
  text-align: center;
}

.link {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--fr-600);
  text-decoration: none;
}

.link:hover { text-decoration: underline; }
</style>
