<!-- resources/js/components/dev/InputHtmlDemo.vue (o la ruta que estes usando) -->
<template>
  <div class="container py-5">
    <h1 class="mb-4">Ejemplo de uso de &lt;InputHtml&gt;</h1>

    <input-html
      v-model="form.body"
      id="body-editor"
      name="body"
      placeholder="Escribe aqui el contenido principal..."
      :debounce-ms="1000"
      @update:modelValue="onContentUpdated"
      @ready="onEditorReady"
    />

    <hr class="my-4" />

    <h2 class="h5">Valor HTML actual (form.body):</h2>
    <pre class="bg-light p-3 small">{{ form.body }}</pre>

    <h2 class="h5 mt-4">Ultimo HTML recibido en @update:modelValue:</h2>
    <pre class="bg-light p-3 small">{{ lastUpdatedHtml }}</pre>

    <h2 class="h5 mt-4">Ultimo payload recibido en @ready (simplificado):</h2>
    <pre class="bg-light p-3 small">{{ lastReadyInfo }}</pre>
  </div>
</template>

<script>
export default {
  name: 'DevInputHtmlDemo',

  data() {
    return {
      form: {
        body: '<p>Contenido inicial de prueba.</p>',
      },
      lastUpdatedHtml: null,
      lastReadyInfo: null,
      editorInstance: null,
    }
  },

  methods: {
    onContentUpdated(newHtml) {
      this.lastUpdatedHtml = newHtml
      console.log('update:modelValue =>', newHtml)
    },

    onEditorReady(payload) {
      this.lastReadyInfo = {
        id: payload.id || null,
        name: payload.name || null,
      }

      this.editorInstance = payload.editor || null

      console.log('Editor listo (payload completo):', payload)
    },
  },
}
</script>
