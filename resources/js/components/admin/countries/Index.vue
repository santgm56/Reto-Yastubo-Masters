<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center border-0 row">
      <div class="col-xxl-8 col-sm-6">
        <h3 class="h3">Lista de Países</h3>
      </div>
      <div class="col-xxl-4 col-sm-6 text-md-end">
        <div class="input-group">
          <select
            v-model="filters.status"
            class="form-select form-select-sm"
            @change="applyFilters"
          >
            <option value="all">Ver todas</option>
            <option value="active">Ver activas</option>
            <option value="inactive">Ver inactivas</option>
          </select>
          <button
            type="button"
            class="btn btn-sm btn-primary"
            @click="openCreateCountryModal"
          >
            + Nuevo país
          </button>
        </div>
      </div>
    </div>

    <div class="card-body pt-3">
      <div class="row g-2 mb-3">
        <div class="col-md-4">
          <label class="form-label mb-1">Buscar país / ISO / código telefónico</label>
          <input
            v-model.trim="filters.search"
            type="search"
            class="form-control form-control-sm"
            placeholder="Nombre, ISO2, ISO3 o código telefónico..."
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

        <div class="col-md-3 d-flex align-items-end">
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
	</div>
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border spinner-border-sm" role="status"></div>
        <span class="ms-2 small">Cargando países...</span>
      </div>

      <div v-else>
        <div v-if="countries.length === 0" class="alert text-center">
          No se encontraron países con los filtros seleccionados.
        </div>

        <div v-else class="table-responsive">
          <table class="table table-row-dashed table-striped table-condensed table-hover mb-0 align-middle">
            <thead>
              <tr>
                <th>País</th>
                <th style="width: 90px;">ISO 2</th>
                <th style="width: 90px;">ISO 3</th>
                <th style="width: 180px;">Continente</th>
                <th style="width: 150px;">Código telefónico</th>
                <th style="width: 110px;">Estado</th>
                <th style="width: 160px;" class="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="country in countries" :key="country.id">
                <td class="main">
                  {{ translate(country.name) }}
                </td>
                <td>
                  {{ country.iso2 }}
                </td>
                <td>
                  {{ country.iso3 }}
                </td>
                <td>
                  {{ country.continent_label }}
                </td>
                <td>
                  <span v-if="country.phone_code">
                    +{{ country.phone_code }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="country.is_active ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ country.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button
                      type="button"
                      class="btn btn-sm btn-light-primary"
                      @click="openEditCountryModal(country)"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm"
                      :class="
                        country.is_active
                          ? 'btn-light-danger'
                          : 'btn-light-success'
                      "
                      @click="toggleActive(country)"
                    >
                      {{ country.is_active ? 'Desactivar' : 'Activar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>

    <admin-countries-edit-modal
      ref="countryModal"
      :continents="continents"
      @created="onCountryCreated"
      @updated="onCountryUpdated"
    ></admin-countries-edit-modal>
  </div>
</template>

<script>
import AdminCountriesIndex from '@frontend/modules/countries/Index.vue';

export default AdminCountriesIndex;
</script>
