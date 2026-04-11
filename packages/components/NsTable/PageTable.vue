<template>
  <div class="page-table">
    <div v-if="showHeaderToolbar" class="page-table__header">
      <slot-renderer :renderer="slotRenderers['header-left']" :scope="{ tableData }" />
      <div class="page-table__actions">
        <slot-renderer :renderer="slotRenderers['header-actions']" :scope="{ tableData }" />
        <el-button v-if="showAddButton && !slotRenderers['header-actions']" type="primary" size="small" @click="handleAdd">
          {{ addButtonText }}
        </el-button>
      </div>
    </div>

    <div class="page-table__main">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        :border="border"
        :stripe="stripe"
        :height="resolvedHeight"
        :max-height="resolvedMaxHeight"
        :row-key="rowKey"
        :default-expand-all="defaultExpandAll"
        :highlight-current-row="highlightCurrentRow"
        :class="['page-table__table', { 'page-table__table--no-border': !border }]"
        v-bind="mergedAttrs"
        v-on="mergedListeners"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <el-table-column v-if="showSelection" type="selection" width="55" :reserve-selection="!!rowKey" />
        <el-table-column v-if="showIndex" type="index" label="序号" width="60" :index="getIndex" />

        <table-column
          v-for="(column, index) in columns"
          :key="column.prop || column.label || index"
          :column="column"
          :slot-renderers="slotRenderers"
          @link-click="handleLinkClick"
        />
        <template slot="empty">
          <slot-renderer v-if="slotRenderers.empty" :renderer="slotRenderers.empty" :scope="{ tableData }" />
          <div v-else class="page-table__empty">暂无数据</div>
        </template>
      </el-table>
    </div>

    <div v-if="showPagination" class="page-table__pagination">
      <el-pagination
        background
        :current-page="currentPageModel"
        :page-size="pageSizeModel"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import SlotRenderer from '../_shared/SlotRenderer'
import TableColumn from './TableColumn'
import { createPagination } from './Pagination'

const RESERVED_LISTENERS = ['add', 'selection-change', 'sort-change', 'row-click', 'size-change', 'current-change', 'link-click']

export default {
  name: 'NsTable',
  components: {
    SlotRenderer,
    TableColumn,
  },
  inheritAttrs: false,
  props: {
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
    showAddButton: {
      type: Boolean,
      default: true,
    },
    addButtonText: {
      type: String,
      default: '新增',
    },
    showHeaderToolbar: {
      type: Boolean,
      default: true,
    },
    showSelection: {
      type: Boolean,
      default: false,
    },
    showIndex: {
      type: Boolean,
      default: false,
    },
    border: {
      type: Boolean,
      default: true,
    },
    stripe: {
      type: Boolean,
      default: false,
    },
    height: {
      type: [String, Number],
      default: undefined,
    },
    maxHeight: {
      type: [String, Number],
      default: undefined,
    },
    autoHeight: {
      type: Boolean,
      default: true,
    },
    rowKey: {
      type: [String, Function],
      default: undefined,
    },
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    highlightCurrentRow: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    showPagination: {
      type: Boolean,
      default: true,
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
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100],
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper',
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
    slotRenderers: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      internalPagination: createPagination(),
    }
  },
  computed: {
    currentPageModel() {
      return this.currentPage === null ? this.internalPagination.currentPage : this.currentPage
    },
    pageSizeModel() {
      return this.pageSize === null ? this.internalPagination.pageSize : this.pageSize
    },
    mergedAttrs() {
      return this.$attrs || {}
    },
    mergedListeners() {
      const listeners = { ...(this.$listeners || {}) }
      RESERVED_LISTENERS.forEach((name) => delete listeners[name])
      return listeners
    },
    resolvedHeight() {
      if (this.height !== undefined) {
        return this.height
      }
      if (this.autoHeight && this.maxHeight === undefined) {
        return '100%'
      }
      return undefined
    },
    resolvedMaxHeight() {
      if (this.maxHeight !== undefined) {
        return this.maxHeight
      }
      return undefined
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
  },
  methods: {
    handleAdd() {
      this.$emit('add')
    },
    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },
    handleSortChange(sort) {
      this.$emit('sort-change', sort)
    },
    handleRowClick(row, column, event) {
      this.$emit('row-click', row, column, event)
    },
    handleSizeChange(size) {
      this.internalPagination.pageSize = size
      this.$emit('update:pageSize', size)
      this.$emit('size-change', size)
    },
    handleCurrentChange(page) {
      this.internalPagination.currentPage = page
      this.$emit('update:currentPage', page)
      this.$emit('current-change', page)
    },
    handleLinkClick(row, column) {
      this.$emit('link-click', row, column)
    },
    getIndex(index) {
      if (!this.showPagination) {
        return index + 1
      }
      const currentPage = Number(this.currentPageModel || 1)
      const pageSize = Number(this.pageSizeModel || 10)
      return (currentPage - 1) * pageSize + index + 1
    },

    getSelectionRows() {
      return this.$refs.tableRef && this.$refs.tableRef.selection ? this.$refs.tableRef.selection : []
    },
    getSelectionKeys() {
      const rows = this.getSelectionRows()
      if (!this.rowKey) {
        return rows
      }
      return rows.map((row) => (typeof this.rowKey === 'function' ? this.rowKey(row) : row[this.rowKey]))
    },
    setSelectionRows(rows) {
      if (!this.$refs.tableRef) return
      this.$refs.tableRef.clearSelection()
      ;(rows || []).forEach((row) => {
        this.$refs.tableRef.toggleRowSelection(row, true)
      })
    },
    setSelectionKeys(keys) {
      if (!this.$refs.tableRef || !this.rowKey) return
      this.$refs.tableRef.clearSelection()
      ;(keys || []).forEach((key) => {
        const row = (this.tableData || []).find((item) => (typeof this.rowKey === 'function' ? this.rowKey(item) : item[this.rowKey]) === key)
        if (row) {
          this.$refs.tableRef.toggleRowSelection(row, true)
        }
      })
    },
    isRowSelected(row) {
      return this.getSelectionRows().includes(row)
    },
    isKeySelected(key) {
      return this.getSelectionKeys().includes(key)
    },
    clearSelection() {
      if (this.$refs.tableRef) {
        this.$refs.tableRef.clearSelection()
      }
    },
    toggleRowSelection(row, selected) {
      if (this.$refs.tableRef) {
        this.$refs.tableRef.toggleRowSelection(row, selected)
      }
    },
    toggleAllSelection() {
      if (this.$refs.tableRef) {
        this.$refs.tableRef.toggleAllSelection()
      }
    },
    selectAll() {
      this.toggleAllSelection()
    },
    clearAllSelection() {
      this.clearSelection()
    },
    clearSort() {
      this.$refs.tableRef && this.$refs.tableRef.clearSort && this.$refs.tableRef.clearSort()
    },
    clearFilter(columnKey) {
      this.$refs.tableRef && this.$refs.tableRef.clearFilter && this.$refs.tableRef.clearFilter(columnKey)
    },
    doLayout() {
      this.$refs.tableRef && this.$refs.tableRef.doLayout && this.$refs.tableRef.doLayout()
    },
    sort(prop, order) {
      this.$refs.tableRef && this.$refs.tableRef.sort && this.$refs.tableRef.sort(prop, order)
    },
    resetPage() {
      this.internalPagination.currentPage = 1
      this.$emit('update:currentPage', 1)
    },
    setPage(page) {
      this.internalPagination.currentPage = page
      this.$emit('update:currentPage', page)
    },
    setPageSize(size) {
      this.internalPagination.pageSize = size
      this.$emit('update:pageSize', size)
    },
    getPagination() {
      return {
        [this.pageTotalKey]: this.total,
        [this.pageNumberKey]: this.currentPageModel,
        [this.pageSizeKey]: this.pageSizeModel,
      }
    },
    setPagination(pagination) {
      if (pagination.currentPage !== undefined) {
        this.setPage(pagination.currentPage)
      }
      if (pagination.pageSize !== undefined) {
        this.setPageSize(pagination.pageSize)
      }
    },
  },
}
</script>

<style scoped>
.page-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.page-table__main {
  flex: 1;
  min-height: 0;
}

.page-table__table {
  width: 100%;
}

.page-table__table--no-border /deep/ .el-table::after,
.page-table__table--no-border /deep/ .el-table--border::after {
  width: 0;
}

.page-table__table--no-border /deep/ .el-table__header-wrapper th,
.page-table__table--no-border /deep/ .el-table__body-wrapper td {
  border-right: 0;
}

.page-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page-table__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.page-table__empty {
  padding: 24px 0;
  color: #909399;
  text-align: center;
}
</style>
