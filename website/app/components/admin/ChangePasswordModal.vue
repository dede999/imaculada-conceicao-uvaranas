<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const supabase = useSupabaseClient()

const newPassword = ref('')
const confirmPw   = ref('')
const error       = ref('')
const success     = ref(false)
const loading     = ref(false)

function validatePassword(pwd: string): string | null {
  if (pwd.length <= 8)          return 'A senha deve ter mais de 8 caracteres.'
  if (!/[A-Z]/.test(pwd))       return 'Inclua pelo menos uma letra maiúscula.'
  if (!/[a-z]/.test(pwd))       return 'Inclua pelo menos uma letra minúscula.'
  if (!/[0-9]/.test(pwd))       return 'Inclua pelo menos um número.'
  if (!/[^A-Za-z0-9]/.test(pwd))return 'Inclua pelo menos um símbolo especial.'
  return null
}

function reset() {
  newPassword.value = ''
  confirmPw.value   = ''
  error.value       = ''
  success.value     = false
  loading.value     = false
}

function close() {
  reset()
  emit('close')
}

async function save() {
  error.value = ''
  const validationErr = validatePassword(newPassword.value)
  if (validationErr) { error.value = validationErr; return }
  if (newPassword.value !== confirmPw.value) {
    error.value = 'As senhas não coincidem.'; return
  }
  loading.value = true
  const { error: err } = await supabase.auth.updateUser({ password: newPassword.value })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    success.value = true
    setTimeout(close, 1800)
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="close">
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="chpw-title">
          <div class="modal-header">
            <h2 id="chpw-title" class="modal-title">Alterar senha</h2>
            <button class="modal-close" aria-label="Fechar" @click="close">✕</button>
          </div>

          <template v-if="!success">
            <form class="modal-form" @submit.prevent="save">
              <div class="field">
                <label for="chpw-new" class="field-label">Nova senha</label>
                <input
                  id="chpw-new"
                  v-model="newPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  class="field-input"
                  :disabled="loading"
                  autocomplete="new-password"
                />
              </div>

              <div class="field">
                <label for="chpw-confirm" class="field-label">Confirmar nova senha</label>
                <input
                  id="chpw-confirm"
                  v-model="confirmPw"
                  type="password"
                  required
                  placeholder="••••••••"
                  class="field-input"
                  :disabled="loading"
                  autocomplete="new-password"
                />
              </div>

              <ul class="pw-rules" aria-label="Requisitos da senha">
                <li :class="{ met: newPassword.length > 8 }">Mais de 8 caracteres</li>
                <li :class="{ met: /[A-Z]/.test(newPassword) }">Letra maiúscula</li>
                <li :class="{ met: /[a-z]/.test(newPassword) }">Letra minúscula</li>
                <li :class="{ met: /[0-9]/.test(newPassword) }">Número</li>
                <li :class="{ met: /[^A-Za-z0-9]/.test(newPassword) }">Símbolo especial</li>
              </ul>

              <p v-if="error" class="form-error">{{ error }}</p>

              <div class="modal-actions">
                <button type="button" class="btn-cancel" @click="close">Cancelar</button>
                <button type="submit" class="btn-save" :disabled="loading">
                  {{ loading ? 'Salvando…' : 'Salvar senha' }}
                </button>
              </div>
            </form>
          </template>

          <div v-else class="success-state">
            <p class="success-msg">Senha alterada com sucesso!</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.modal-dialog {
  background: #fff;
  border-radius: 10px;
  padding: 28px 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-title {
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 14px;
  color: var(--fr-600);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
  transition: background 0.1s;
}

.modal-close:hover { background: var(--fr-50); }

.modal-form { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 4px; }

.field-label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--fr-600);
  letter-spacing: 0.04em;
}

.field-input {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 9px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-950);
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus { border-color: var(--fr-600); }

.pw-rules {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
}

.pw-rules li {
  font-family: var(--font-sans);
  font-size: 11px;
  color: #b0a090;
  display: flex;
  align-items: center;
  gap: 4px;
}

.pw-rules li::before {
  content: '○';
  font-size: 10px;
}

.pw-rules li.met {
  color: #166534;
}

.pw-rules li.met::before {
  content: '●';
}

.form-error {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #b91c1c;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel {
  background: none;
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--fr-800);
  cursor: pointer;
  transition: background 0.1s;
}

.btn-cancel:hover { background: #f5efe4; }

.btn-save {
  background: var(--fr-600);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.1s;
}

.btn-save:hover:not(:disabled) { background: var(--fr-800); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.success-state {
  padding: 12px 0 4px;
  text-align: center;
}

.success-msg {
  font-family: var(--font-sans);
  font-size: 15px;
  color: #166534;
  margin: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.15s; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
