<script setup lang="ts">
definePageMeta({ layout: false })

const name        = ref('')
const email       = ref('')
const parishRole  = ref('')
const password    = ref('')
const pwConfirm   = ref('')
const submitted   = ref(false)
const error       = ref('')
const loading     = ref(false)

async function submit() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'A senha deve ter pelo menos 8 caracteres.'
    return
  }
  if (password.value !== pwConfirm.value) {
    error.value = 'As senhas não coincidem.'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/solicitar', {
      method: 'POST',
      body: { name: name.value, email: email.value, parish_role: parishRole.value, password: password.value },
    })
    submitted.value = true
  }
  catch (e: unknown) {
    error.value = (e as { data?: { statusMessage?: string } }).data?.statusMessage
      ?? 'Erro ao enviar solicitação'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="solicitar-page">
    <div class="solicitar-card">
      <div class="brand">
        <span class="brand-tau">τ</span>
        <span class="brand-name">Solicitar acesso ao painel</span>
      </div>

      <template v-if="!submitted">
        <p class="desc">
          Preencha o formulário abaixo. Seu pedido será analisado pelo administrador da paróquia.
        </p>
        <form class="form" @submit.prevent="submit">
          <div class="field">
            <label for="name">Nome completo</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              placeholder="Maria da Silva"
              :disabled="loading"
            />
          </div>

          <div class="field">
            <label for="email">E-mail</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="maria@email.com"
              :disabled="loading"
            />
          </div>

          <div class="field">
            <label for="parish-role">Função na paróquia</label>
            <input
              id="parish-role"
              v-model="parishRole"
              type="text"
              required
              placeholder="Ex: Ministro da Eucaristia, Catequista"
              :disabled="loading"
            />
          </div>

          <div class="field">
            <label for="sol-password">Senha (mínimo 8 caracteres)</label>
            <input
              id="sol-password"
              v-model="password"
              type="password"
              required
              minlength="8"
              placeholder="••••••••"
              :disabled="loading"
              autocomplete="new-password"
            />
          </div>

          <div class="field">
            <label for="sol-pw-confirm">Confirmar senha</label>
            <input
              id="sol-pw-confirm"
              v-model="pwConfirm"
              type="password"
              required
              placeholder="••••••••"
              :disabled="loading"
              autocomplete="new-password"
            />
          </div>

          <button type="submit" class="btn" :disabled="loading">
            {{ loading ? 'Enviando…' : 'Enviar solicitação' }}
          </button>
        </form>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </template>

      <template v-else>
        <div class="success">
          <p class="success-title">Solicitação enviada!</p>
          <p class="success-desc">
            O administrador vai analisar seu pedido. Assim que aprovado, faça login com seu e-mail e senha.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.solicitar-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fr-950);
  padding: 24px;
}

.solicitar-card {
  background: #fff;
  border-radius: 10px;
  padding: 40px 36px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.brand-tau {
  font-size: 26px;
  font-weight: 700;
  color: var(--fr-600);
  line-height: 1;
}

.brand-name {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--fr-950);
}

.desc {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
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

.field label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--fr-800);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field input {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 9px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--fr-600);
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

.error-msg {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #c0392b;
  margin: 8px 0 0;
}

.success {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.success-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  color: #1a7a4a;
  margin: 0;
}

.success-desc {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}
</style>
