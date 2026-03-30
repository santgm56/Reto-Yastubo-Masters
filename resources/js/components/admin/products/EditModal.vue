<template>
  <div
    class="modal fade"
    tabindex="-1"
    ref="modal"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form @submit.prevent="submit">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isCreateMode ? 'Crear producto' : 'Editar producto' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              :disabled="isSubmitting"
              @click="close"
            ></button>
          </div>

          <div class="modal-body">
            <div v-if="isLoading" class="text-center my-3">
              <div class="spinner-border spinner-border-sm" role="status"></div>
              <span class="ms-2 small text-muted">Cargando datos...</span>
            </div>

            <div v-else>
              <!-- Nombre -->
              <div class="row">
                <div class="mb-3 col-md-6">
                  <label class="form-label">Nombre (ES)</label>
                  <input
                    v-model="form.name.es"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>
                <div class="mb-3 col-md-6">
                  <label class="form-label">Nombre (EN)</label>
                  <input
                    v-model="form.name.en"
                    type="text"
                    class="form-control"
                  />
                </div>
              </div>

              <!-- Descripción -->
              <div class="row">
                <div class="mb-3 col-md-6">
                  <label class="form-label">Descripción (ES)</label>
                  <textarea
                    v-model="form.description.es"
                    rows="2"
                    class="form-control"
                  ></textarea>
                </div>
                <div class="mb-3 col-md-6">
                  <label class="form-label">Descripción (EN)</label>
                  <textarea
                    v-model="form.description.en"
                    rows="2"
                    class="form-control"
                  ></textarea>
                </div>
              </div>

              <!-- Estado (solo en edición) -->
              <div
                class="mb-3"
                v-if="!isCreateMode"
              >
                <label class="form-label">Estado</label>
                <select
                  v-model="form.status"
                  class="form-select"
                  required
                >
                  <option value="inactive">Inactivo</option>
                  <option value="active">Activo</option>
                </select>
              </div>

              <!-- Mostrar en widget (solo productos regulares y solo en edición) -->
              <div class="mb-3" v-if="showWidgetField">
                <label class="form-label">Mostrar en widget de inicio</label>
                <select
                  v-model="form.show_in_widget"
                  class="form-select"
                >
                  <option :value="false">No</option>
                  <option :value="true">Sí</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              :disabled="isSubmitting"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-sm btn-primary"
              :disabled="isSubmitting || isLoading"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AdminProductsEditModal from '@frontend/modules/products/EditModal.vue';

export default AdminProductsEditModal;
</script>
