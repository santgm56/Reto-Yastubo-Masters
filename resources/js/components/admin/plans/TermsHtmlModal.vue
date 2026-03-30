<!-- /resources/js/components/admin/plans/TermsHtmlModal.vue -->
<template>
	<div class="modal fade" tabindex="-1" ref="modalEl">
		<div class="modal-dialog modal-fullscreen-xl-down modal-xl modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">
						{{ modalTitle }}
					</h5>
					<button
						type="button"
						class="btn-close"
						@click="close"
						:disabled="isLoading"
					></button>
				</div>

				<div class="modal-body">
					<div v-if="isLoading" class="text-center text-muted py-5">
						Cargando términos y condiciones…
					</div>

					<div v-else>
						<InputHtml
							v-model="htmlValue"
							:id="`terms-html-${currentLocale}`"
							:name="`terms_html_${currentLocale}`"
							height="70vh"
							:debounce-ms="800"
							placeholder="Escribe aquí los términos y condiciones…"
							@update:modelValue="onHtmlUpdated"
						/>
					</div>
					<div style="text-align: right!important;" class="mt-4">
						<button
							type="button"
							class="btn btn-sm btn-secondary"
							@click="close"
							:disabled="isLoading"
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
import { apiClient, extractApiErrorContract } from '../../../core/http/apiClient'
import InputHtml from '@frontend/shared/ui/InputHtml.vue'
import { adminPlanTermsHtmlEndpoint } from './api'

export default {
	name: 'AdminPlansTermsHtmlModal',

	components: {
		InputHtml,
	},

	props: {
		productId: {
			type: [Number, String],
			required: true,
		},
		planVersionId: {
			type: [Number, String],
			required: true,
		},
	},

	emits: ['updated'],

	data() {
		return {
			modalInstance: null,
			currentLocale: 'es',
			htmlValue: '',
			isLoading: false,
		}
	},

	computed: {
		modalTitle() {
			return this.currentLocale === 'en'
				? 'Términos y condiciones — Versión Inglés'
				: 'Términos y condiciones — Versión Español'
		},
		localeLabel() {
			return this.currentLocale === 'en' ? 'Inglés' : 'Español'
		},
	},

	mounted() {
		if (typeof window !== 'undefined' && window.bootstrap && this.$refs.modalEl) {
			const { Modal } = window.bootstrap
			this.modalInstance = Modal.getOrCreateInstance(this.$refs.modalEl, {
				backdrop: 'static',
			})
		}
	},

	methods: {
		open(locale = 'es') {
			this.currentLocale = locale === 'en' ? 'en' : 'es'
			this.load()

			if (this.modalInstance) {
				this.modalInstance.show()
			}
		},

		close() {
			if (this.modalInstance) {
				this.modalInstance.hide()
			}
		},

		async load() {
			this.isLoading = true
			try {
				const { data } = await apiClient.get(
					adminPlanTermsHtmlEndpoint(this.productId, this.planVersionId),
				)
				const terms = (data && data.data && data.data.terms_html) ? data.data.terms_html : {}

				const value = terms && typeof terms === 'object'
					? (terms[this.currentLocale] ?? '')
					: ''

				this.htmlValue = value || ''

				// Emitir tamaño inicial para el idioma actual
				this.$emit('updated', {
					locale: this.currentLocale,
					html: this.htmlValue,
				})
			} catch (e) {
				if (typeof flash === 'function') {
					const apiError = extractApiErrorContract(e, 'API_PLAN_TERMS_HTML_LOAD_ERROR')
					flash(apiError.message || 'No se pudieron cargar los términos y condiciones.', 'danger')
				}
			} finally {
				this.isLoading = false
			}
		},

		// Se dispara después del debounce interno de <InputHtml>
		async onHtmlUpdated(newHtml) {
			this.htmlValue = newHtml || ''

			try {
				const payload = {
					locale: this.currentLocale,
					html: this.htmlValue,
				}

				const { data } = await apiClient.patch(
					adminPlanTermsHtmlEndpoint(this.productId, this.planVersionId),
					payload,
				)
				const toast = data?.toast

				if (toast?.message && typeof flash === 'function') {
					flash(toast.message, toast.type || 'success')
				}

				// Notificar al padre para que pueda recalcular el tamaño
				this.$emit('updated', {
					locale: this.currentLocale,
					html: this.htmlValue,
				})
			} catch (e) {
				if (typeof flash === 'function') {
					const apiError = extractApiErrorContract(e, 'API_PLAN_TERMS_HTML_SAVE_ERROR')
					flash(apiError.message || 'No se pudo guardar los términos y condiciones.', 'danger')
				}
			}
		},
	},
}
</script>
