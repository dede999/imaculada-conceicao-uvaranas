<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function login() {
  error.value   = ''
  loading.value = true
  const { error: err } = await supabase.auth.signInWithPassword({
    email:    email.value.trim().toLowerCase(),
    password: password.value,
  })
  loading.value = false
  if (err) {
    error.value = 'E-mail ou senha incorretos.'
  } else {
    await navigateTo('/admin/dashboard')
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

      <form class="login-form" @submit.prevent="login">
        <div class="field">
          <label for="login-email" class="field-label">E-mail</label>
          <input
            id="login-email"
            v-model="email"
            type="email"
            required
            placeholder="seu@email.com"
            class="login-input"
            :disabled="loading"
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label for="login-password" class="field-label">Senha</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="login-input"
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button type="submit" class="login-btn" :disabled="loading || !email || !password">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>

      <div class="login-links">
        <NuxtLink to="/admin/recuperar-senha" class="login-link">Esqueceu sua senha?</NuxtLink>
        <span class="link-sep" aria-hidden="true">·</span>
        <NuxtLink to="/admin/solicitar" class="login-link">Solicitar acesso</NuxtLink>
      </div>
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
  margin-bottom: 28px;
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

.login-form {
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

.login-input:focus { border-color: var(--fr-600); }

.login-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
  margin: 0;
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
  margin-top: 4px;
}

.login-btn:hover:not(:disabled) { background: var(--fr-800); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.login-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.login-link {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--fr-600);
  text-decoration: none;
}

.login-link:hover { text-decoration: underline; }

.link-sep {
  font-size: 12px;
  color: #c8baa0;
}
</style>
