<template>
  <div
    class="modal fade"
    tabindex="-1"
    ref="modal"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Editar países de la zona
          </h5>
          <button
            type="button"
            class="btn-close"
            :disabled="isLoading"
            @click="close"
          ></button>
        </div>

        <div class="modal-body">
          <div v-if="errorMessage" class="alert alert-danger py-2">
            {{ errorMessage }}
          </div>

          <div class="row g-2 mb-3">
            <div class="col-md-5">
              <label class="form-label mb-1">
                Buscar país por nombre
              </label>
              <input
                v-model.trim="filters.search"
                type="search"
                class="form-control form-control-sm"
                placeholder="Nombre del país..."
                @keyup.enter="applyFilters"
              />
            </div>

            <div class="col-md-3">
              <label class="form-label mb-1">Continente</label>
              <select
                v-model="filters.continent"
                class="form-select form-select-sm"
                @change="applyFilters"
              >
                <option value="">Todos los continentes</option>
                <option
                  v-for="(label, code) in continents"
                  :key="code"
                  :value="code"
                >
                  {{ label }}
                </option>
              </select>
            </div>

            <div class="col-md-2">
              <label class="form-label mb-1">Estado país</label>
              <select
                v-model="filters.status"
                class="form-select form-select-sm"
                @change="applyFilters"
              >
                <option value="all">Todos</option>
                <option value="active">Solo activos</option>
                <option value="inactive">Solo inactivos</option>
              </select>
            </div>

            <div class="col-md-2 text-md-end mt-2 mt-md-0">
              <button
                type="button"
                class="btn btn-sm btn-light"
                :disabled="isLoading"
                @click="resetFilters"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          <div v-if="isLoading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm" role="status"></div>
            <span class="ms-2 small text-muted">Cargando países...</span>
          </div>

          <div v-else>
            <div v-if="countries.length === 0" class="alert alert-light text-center">
              No se encontraron países con los filtros seleccionados.
            </div>

            <div v-else class="table-responsive">
              <table class="table table-row-dashed table-hover table-condensed align-middle mb-0">
                <thead>
                  <tr>
                    <th>País</th>
                    <th style="width: 180px;">Continente</th>
                    <th style="width: 120px;">Estado</th>
                    <th style="width: 140px;" class="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="country in countries" :key="country.id">
                    <td>
                      {{ translate(country.name) }}
                    </td>
                    <td>
                      {{ country.continent_label }}
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="
                          country.is_active
                            ? 'bg-success'
                            : 'bg-secondary'
                        "
                      >
                        {{ country.is_active ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm"
                        :class="
                          country.attached
                            ? 'btn-light-danger'
                            : 'btn-success'
                        "
                        @click="toggleAttach(country)"
                      >
                        {{ country.attached ? 'Quitar' : 'Añadir' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-2 small text-muted">
              Países incluidos en la zona:
              {{
                countries.filter((c) => c.attached).length
              }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-light"
            :disabled="isLoading"
            @click="close"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminZonesCountriesModal from '@frontend/modules/zones/CountriesModal.vue';

export default AdminZonesCountriesModal;
</script>
