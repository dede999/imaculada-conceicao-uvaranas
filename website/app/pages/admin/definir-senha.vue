<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const password = ref('')
const confirm  = ref('')
const error    = ref('')
const loading  = ref(false)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) await navigateTo('/admin/login')
})

function validatePassword(pwd: string): string | null {
  if (pwd.length <= 8)           return 'A senha deve ter mais de 8 caracteres.'
  if (!/[A-Z]/.test(pwd))        return 'Inclua pelo menos uma letra maiúscula.'
  if (!/[a-z]/.test(pwd))        return 'Inclua pelo menos uma letra minúscula.'
  if (!/[0-9]/.test(pwd))        return 'Inclua pelo menos um número.'
  if (!/[^A-Za-z0-9]/.test(pwd)) return 'Inclua pelo menos um símbolo especial.'
  return null
}

async function save() {
  error.value = ''
  const validationErr = validatePassword(password.value)
  if (validationErr) { error.value = validationErr; return }
  if (password.value !== confirm.value) {
    error.value = 'As senhas não coincidem.'
    return
  }
  loading.value = true
  const { error: err } = await supabase.auth.updateUser({ password: password.value })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    await navigateTo('/admin/dashboard')
  }
}
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="brand">
        <span class="brand-tau">τ</span>
        <span class="brand-name">Definir senha</span>
      </div>

      <p class="desc">Crie uma senha para acessar o painel. Mínimo de 8 caracteres.</p>

      <form class="form" @submit.prevent="save">
        <div class="field">
          <label for="new-password" class="field-label">Nova senha</label>
          <input
            id="new-password"
            v-model="password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="input"
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <div class="field">
          <label for="confirm-password" class="field-label">Confirmar senha</label>
          <input
            id="confirm-password"
            v-model="confirm"
            type="password"
            required
            placeholder="••••••••"
            class="input"
            :disabled="loading"
            autocomplete="new-password"
          />
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn" :disabled="loading || !password || !confirm">
          {{ loading ? 'Salvando…' : 'Definir senha e entrar' }}
        </button>
      </form>
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
  margin-top: 4px;
}

.btn:hover:not(:disabled) { background: var(--fr-800); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
