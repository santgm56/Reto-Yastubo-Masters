<!-- resources/js/components/dev/Select2CountryDemo.vue -->
<template>
	<div class="row g-5">
		<div class="col-md-4">
			<h3 class="mb-3">Select2 simple</h3>

			<select2
				v-model="countryIdSimple"
				:options="initialCountries"
				value-field="id"
				label-field="name"
				placeholder="Seleccione un pais"
				:search-enabled="true"
				:accent-insensitive="true"
				:nullable="false"
				:allow-empty-on-init="true"
				@select2-change="onSimpleSelect2Change"
			/>

			<div class="mt-2 small text-muted">
				ID seleccionado (simple):
				<strong>{{ countryIdSimple === null ? 'null' : countryIdSimple }}</strong>
			</div>

			<pre
				v-if="lastSimpleEvent !== null"
				class="mt-2 small bg-light p-2 rounded"
			>{{ JSON.stringify(lastSimpleEvent, null, 2) }}</pre>
		</div>

		<div class="col-md-4">
			<h3 class="mb-3">Select2 agrupado</h3>

			<select2
				v-model="countryIdGrouped"
				:options="initialCountries"
				value-field="id"
				label-field="name"
				group-field="continent_code"
				placeholder="Seleccione un pais (agrupado)"
				:search-enabled="true"
				:accent-insensitive="true"
				:nullable="true"
				:allow-empty-on-init="true"
				@select2-change="onGroupedSelect2Change"
			/>

			<div class="mt-2 small text-muted">
				ID seleccionado (agrupado):
				<strong>{{ countryIdGrouped === null ? 'null' : countryIdGrouped }}</strong>
			</div>

			<pre
				v-if="lastGroupedEvent !== null"
				class="mt-2 small bg-light p-2 rounded"
			>{{ JSON.stringify(lastGroupedEvent, null, 2) }}</pre>
		</div>

		<div class="col-md-4">
			<h3 class="mb-3">Select2 [value => label]</h3>

			<select2
				v-model="countryIso3Selected"
				:options="countriesIso3Map"
				placeholder="Seleccione un pais (ISO3)"
				:search-enabled="true"
				:accent-insensitive="true"
				:nullable="true"
				:allow-empty-on-init="true"
				@select2-change="onIso3Select2Change"
			/>

			<div class="mt-2 small text-muted">
				Codigo ISO3 seleccionado:
				<strong>{{ countryIso3Selected === null ? 'null' : countryIso3Selected }}</strong>
			</div>

			<pre
				v-if="lastIso3Event !== null"
				class="mt-2 small bg-light p-2 rounded"
			>{{ JSON.stringify(lastIso3Event, null, 2) }}</pre>
		</div>
	</div>
</template>

<script>
import Select2 from '@frontend/shared/ui/Select2.vue'

export default {
	name: 'Select2CountryDemo',

	components: {
		Select2,
	},

	props: {
		initialCountries: {
			type: Array,
			default: () => [],
		},

		countriesIso3Map: {
			type: Object,
			default: () => ({}),
		},
	},

	data() {
		return {
			countryIdSimple: null,
			countryIdGrouped: null,
			countryIso3Selected: null,

			lastSimpleEvent: null,
			lastGroupedEvent: null,
			lastIso3Event: null,
		}
	},

	watch: {
		initialCountries: {
			deep: true,
			handler(newVal) {
				if (!Array.isArray(newVal) || newVal.length === 0) {
					this.countryIdSimple = null
					this.countryIdGrouped = null
					return
				}

				const firstId = newVal[0]?.id ?? null

				if (this.countryIdSimple === null) {
					this.countryIdSimple = firstId
				}

				if (this.countryIdGrouped === null) {
					this.countryIdGrouped = firstId
				}
			},
			immediate: true,
		},

		countriesIso3Map: {
			deep: true,
			handler(newVal) {
				const keys = newVal && typeof newVal === 'object'
					? Object.keys(newVal)
					: []

				if (keys.length === 0) {
					this.countryIso3Selected = null
					return
				}

				if (this.countryIso3Selected === null) {
					this.countryIso3Selected = keys[0]
				}
			},
			immediate: true,
		},
	},

	methods: {
		onSimpleSelect2Change(payload) {
			this.lastSimpleEvent = payload
		},

		onGroupedSelect2Change(payload) {
			this.lastGroupedEvent = payload
		},

		onIso3Select2Change(payload) {
			this.lastIso3Event = payload
		},
	},
}
</script>
