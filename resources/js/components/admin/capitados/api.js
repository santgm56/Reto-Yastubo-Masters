export function adminCompanyCapitatedMonthlyMonthsEndpoint(companyId) {
  return `/api/v1/admin/companies/${companyId}/capitated/reports/monthly/months`
}

export function adminCompanyCapitatedMonthlyDownloadEndpoint(companyId, month) {
  return `/api/v1/admin/companies/${companyId}/capitated/reports/monthly/${month}/download`
}

export function publicCapitatedContractPdfEndpoint(uuid) {
  return `/api/v1/public/capitated/contracts/${uuid}/pdf`
}

export function adminCompanyCapitatedContractsEndpoint(companyId) {
  return `/api/v1/admin/companies/${companyId}/capitated/contracts`
}

export function adminCompanyCapitatedContractEndpoint(companyId, contractId) {
  return `${adminCompanyCapitatedContractsEndpoint(companyId)}/${contractId}`
}

export function adminCompanyCapitatedBatchesEndpoint(companyId) {
  return `/api/v1/admin/companies/${companyId}/capitated/batches`
}

export function adminCompanyCapitatedBatchesTemplateEndpoint(companyId) {
  return `${adminCompanyCapitatedBatchesEndpoint(companyId)}/template`
}

export function adminCompanyCapitatedBatchesUploadEndpoint(companyId) {
  return `${adminCompanyCapitatedBatchesEndpoint(companyId)}/upload`
}

export function adminCompanyCapitatedBatchEndpoint(companyId, batchId) {
  return `${adminCompanyCapitatedBatchesEndpoint(companyId)}/${batchId}`
}

export function adminCompanyCapitatedBatchItemsEndpoint(companyId, batchId) {
  return `${adminCompanyCapitatedBatchEndpoint(companyId, batchId)}/items`
}

export function adminCompanyCapitatedBatchMonthlyRecordsEndpoint(companyId, batchId) {
  return `${adminCompanyCapitatedBatchEndpoint(companyId, batchId)}/monthly-records`
}

export function adminCompanyCapitatedBatchRollbackEndpoint(companyId, batchId) {
  return `${adminCompanyCapitatedBatchEndpoint(companyId, batchId)}/rollback`
}

export function adminCompanyCapitatedBatchMonthlyRecordRollbackEndpoint(companyId, batchId, recordId) {
  return `${adminCompanyCapitatedBatchMonthlyRecordsEndpoint(companyId, batchId)}/${recordId}/rollback`
}
