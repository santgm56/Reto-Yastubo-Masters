<!-- /resources/js/components/admin/templates/TemplateTestDataModal.vue -->
<template>
	<div class="modal fade" tabindex="-1" ref="modalEl">
		<div class="modal-dialog modal-dialog-centered modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Editar JSON de datos de prueba (Plantilla)</h5>
					<button type="button" class="btn-close" @click="close" :disabled="isSaving || isLoading"></button>
				</div>

				<div class="modal-body">
					<div v-if="isLoading" class="text-muted">Cargando…</div>

					<div v-else>
						<code-editor
							language="json"
							v-model="rawJson"
							:id="'template-test-data-' + String(templateId || '')"
							name="template_test_data_json"
							:debounce-ms="autosaveDelayMs"
							@update:modelValue="onCommit"
						/>
					</div>
				</div>

				<div class="modal-footer">
					<button type="button" class="btn btn-sm btn-secondary" @click="close" :disabled="isSaving || isLoading">Cerrar</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { apiClient, extractApiErrorContract } from '../../../core/http/apiClient';
import templatesApi from './api';

export default {
	name: 'AdminTemplatesTemplateTestDataModal',

	emits: ['updated'],

	data() {
		return {
			modalInstance: null,
			templateId: null,
			isLoading: false,
			isSaving: false,
			error: null,
			autosaveDelayMs: 900,

			rawJson: '',

			// control de autosave por inactividad solo si hubo cambios reales
			lastSavedValue: '',
		};
	},

	mounted() {
		if (typeof window !== 'undefined' && window.bootstrap && this.$refs.modalEl) {
			const { Modal } = window.bootstrap;
			this.modalInstance = Modal.getOrCreateInstance(this.$refs.modalEl, { backdrop: 'static' });
		}
	},

	methods: {
		async open(templateId) {
			this.templateId = templateId;
			this.error = null;
			this.isLoading = true;
			this.rawJson = '';
			this.lastSavedValue = '';

			if (this.modalInstance) this.modalInstance.show();

			try {
				const { data } = await apiClient.get(templatesApi.show(templateId));
				const t = data?.data?.template;
				this.rawJson = t?.test_data_json || '';
				this.lastSavedValue = this.rawJson;
			} catch (e) {
				this.error = 'No se pudo cargar el JSON.';
			} finally {
				this.isLoading = false;
			}
		},

		close() {
			if (this.modalInstance) this.modalInstance.hide();
		},

		onCommit(value) {
			if (typeof value !== 'string') return;
			if (value === this.lastSavedValue) return;

			this.rawJson = value;
			this.save();
		},

		async save() {
			if (!this.templateId) return;
			if (this.rawJson === this.lastSavedValue) return;

			this.isSaving = true;
			this.error = null;

			try {
				const payload = { test_data_json: this.rawJson };
				const { data } = await apiClient.patch(templatesApi.templateTestData(this.templateId), payload);

				if (typeof window !== 'undefined' && typeof window.flash === 'function' && data?.toast?.message) {
					window.flash(data.toast.message, data.toast.type || 'success');
				}

				// Regla: nunca reemplazar el valor local con lo que responda el backend.
				// El backend ya no devuelve template en edición.
				this.lastSavedValue = this.rawJson;
				this.$emit('updated', { id: this.templateId });
			} catch (e) {
				const apiError = extractApiErrorContract(e, 'API_TEMPLATES_TEST_DATA_UPDATE_ERROR');
				this.error = e?.response?.data?.toast?.message || apiError.message || 'No se pudo guardar el JSON.';

				if (typeof window !== 'undefined' && typeof window.flash === 'function') {
					window.flash(this.error, 'danger');
				}
			} finally {
				this.isSaving = false;
			}
		},
	},
};
</script>
