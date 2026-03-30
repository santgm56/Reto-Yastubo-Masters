<template>
  <div
    class="modal fade"
    tabindex="-1"
    ref="modal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="submit">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isCreateMode ? 'Nueva zona' : 'Editar zona' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              :disabled="isSubmitting"
              @click="close"
            ></button>
          </div>

          <div class="modal-body">
            <div v-if="errorMessage" class="alert alert-danger py-2">
              {{ errorMessage }}
            </div>

            <div v-if="isLoading" class="text-center my-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
              <span class="ms-2 small text-muted">Cargando datos...</span>
            </div>

            <div v-else>
              <div class="mb-3">
                <label class="form-label">Nombre de la zona</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Descripción (opcional)</label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              :disabled="isSubmitting"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || isLoading"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ isCreateMode ? 'Crear zona' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AdminZonesEditModal from '@frontend/modules/zones/EditModal.vue';

export default AdminZonesEditModal;
</script>
