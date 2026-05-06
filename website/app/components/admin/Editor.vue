<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())
</script>

<template>
  <div class="editor-wrap">
    <div v-if="editor" class="toolbar">
      <button type="button" :class="{ active: editor.isActive('bold') }" title="Negrito" @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
      <button type="button" :class="{ active: editor.isActive('italic') }" title="Itálico" @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
      <button type="button" :class="{ active: editor.isActive('heading', { level: 2 }) }" title="Título" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" :class="{ active: editor.isActive('heading', { level: 3 }) }" title="Subtítulo" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <div class="separator" />
      <button type="button" :class="{ active: editor.isActive('bulletList') }" title="Lista" @click="editor.chain().focus().toggleBulletList().run()">• Lista</button>
      <button type="button" :class="{ active: editor.isActive('orderedList') }" title="Lista numerada" @click="editor.chain().focus().toggleOrderedList().run()">1. Lista</button>
      <div class="separator" />
      <button type="button" title="Desfazer" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">↩</button>
      <button type="button" title="Refazer" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">↪</button>
    </div>
    <EditorContent :editor="editor" class="editor-body" />
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

:deep(.ProseMirror) { outline: none; }
:deep(.ProseMirror p) { margin: 0 0 0.75em; }
:deep(.ProseMirror h2) { font-size: 1.2em; font-weight: 700; margin: 1.2em 0 0.4em; }
:deep(.ProseMirror h3) { font-size: 1.05em; font-weight: 700; margin: 1em 0 0.3em; }
:deep(.ProseMirror ul, .ProseMirror ol) { padding-left: 1.4em; margin: 0.5em 0; }
:deep(.ProseMirror li) { margin-bottom: 0.2em; }
:deep(.ProseMirror strong) { font-weight: 700; }
:deep(.ProseMirror em) { font-style: italic; }
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: #b0a090;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
