<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Table.configure({ resizable: false }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())

const inTable = computed(() => editor.value?.isActive('table') ?? false)
</script>

<template>
  <div class="editor-wrap">
    <div v-if="editor" class="toolbar">
      <!-- Formatação inline -->
      <button type="button" :class="{ active: editor.isActive('bold') }" title="Negrito" @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
      <button type="button" :class="{ active: editor.isActive('italic') }" title="Itálico" @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
      <div class="separator" />

      <!-- Títulos -->
      <button type="button" :class="{ active: editor.isActive('heading', { level: 1 }) }" title="Título 1" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button type="button" :class="{ active: editor.isActive('heading', { level: 2 }) }" title="Título 2" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" :class="{ active: editor.isActive('heading', { level: 3 }) }" title="Título 3" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <div class="separator" />

      <!-- Listas -->
      <button type="button" :class="{ active: editor.isActive('bulletList') }" title="Lista" @click="editor.chain().focus().toggleBulletList().run()">• Lista</button>
      <button type="button" :class="{ active: editor.isActive('orderedList') }" title="Lista numerada" @click="editor.chain().focus().toggleOrderedList().run()">1. Lista</button>
      <div class="separator" />

      <!-- Tabela -->
      <button
        v-if="!inTable"
        type="button"
        title="Inserir tabela"
        @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
      >⊞ Tabela</button>
      <template v-if="inTable">
        <button type="button" title="Adicionar coluna" @click="editor.chain().focus().addColumnAfter().run()">+Col</button>
        <button type="button" title="Remover coluna" @click="editor.chain().focus().deleteColumn().run()">−Col</button>
        <button type="button" title="Adicionar linha" @click="editor.chain().focus().addRowAfter().run()">+Lin</button>
        <button type="button" title="Remover linha" @click="editor.chain().focus().deleteRow().run()">−Lin</button>
        <button type="button" class="btn-danger" title="Remover tabela" @click="editor.chain().focus().deleteTable().run()">✕ Tabela</button>
      </template>
      <div class="separator" />

      <!-- Histórico -->
      <button type="button" title="Desfazer" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">↩</button>
      <button type="button" title="Refazer" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">↪</button>
    </div>
    <EditorContent :editor="editor" class="editor-body" />
    <p class="editor-hint">Dica: digite <code>#</code>, <code>##</code>, <code>-</code> ou <code>**texto**</code> para formatar com Markdown.</p>
  </div>
</template>

<style scoped>
.editor-wrap {
  border: 1px solid #d4c9b8;
  border-radius: 6px;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: #faf7f2;
  border-bottom: 1px solid #e4ddd0;
  flex-wrap: wrap;
}

.toolbar button {
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 3px 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  color: var(--fr-800);
  transition: background 0.1s;
  line-height: 1.4;
}

.toolbar button:hover:not(:disabled) { background: #ede8e0; }
.toolbar button.active { background: #ede8e0; border-color: #c8baa0; }
.toolbar button:disabled { opacity: 0.35; cursor: not-allowed; }
.toolbar button.btn-danger { color: #b91c1c; }
.toolbar button.btn-danger:hover { background: #fef2f2; }

.separator {
  width: 1px;
  height: 18px;
  background: #d4c9b8;
  margin: 0 4px;
}

.editor-body {
  padding: 12px 14px;
  min-height: 200px;
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.6;
  color: var(--fr-950);
}

.editor-hint {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text-muted);
  padding: 4px 14px 6px;
  margin: 0;
  background: #faf7f2;
  border-top: 1px solid #e4ddd0;
}

.editor-hint code {
  background: #ede8e0;
  border-radius: 3px;
  padding: 0 3px;
  font-size: 11px;
}

:deep(.ProseMirror) { outline: none; }
:deep(.ProseMirror p) { margin: 0 0 0.75em; }
:deep(.ProseMirror h1) { font-size: 1.4em; font-weight: 700; margin: 1.4em 0 0.5em; }
:deep(.ProseMirror h2) { font-size: 1.2em; font-weight: 700; margin: 1.2em 0 0.4em; }
:deep(.ProseMirror h3) { font-size: 1.05em; font-weight: 700; margin: 1em 0 0.3em; }
:deep(.ProseMirror ul, .ProseMirror ol) { padding-left: 1.4em; margin: 0.5em 0; }
:deep(.ProseMirror li) { margin-bottom: 0.2em; }
:deep(.ProseMirror strong) { font-weight: 700; }
:deep(.ProseMirror em) { font-style: italic; }

/* Tabela */
:deep(.ProseMirror table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 13px;
}
:deep(.ProseMirror th, .ProseMirror td) {
  border: 1px solid #d4c9b8;
  padding: 6px 10px;
  text-align: left;
  vertical-align: top;
  min-width: 60px;
}
:deep(.ProseMirror th) {
  background: #f5f0e8;
  font-weight: 600;
  color: var(--fr-800);
}
:deep(.ProseMirror .selectedCell) { background: #ede8e0; }

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #b0a090;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
