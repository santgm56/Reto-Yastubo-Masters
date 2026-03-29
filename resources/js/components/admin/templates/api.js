const base = '/api/v1/admin/templates'

export const templatesApi = {
	index: () => `${base}`,
	store: () => `${base}`,
	show: (templateId) => `${base}/${templateId}`,
	updateBasic: (templateId) => `${base}/${templateId}/basic`,
	templateTestData: (templateId) => `${base}/${templateId}/test-data`,
	destroy: (templateId) => `${base}/${templateId}`,
	clone: (templateId) => `${base}/${templateId}/clone`,

	versionsStore: (templateId) => `${base}/${templateId}/versions`,
	versionsShow: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}`,
	versionsUpdateBasic: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/basic`,
	versionsUpdateTestData: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/test-data`,
	versionsActivate: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/activate`,
	versionsDeactivate: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/deactivate`,
	versionsClone: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/clone`,
	versionsDestroy: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}`,
	versionsPreviewRaw: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/preview/raw`,
	versionsPreviewPdf: (templateId, versionId) => `${base}/${templateId}/versions/${versionId}/preview/pdf`,
	activePreviewPdf: (templateId) => `${base}/${templateId}/active/preview/pdf`,
}

export default templatesApi
