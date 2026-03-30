<!--/resources/js/components/admin/products/Index.vue-->
<template>
  <div class="card">
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

    <admin-products-edit-modal
      ref="productModal"
      :product-types="productTypes"
      @created="onProductCreated"
      @updated="onProductUpdated"
    ></admin-products-edit-modal>
  </div>
</template>

<script>
import AdminProductsEditModal from './EditModal.vue';
import { apiClient, extractApiErrorContract } from '@frontend/core/http/apiClient';
import { adminProductsIndexEndpoint } from './api';

export default {
  name: 'AdminProductsIndex',

  components: {
    AdminProductsEditModal,
  },

  data() {
    return {
      products: [],
      productTypes: [],
      isLoading: false,
      loadError: '',
    };
  },

  created() {
    this.loadProducts();
  },

  methods: {
    async loadProducts() {
      this.isLoading = true;
      this.loadError = '';

      try {
        const response = await apiClient.get(adminProductsIndexEndpoint());
        const payload = response?.data || {};
        const products = Array.isArray(payload?.data) ? payload.data : [];
        const productTypes = Array.isArray(payload?.meta?.product_types)
          ? payload.meta.product_types
          : [];

        this.products = JSON.parse(JSON.stringify(products));

        if (productTypes.length > 0) {
          this.productTypes = JSON.parse(JSON.stringify(productTypes));
        }
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_PRODUCTS_INDEX_ERROR');
        this.loadError = apiError.message || 'No se pudo cargar el listado de productos.';

        if (typeof window !== 'undefined' && typeof window.flash === 'function') {
          window.flash(this.loadError, 'danger');
        }
      } finally {
        this.isLoading = false;
      }
    },

    productEditUrl(product) {
      const productId = Number(product?.id || 0);
      if (!productId) {
        return '#';
      }
      return `/admin/products/${productId}/plans`;
    },

    typeLabel(value) {
      const t = this.productTypes.find(pt => pt.value === value);
      return t ? t.label : value;
    },

    openCreateProductModal() {
      if (this.$refs.productModal && this.$refs.productModal.openForCreate) {
        this.$refs.productModal.openForCreate();
      }
    },

    openEditProductModal(product) {
      if (this.$refs.productModal && this.$refs.productModal.openForEdit) {
        this.$refs.productModal.openForEdit(product.id);
      }
    },

    onProductCreated(newProduct) {
      this.products.unshift(newProduct);
      if (typeof window !== 'undefined' && typeof window.flash === 'function') {
        window.flash('Producto creado correctamente.', 'success');
      }
    },

    onProductUpdated(updatedProduct) {
      const idx = this.products.findIndex(p => p.id === updatedProduct.id);
      if (idx !== -1) {
        this.products.splice(idx, 1, updatedProduct);
      }
      if (typeof window !== 'undefined' && typeof window.flash === 'function') {
        window.flash('Producto actualizado correctamente.', 'success');
      }
    },
  },
};
</script>
