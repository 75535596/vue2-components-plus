const DEFAULT_PAGINATION = {
  total: 0,
  currentPage: 1,
  pageSize: 10,
}

const DEFAULT_KEY_CONFIG = {
  totalKey: 'total',
  currentPageKey: 'currentPage',
  pageSizeKey: 'pageSize',
}

export function createPagination(customParams = {}) {
  return {
    ...DEFAULT_PAGINATION,
    ...customParams,
  }
}

export function createPaginationWithCustomKeys(pagination, keyConfig = {}) {
  const config = {
    ...DEFAULT_KEY_CONFIG,
    ...keyConfig,
  }
  return {
    [config.totalKey]: pagination.total,
    [config.currentPageKey]: pagination.currentPage,
    [config.pageSizeKey]: pagination.pageSize,
  }
}

export function resetPagination(pagination) {
  pagination.total = 0
  pagination.currentPage = 1
  pagination.pageSize = 10
  return pagination
}

export default function Pagination(customParams = {}) {
  return createPagination(customParams)
}
