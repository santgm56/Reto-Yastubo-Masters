<!-- /resources/js/components/admin/countries/EditModal.vue -->
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
              {{ isCreateMode ? 'Nuevo país' : 'Editar país' }}
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
                <label class="form-label">Nombre en español</label>
                <input
                  v-model="form.name.es"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Nombre en inglés</label>
                <input
                  v-model="form.name.en"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="row">
                <div class="mb-3 col-md-6">
                  <label class="form-label">Código ISO 2 letras</label>
                  <input
                    v-model="form.iso2"
                    type="text"
                    class="form-control"
                    maxlength="2"
                    @blur="form.iso2 = form.iso2 ? form.iso2.toUpperCase() : ''"
                    required
                  />
                  <div class="form-text">
                    Ejemplo: CL, US, AR
                  </div>
                </div>

                <div class="mb-3 col-md-6">
                  <label class="form-label">Código ISO 3 letras</label>
                  <input
                    v-model="form.iso3"
                    type="text"
                    class="form-control"
                    maxlength="3"
                    @blur="form.iso3 = form.iso3 ? form.iso3.toUpperCase() : ''"
                    required
                  />
                  <div class="form-text">
                    Ejemplo: CHL, USA, ARG
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Continente</label>
                <select
                  v-model="form.continent_code"
                  class="form-select"
                  required
                >
                  <option value="" disabled>Selecciona un continente</option>
                  <option
                    v-for="(label, code) in continents"
                    :key="code"
                    :value="code"
                  >
                    {{ label }}
                  </option>
                </select>
              </div>

              <div class="mb-0">
                <label class="form-label">Código telefónico (opcional)</label>
                <div class="input-group">
                  <span class="input-group-text">+</span>
                  <input
                    v-model="form.phone_code"
                    type="text"
                    class="form-control"
                    inputmode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <div class="form-text">
                  Solo dígitos, sin el signo +. Puede quedar vacío.
                </div>
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
              {{ isCreateMode ? 'Crear país' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AdminCountriesEditModal from '@frontend/modules/countries/EditModal.vue';

export default AdminCountriesEditModal;
</script>
