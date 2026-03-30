<template>
  <div class="card">
	  <div class="card-header d-flex justify-content-between align-items-center border-0 row">

		  <div class="col-xxl-8 col-sm-6">
			  <h3 class="h3">Lista de Zonas</h3>
		  </div>
		  <div class="col-xxl-4 col-sm-6 text-md-end">
			  <div class="input-group">
				  <select
						v-model="filters.status"
					  class="form-select form-select-sm"
						@change="applyFilters"
					  >
					  <option value="all">Ver Todas</option>
					  <option value="active">Ver activas</option>
					  <option value="inactive">Ver inactivas</option>
				  </select>
<!--				  <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="isLoading" @click="resetFilters">Limpiar</button>-->
				  <button type="button" class="btn btn-sm btn-primary" @click="openCreateZoneModal">
					  + Nueva zona
				  </button>
			  </div>
		  </div>
	  </div>
  </div>


    <div class="pt-3">
      <div v-if="isLoading" class="text-center py-5">
        <div class="spinner-border spinner-border-sm" role="status"></div>
        <span class="ms-2 small text-muted">Cargando zonas...</span>
      </div>

      <div v-else>
        <div v-if="zones.length === 0" class="alert alert-light text-center">
          No se encontraron zonas con los filtros seleccionados.
        </div>

        <div v-else class="vstack gap-4">
          <div
            v-for="zone in zones"
            :key="zone.id"
            class="card shadow-sm"
          >
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">
                  {{ zone.name }}  <span class="small text-muted">({{ zone.countries_count }} país)</span>
                </h5>

              </div>
              <div class="d-flex align-items-center gap-2">
                <span
                  class="badge"
                  :class="zone.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ zone.is_active ? 'Activa' : 'Inactiva' }}
                </span>
				<div class="dropdown">
				  <button
					class="btn btn-sm btn-secondary dropdown-toggle"
					type="button"
					data-bs-toggle="dropdown"
					aria-expanded="false"
				  >
					Opciones
				  </button>
				  <ul class="dropdown-menu dropdown-menu-end">
					<li>
					  <button
						type="button"
						class="dropdown-item"
						@click="openEditZoneModal(zone)"
					  >
						Editar zona
					  </button>
					</li>
					<li>
					  <button
						type="button"
						class="dropdown-item"
						@click="openEditCountriesModal(zone)"
					  >
						Editar países
					  </button>
					</li>
					<li><hr class="dropdown-divider" /></li>
					<li>
					  <button
						type="button"
						class="dropdown-item"
						@click="toggleActive(zone)"
					  >
						{{ zone.is_active ? 'Desactivar zona' : 'Activar zona' }}
					  </button>
					</li>
				  </ul>
				</div>

              </div>
            </div>

              <div v-if="zone.countries.length === 0" class="text-muted small card-body">
                Esta zona no tiene países asociados todavía.
              </div>


			<table v-else class="table table-row-dashed table-striped table-condensed table-hover mb-0">
			  <thead>
				<tr>
				  <th>País</th>
				  <th style="width: 180px;">Continente</th>
				  <th style="width: 110px;" class="text-end">Acción</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="country in zone.countries" :key="country.id">
					<td class="main">
					{{ translate(country.name) }}
				  </td>
				  <td>
					{{ country.continent_label }}
				  </td>
				  <td class="text-end">
					<button
					  type="button"
					  class="btn btn-sm btn-light-danger"
					  @click="detachFromCard(zone, country)"
					>
					  Quitar
					</button>
				  </td>
				</tr>
			  </tbody>
			</table>
          </div>
        </div>
      </div>
    </div>

    <admin-zones-edit-modal
      ref="zoneModal"
      @created="onZoneChanged"
      @updated="onZoneChanged"
    ></admin-zones-edit-modal>

    <admin-zones-countries-modal
      ref="countriesModal"
      :continents="continents"
      @updated="onZoneCountriesUpdated"
    ></admin-zones-countries-modal>
</template>

<script>
import AdminZonesIndex from '@frontend/modules/zones/Index.vue';

export default AdminZonesIndex;
</script>
