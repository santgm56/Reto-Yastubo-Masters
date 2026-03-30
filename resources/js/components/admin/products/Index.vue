<!--/resources/js/components/admin/products/Index.vue-->
<template>
  <div class="card">
    <!-- Header -->
    <div class="card-header d-flex justify-content-between align-items-center mb-3">
      <h3 class="h3">Listado de productos (regulares)</h3>
      <button class="btn btn-sm btn-primary" @click="openCreateProductModal">
        + Crear producto
      </button>
    </div>

    <div v-if="isLoading" class="px-6 py-4 text-muted small d-flex align-items-center gap-2">
      <span class="spinner-border spinner-border-sm" role="status"></span>
      Cargando productos...
    </div>

    <div v-else-if="loadError" class="alert alert-warning mx-6 mt-4 mb-0" role="alert">
      {{ loadError }}
    </div>

    <!-- Tabla de productos -->
    <table class="table table-row-dashed table-striped table-hover table-condensed">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Mostrar en home</th>
          <th style="width: 7rem;"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td class="text-muted">
            #{{ product.id }}
          </td>
          <td>
            <div>
              <span class="main">{{ translate(product.name) }}</span>
              <div
                v-if="translate(product.description)"
                class="text-muted"
              >
                {{ translate(product.description) }}
              </div>
            </div>
          </td>
          <td>
            {{ typeLabel(product.product_type) }}
          </td>
          <td>
            <span
              class="badge"
              :class="product.status === 'active' ? 'bg-success' : 'bg-secondary'"
            >
              {{ product.status === 'active' ? 'Activo' : 'Inactivo' }}
            </span>
          </td>
          <td>
            <span
              class="badge"
              :class="product.show_in_widget ? 'bg-info' : 'bg-light text-muted border'"
            >
              {{ product.show_in_widget ? 'Sí' : 'No' }}
            </span>
          </td>
          <td class="text-end">
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
                <!-- Si en el futuro quieres editar datos desde aquí, puedes reactivar esta opción -->
                <!--
                <li>
                  <button
                    type="button"
                    class="dropdown-item"
                    @click="openEditProductModal(product)"
                  >
                    Editar datos
                  </button>
                </li>
                -->
                <li>
                  <a
                    class="dropdown-item"
                    :href="productEditUrl(product)"
                  >
                    Gestionar versiones
                  </a>
                </li>
              </ul>
            </div>
          </td>
        </tr>

        <tr v-if="products.length === 0">
          <td colspan="6" class="text-muted small">
            No hay productos registrados.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de creación/edición de producto -->
    <admin-products-edit-modal
      ref="productModal"
      :product-types="productTypes"
      @created="onProductCreated"
      @updated="onProductUpdated"
    ></admin-products-edit-modal>
  </div>
</template>

<script>
import AdminProductsIndex from '@frontend/modules/products/Index.vue';

export default AdminProductsIndex;
</script>
