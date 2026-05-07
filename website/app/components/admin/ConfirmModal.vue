<script setup lang="ts">
defineProps<{ open: boolean; message: string }>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-backdrop" @click.self="$emit('cancel')">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true">
        <p class="confirm-message">{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="$emit('cancel')">Cancelar</button>
          <button class="btn-confirm" @click="$emit('confirm')">Confirmar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: #fff;
  border-radius: 10px;
  padding: 28px 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
}

.confirm-message {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--fr-950);
  margin: 0 0 24px;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: none;
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  padding: 8px 18px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--fr-800);
  cursor: pointer;
  transition: background 0.1s;
}

.btn-cancel:hover { background: #f5efe4; }

.btn-confirm {
  background: #c0392b;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.1s;
}

.btn-confirm:hover { background: #a93226; }
</style>
