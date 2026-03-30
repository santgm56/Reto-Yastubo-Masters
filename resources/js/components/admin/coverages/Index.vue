<!-- resources/js/components/admin/coverages/Index.vue -->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h3 mb-0"></h1>
      <div class="btn-group">
        <button class="btn btn-primary" @click="openCategoryModalForCreate">
          + Crear categoría
        </button>
        <button class="btn bg-body btn-color-gray-700 btn-active-primary" @click="openArchivedCategoriesModal">
          Ver categorías archivadas
        </button>
      </div>
    </div>

    <!-- BLOQUES POR CATEGORÍA -->
    <div
      v-for="category in categories"
      :key="category.id"
      class="mb-4 card"
    >
      <div class="d-flex justify-content-between align-items-center card-header">
        <div>
          <h2 class="h5 mb-1">
            {{ translate(category.name) }}
          </h2>
          <p
            v-if="category.description && hasAnyTranslation(category.description)"
            class="mb-1 text-muted small"
          >
            {{ translate(category.description) }}
          </p>
        </div>

        <!-- Dropdown de acciones de categoría -->
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-sm btn-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Acciones
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item" @click="openCategoryModalForEdit(category)">
                <i class="fa-solid fa-pencil"></i> Editar
              </button>
            </li>
            <li>
              <button class="dropdown-item" @click="archiveCategory(category)">
                <i class="fa-solid fa-box-archive"></i> Archivar
              </button>
            </li>
            <li>
              <button class="dropdown-item btn-primary" @click="openCoverageModalForCreate(category)">
                <i class="fa-solid fa-plus"></i> Añadir cobertura
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Tabla de coberturas dentro de la categoría -->
      <table class="table table-row-dashed table-striped">
        <thead>
          <tr>
            <th style="width: 2rem;"></th> <!-- handle drag -->
            <th style="width: 50%">Nombre</th>
            <th style="width: 20%">Unidad</th>
            <th style="width: 20%">Estado</th>
            <th></th> <!-- Acciones -->
          </tr>
        </thead>

        <!-- Animación FLIP con transition-group -->
        <transition-group tag="tbody" name="row">
          <tr
            v-for="coverage in (category.coverages || [])"
            :key="coverage.id"
            :class="{
              'table-active': isDragging && dragCategoryId === category.id && dragOverCoverageId === coverage.id,
            }"
            @dragover.prevent
            @dragenter.prevent="onDragEnter(category.id, coverage.id)"
          >
            <td>
              <span
                class="drag-handle"
                draggable="true"
                @dragstart="onDragStart(category.id, coverage.id, $event)"
                @dragend="onDragEnd"
                title="Arrastrar para reordenar"
              >
                <i class="fa-solid fa-up-down"></i>
              </span>
            </td>
            <td>
              <div>
				  <span class="main">{{ translate(coverage.name) }}</span>
                <div
                  v-if="coverage.description && hasAnyTranslation(coverage.description)"
                  class="small text-muted"
                >
                  {{ translate(coverage.description) }}
                </div>
              </div>
            </td>
            <td>
              <span>{{ coverage.unit ? translate(coverage.unit.name) : '-' }}</span>
            </td>
            <td>
              <span
                class="badge"
                :class="coverage.status === 'active' ? 'bg-success' : 'bg-secondary'"
              >
                {{ coverage.status === 'active' ? 'Activa' : 'Archivada' }}
              </span>
            </td>
            <td class="text-end">
              <!-- Dropdown de acciones de cobertura -->
              <div class="btn-group">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Acciones
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <button
                      class="dropdown-item"
                      @click="openCoverageModalForEdit(coverage, category)"
                    >
                      Editar
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      @click="openCoverageUsagesModal(coverage)"
                    >
                      Ver usos
                    </button>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <button
                      v-if="coverage.status === 'active'"
                      class="dropdown-item text-warning"
                      @click="archiveCoverage(coverage, category)"
                    >
                      Archivar
                    </button>
                    <button
                      v-else
                      class="dropdown-item text-success"
                      @click="restoreCoverage(coverage, category)"
                    >
                      Restaurar
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item text-danger"
                      @click="deleteCoverage(coverage, category)"
                    >
                      Eliminar
                    </button>
                  </li>
                </ul>
              </div>
            </td>
          </tr>

          <tr
            v-if="!category.coverages || category.coverages.length === 0"
            key="empty-row"
          >
            <td colspan="5" class="text-muted small">
              No hay coberturas en esta categoría.
            </td>
          </tr>
        </transition-group>
      </table>
    </div>

    <!-- MODAL CREAR/EDITAR CATEGORÍA -->
    <div
      class="modal fade"
      tabindex="-1"
      ref="categoryModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitCategoryForm">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ categoryForm.id ? 'Editar categoría' : 'Crear categoría' }}
              </h5>
              <button type="button" class="btn-close" @click="closeCategoryModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Nombre (ES)</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="categoryForm.name.es"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Nombre (EN)</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="categoryForm.name.en"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción (ES)</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model="categoryForm.description.es"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción (EN)</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model="categoryForm.description.en"
                ></textarea>
              </div>
              <div v-if="categoryFormError" class="alert alert-danger py-2">
                {{ categoryFormError }}
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeCategoryModal"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL CATEGORÍAS ARCHIVADAS -->
    <div
      class="modal fade"
      tabindex="-1"
      ref="archivedCategoriesModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Categorías archivadas</h5>
            <button type="button" class="btn-close" @click="closeArchivedCategoriesModal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style="width: 6rem;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in archivedCategories" :key="cat.id">
                  <td>{{ translate(cat.name) }}</td>
                  <td>
                    <span
                      v-if="cat.description && hasAnyTranslation(cat.description)"
                    >
                      {{ translate(cat.description) }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button
                      class="btn btn-success"
                      @click="restoreCategory(cat)"
                    >
                      Restaurar
                    </button>
                  </td>
                </tr>
                <tr v-if="archivedCategories.length === 0">
                  <td colspan="3" class="text-muted small">
                    No hay categorías archivadas.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeArchivedCategoriesModal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL CREAR/EDITAR COBERTURA -->
    <div
      class="modal fade"
      tabindex="-1"
      ref="coverageModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="submitCoverageForm">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ coverageForm.id ? 'Editar cobertura' : 'Crear cobertura' }}
              </h5>
              <button type="button" class="btn-close" @click="closeCoverageModal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Categoría</label>
                <select class="form-select" v-model="coverageForm.category_id" required>
                  <option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ translate(cat.name) }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Unidad de medida</label>
                <select class="form-select" v-model="coverageForm.unit_id" required>
                  <option
                    v-for="unit in units"
                    :key="unit.id"
                    :value="unit.id"
                  >
                    {{ translate(unit.name) }} ({{ unit.measure_type }})
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Nombre (ES)</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="coverageForm.name.es"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Nombre (EN)</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="coverageForm.name.en"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción (ES)</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model="coverageForm.description.es"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción (EN)</label>
                <textarea
                  class="form-control"
                  rows="2"
                  v-model="coverageForm.description.en"
                ></textarea>
              </div>
              <div v-if="coverageFormError" class="alert alert-danger py-2">
                {{ coverageFormError }}
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeCoverageModal"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- MODAL VER USOS DE COBERTURA -->
    <div
      class="modal fade"
      tabindex="-1"
      ref="coverageUsagesModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              Usos de cobertura:
              <span v-if="selectedCoverage">
                {{ translate(selectedCoverage.name) }}
              </span>
            </h5>
            <button type="button" class="btn-close" @click="closeCoverageUsagesModal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Versión</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="usage in coverageUsages"
                  :key="usage.product_version_id"
                >
                  <td>
                    <template v-if="usage.product_link">
                      <a :href="usage.product_link" target="_blank">
                        {{ usage.product_name || ('Producto #' + usage.product_id) }}
                      </a>
                    </template>
                    <template v-else>
                      {{ usage.product_name || ('Producto #' + usage.product_id) }}
                    </template>
                  </td>
                  <td>
                    <template v-if="usage.version_link">
                      <a :href="usage.version_link" target="_blank">
                        Versión #{{ usage.version_id }}
                      </a>
                    </template>
                    <template v-else>
                      Versión #{{ usage.version_id }}
                    </template>
                  </td>
                  <td></td>
                </tr>
                <tr v-if="coverageUsages.length === 0">
                  <td colspan="3" class="text-muted small">
                    Esta cobertura no está usada en ninguna versión de producto.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeCoverageUsagesModal"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import AdminCoveragesIndex from '@frontend/modules/coverages/Index.vue';

export default AdminCoveragesIndex;
</script>

<style scoped>
/* Animación FLIP de <transition-group name="row"> */
.row-move {
  transition: transform 0.15s ease;
}
</style>
