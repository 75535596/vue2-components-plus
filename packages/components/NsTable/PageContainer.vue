<template>
  <div class="page-container">
    <page-search
      v-if="showSearch"
      ref="searchRef"
      :items="searchItems"
      :external-params="externalSearchParams"
      :slot-renderers="$scopedSlots"
      v-bind="searchProps"
      @search="handleSearch"
      @reset="handleReset"
    />

    <page-table
      ref="tableRef"
      :table-data="tableData"
      :columns="columns"
      :action-buttons="actionButtons"
      :total="total"
      :current-page="currentPageModel"
      :page-size="pageSizeModel"
      :page-number-key="pageNumberKey"
      :page-size-key="pageSizeKey"
      :page-total-key="pageTotalKey"
      :slot-renderers="$scopedSlots"
      v-bind="tableProps"
      @add="handleAdd"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @link-click="handleLinkClick"
    />
  </div>
</template>

<script>
import PageSearch from './PageSearch.vue'
import PageTable from './PageTable.vue'
import { createPagination } from './Pagination'

export default {
  name: 'NsTableContainer',
  components: {
    PageSearch,
    PageTable,
  },
  props: {
    showSearch: {
      type: Boolean,
      default: true,
    },
    externalSearchParams: {
      type: Object,
      default: () => ({}),
    },
    searchItems: {
      type: Array,
      default: () => [],
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    actionButtons: {
      type: Array,
      default: () => [],
    },
    total: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: null,
    },
    pageSize: {
      type: Number,
      default: null,
    },
    pageNumberKey: {
      type: String,
      default: 'currentPage',
    },
    pageSizeKey: {
      type: String,
      default: 'pageSize',
    },
    pageTotalKey: {
      type: String,
      default: 'total',
    },
    searchProps: {
      type: Object,
      default: () => ({}),
    },
    tableProps: {
      type: Object,
      default: () => ({}),
    },
    loadData: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      internalPagination: createPagination(),
      pendingSelectionKeys: new Set(),
      selectionRowMap: {},
      isSyncingSelection: false,
    }
  },

  computed: {
    currentPageModel() {
      return this.currentPage === null ? this.internalPagination.currentPage : this.currentPage
    },
    pageSizeModel() {
      return this.pageSize === null ? this.internalPagination.pageSize : this.pageSize
    },
    currentRowKey() {
      return this.tableProps && this.tableProps.rowKey
    },
  },
  watch: {
    currentPage: {
      handler(value) {
        if (value !== null) {
          this.internalPagination.currentPage = value
        }
      },
      immediate: true,
    },
    pageSize: {
      handler(value) {
        if (value !== null) {
          this.internalPagination.pageSize = value
        }
      },
      immediate: true,
    },
    tableData: {
      handler() {
        this.$nextTick(() => {
          this.syncSelectionToCurrentPage()
        })
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getRowKey(row) {
      if (!this.currentRowKey) return row
      return typeof this.currentRowKey === 'function' ? this.currentRowKey(row) : row[this.currentRowKey]
    },
    resetSelectionState() {
      this.pendingSelectionKeys = new Set()
      this.selectionRowMap = {}
      this.$refs.tableRef && this.$refs.tableRef.clearSelection && this.$refs.tableRef.clearSelection()
    },
    syncSelectionToCurrentPage() {
      if (!this.currentRowKey || !this.$refs.tableRef) {
        return
      }
      this.isSyncingSelection = true
      this.$refs.tableRef.clearSelection()
      ;(this.tableData || []).forEach((row) => {
        const key = this.getRowKey(row)
        if (this.pendingSelectionKeys.has(key)) {
          this.$set(this.selectionRowMap, key, row)
          this.$refs.tableRef.toggleRowSelection(row, true)
        }
      })
      this.$nextTick(() => {
        this.isSyncingSelection = false
      })
    },

    handleSearch(params) {
      this.resetSelectionState()
      if (params && params._resetPage) {
        const { _resetPage, ...searchParams } = params
        this.internalPagination.currentPage = 1
        this.$emit('update:currentPage', 1)
        this.$emit('search', searchParams)
        return
      }
      this.$emit('search', params)
    },
    handleReset() {
      this.resetSelectionState()
      this.$emit('reset')
    },
    handleAdd() {
      this.$emit('add')
    },
    handleSizeChange(size) {
      this.internalPagination.pageSize = size
      this.$emit('update:pageSize', size)
      this.$emit('size-change', size)
      this.$emit('page-change', {
        currentPage: this.currentPageModel,
        pageSize: size,
      })
      if (this.loadData) {
        this.loadData()
      }
    },
    handleCurrentChange(page) {
      this.internalPagination.currentPage = page
      this.$emit('update:currentPage', page)
      this.$emit('current-change', page)
      this.$emit('page-change', {
        currentPage: page,
        pageSize: this.pageSizeModel,
      })
      if (this.loadData) {
        this.loadData()
      }
    },
    handleSelectionChange(selection) {
      if (this.isSyncingSelection) {
        return
      }
      if (!this.currentRowKey) {
        this.$emit('selection-change', selection)
        return
      }
      const currentPageKeys = (this.tableData || []).map((row) => this.getRowKey(row))
      currentPageKeys.forEach((key) => {
        this.pendingSelectionKeys.delete(key)
        this.$delete(this.selectionRowMap, key)
      })
      ;(selection || []).forEach((row) => {
        const key = this.getRowKey(row)
        this.pendingSelectionKeys.add(key)
        this.$set(this.selectionRowMap, key, row)
      })
      this.$emit('selection-change', Object.values(this.selectionRowMap))
    },

    handleSortChange(sort) {
      this.$emit('sort-change', sort)
    },
    handleRowClick(row, column, event) {
      this.$emit('row-click', row, column, event)
    },
    handleLinkClick(row, column) {
      this.$emit('link-click', row, column)
    },
    initSearchAndLoad() {
      this.$nextTick(() => {
        if (this.showSearch && this.$refs.searchRef) {
          this.$emit('search', this.$refs.searchRef.getFormData())
          return
        }
        if (this.loadData) {
          this.loadData()
        }
      })
    },
    getSearchFormData() {
      return this.$refs.searchRef ? this.$refs.searchRef.getFormData() : {}
    },
    setSearchFormData(data) {
      this.$refs.searchRef && this.$refs.searchRef.setFormData(data)
    },
    resetSearchForm() {
      this.$refs.searchRef && this.$refs.searchRef.resetForm()
    },
    validateSearchForm() {
      return this.$refs.searchRef ? this.$refs.searchRef.validate() : Promise.resolve(true)
    },
    getPagination() {
      return {
        [this.pageTotalKey]: this.total,
        [this.pageNumberKey]: this.currentPageModel,
        [this.pageSizeKey]: this.pageSizeModel,
      }
    },
    getSelectionRows() {
      return this.currentRowKey ? Object.values(this.selectionRowMap) : this.$refs.tableRef?.getSelectionRows?.() || []
    },
    getSelectionKeys() {
      return this.currentRowKey ? Array.from(this.pendingSelectionKeys) : this.$refs.tableRef?.getSelectionKeys?.() || []
    },
    setSelectionRows(rows) {
      if (!this.currentRowKey) {
        this.$refs.tableRef && this.$refs.tableRef.setSelectionRows(rows)
        return
      }
      this.pendingSelectionKeys = new Set()
      this.selectionRowMap = {}
      ;(rows || []).forEach((row) => {
        const key = this.getRowKey(row)
        this.pendingSelectionKeys.add(key)
        this.$set(this.selectionRowMap, key, row)
      })
      this.syncSelectionToCurrentPage()
    },
    setSelectionKeys(keys) {
      if (!this.currentRowKey) {
        this.$refs.tableRef && this.$refs.tableRef.setSelectionKeys(keys)
        return
      }
      this.pendingSelectionKeys = new Set(keys || [])
      ;(this.tableData || []).forEach((row) => {
        const key = this.getRowKey(row)
        if (this.pendingSelectionKeys.has(key)) {
          this.$set(this.selectionRowMap, key, row)
        }
      })
      this.syncSelectionToCurrentPage()
    },
    clearAllSelection() {
      this.resetSelectionState()
    },
    selectAll() {
      if (!this.$refs.tableRef) return
      if (!this.currentRowKey) {
        this.$refs.tableRef.selectAll()
        return
      }
      ;(this.tableData || []).forEach((row) => {
        const key = this.getRowKey(row)
        this.pendingSelectionKeys.add(key)
        this.$set(this.selectionRowMap, key, row)
      })
      this.$refs.tableRef.setSelectionRows(this.tableData)
    },
    isRowSelected(row) {
      return this.currentRowKey ? this.pendingSelectionKeys.has(this.getRowKey(row)) : this.$refs.tableRef?.isRowSelected?.(row)
    },
    isKeySelected(key) {
      return this.currentRowKey ? this.pendingSelectionKeys.has(key) : this.$refs.tableRef?.isKeySelected?.(key)
    },
  },
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.page-container .page-table {
  flex: 1;
  min-height: 0;
}
</style>
