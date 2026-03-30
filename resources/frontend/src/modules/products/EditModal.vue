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
import { apiClient, extractApiErrorContract } from '@frontend/core/http/apiClient';
import {
  adminProductsShowEndpoint,
  adminProductsStoreEndpoint,
  adminProductsUpdateEndpoint,
} from './api';

export default {
  name: 'AdminProductsEditModal',

  props: {
    productTypes: {
      type: Array,
      default: () => [],
    },
    forcedProductType: {
      type: String,
      default: null,
    },
    contextCompanyId: {
      type: [Number, String],
      default: null,
    },
  },

  data() {
    return {
      mode: 'create',
      productId: null,

      form: {
        name: { es: '', en: '' },
        description: { es: '', en: '' },
        product_type: '',
        status: 'inactive',
        show_in_widget: false,
      },

      isLoading: false,
      isSubmitting: false,
      modalInstance: null,
    };
  },

  computed: {
    isCreateMode() {
      return this.mode === 'create';
    },

    showWidgetField() {
      if (this.isCreateMode) {
        return false;
      }

      const type = this.form.product_type || this.forcedProductType || null;

      if (type === 'plan_capitado') {
        return false;
      }

      return true;
    },
  },

  mounted() {
    this.ensureModalInstance();
  },

  methods: {
    ensureModalInstance() {
      if (this.modalInstance) return;
      if (typeof window === 'undefined' || !window.bootstrap) return;
      if (!this.$refs.modal) return;

      const { Modal } = window.bootstrap;
      this.modalInstance = Modal.getOrCreateInstance(this.$refs.modal, {
        backdrop: 'static',
      });

      this.$refs.modal.addEventListener('hidden.bs.modal', () => {
        this.isLoading = false;
        this.isSubmitting = false;
      });
    },

    resetForm() {
      this.form = {
        name: { es: '', en: '' },
        description: { es: '', en: '' },
        product_type: this.forcedProductType || '',
        status: 'inactive',
        show_in_widget: false,
      };
    },

    openForCreate() {
      this.ensureModalInstance();
      this.mode = 'create';
      this.productId = null;
      this.isLoading = false;
      this.isSubmitting = false;
      this.resetForm();

      if (!this.form.product_type) {
        const first = (this.productTypes || [])[0];
        if (first && first.value) {
          this.form.product_type = first.value;
        }
      }

      this.form.status = 'inactive';
      this.form.show_in_widget = false;

      if (this.modalInstance) {
        this.modalInstance.show();
      }
    },

    async openForEdit(productId) {
      this.ensureModalInstance();
      this.mode = 'edit';
      this.productId = productId;
      this.isSubmitting = false;
      this.resetForm();

      this.isLoading = true;

      try {
        const { data } = await apiClient.get(adminProductsShowEndpoint(productId));
        const product = data.data || data;

        this.form.name = product.name || { es: '', en: '' };
        this.form.description = product.description || { es: '', en: '' };
        this.form.product_type =
          product.product_type || this.forcedProductType || '';
        this.form.status = product.status || 'inactive';

        const type = this.form.product_type || this.forcedProductType || null;
        if (type === 'plan_capitado') {
          this.form.show_in_widget = false;
        } else {
          this.form.show_in_widget = !!product.show_in_widget;
        }

        if (this.modalInstance) {
          this.modalInstance.show();
        }
      } catch (e) {
        const apiError = extractApiErrorContract(e, 'API_PRODUCTS_SHOW_ERROR');
        const msg = apiError.message || 'No se pudo cargar el producto.';
        if (typeof window !== 'undefined' && typeof window.flash === 'function') {
          window.flash(msg, 'danger');
        } else {
          console.error(msg);
        }
      } finally {
        this.isLoading = false;
      }
    },

    close() {
      if (this.modalInstance) {
        this.modalInstance.hide();
      }
    },

    async submit() {
      this.isSubmitting = true;

      const resolvedType = this.form.product_type || this.forcedProductType || null;
      const isCapitated = resolvedType === 'plan_capitado';

      const widgetValue =
        this.isCreateMode || isCapitated
          ? 0
          : this.form.show_in_widget
            ? 1
            : 0;

      try {
        let response;

        if (this.isCreateMode) {
          if (!resolvedType) {
            const msg = 'No se ha definido el tipo de producto a crear.';
            if (typeof window !== 'undefined' && typeof window.flash === 'function') {
              window.flash(msg, 'danger');
            } else {
              console.error(msg);
            }
            this.isSubmitting = false;
            return;
          }

          const payload = {
            name: this.form.name,
            description: this.form.description,
            product_type: resolvedType,
            show_in_widget: widgetValue,
            status: 'inactive',
          };

          if (this.contextCompanyId) {
            payload.company_id = this.contextCompanyId;
          }

          response = await apiClient.post(adminProductsStoreEndpoint(), payload);

          const product = response.data.data || response.data;
          this.$emit('created', product);
        } else {
          const payload = {
            name: this.form.name,
            description: this.form.description,
            show_in_widget: widgetValue,
            status: this.form.status,
          };

          response = await apiClient.put(adminProductsUpdateEndpoint(this.productId), payload);

          const product = response.data.data || response.data;
          this.$emit('updated', product);
        }

        this.close();
      } catch (e) {
        const apiError = extractApiErrorContract(e, 'API_PRODUCTS_SAVE_ERROR');
        let msg = apiError.message || 'Error al guardar el producto.';

        const errors = apiError.validationErrors;
        if (errors && typeof errors === 'object') {
          const firstKey = Object.keys(errors)[0];
          const firstVal = firstKey ? errors[firstKey] : null;
          if (Array.isArray(firstVal) && firstVal[0]) {
            msg = firstVal[0];
          }
        }

        if (typeof window !== 'undefined' && typeof window.flash === 'function') {
          window.flash(msg, 'danger');
        } else {
          console.error(msg);
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>
