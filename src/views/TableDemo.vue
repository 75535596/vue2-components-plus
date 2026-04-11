<template>
  <div class="table-demo">
    <el-card shadow="never" class="table-demo__feature-card">
      <template v-slot:header>属性能力开关（便于外部项目逐项对照）</template>
      <div class="table-demo__feature-grid">
        <div class="table-demo__feature-item">
          <span>showSearch</span>
          <el-switch v-model="featureState.showSearch" />
        </div>
        <div class="table-demo__feature-item">
          <span>searchProps.showCollapse</span>
          <el-switch v-model="featureState.showSearchCollapse" />
        </div>
        <div class="table-demo__feature-item">
          <span>showHeaderToolbar</span>
          <el-switch v-model="featureState.showHeaderToolbar" />
        </div>
        <div class="table-demo__feature-item">
          <span>showAddButton</span>
          <el-switch v-model="featureState.showAddButton" />
        </div>
        <div class="table-demo__feature-item">
          <span>useHeaderActionsSlot</span>
          <el-switch v-model="featureState.useHeaderActionsSlot" />
        </div>
        <div class="table-demo__feature-item">
          <span>afterResetSlot</span>
          <el-switch v-model="featureState.useAfterResetActionsSlot" />
        </div>
        <div class="table-demo__feature-item">
          <span>showSelection</span>
          <el-switch v-model="featureState.showSelection" />
        </div>
        <div class="table-demo__feature-item">
          <span>showIndex</span>
          <el-switch v-model="featureState.showIndex" />
        </div>
        <div class="table-demo__feature-item">
          <span>showPagination</span>
          <el-switch v-model="featureState.showPagination" />
        </div>
        <div class="table-demo__feature-item">
          <span>border</span>
          <el-switch v-model="featureState.border" />
        </div>
        <div class="table-demo__feature-item">
          <span>stripe</span>
          <el-switch v-model="featureState.stripe" />
        </div>
        <div class="table-demo__feature-item">
          <span>highlightCurrentRow</span>
          <el-switch v-model="featureState.highlightCurrentRow" />
        </div>
      </div>
    </el-card>

    <NsTableContainer
      ref="containerRef"
      class="table-demo__container"
      page-number-key="currentPage1"
      page-size-key="pageSize1"
      page-total-key="total1"
      :show-search="featureState.showSearch"
      :search-items="searchItems"
      :external-search-params="externalSearchParams"
      :search-props="mergedSearchProps"
      :table-data="tableData"
      :columns="columns"
      :action-buttons="actionButtons"
      :total="total"
      :current-page.sync="paginationState.currentPage"
      :page-size.sync="paginationState.pageSize"
      :table-props="mergedTableProps"
      :load-data="loadData"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @page-change="handlePageChange"
      @link-click="handleLinkClick"
    >
      <!-- 搜索项插槽示例：slot=item.slot -->
      <template v-slot:emailKeywordSlot="{ formData }">
        <el-input
          v-model="formData.emailKeyword"
          clearable
          placeholder="请输入邮箱关键字（自定义插槽）"
          @keyup.enter.native="triggerSearchByEnter"
        />
      </template>
      <template
        v-if="featureState.useAfterResetActionsSlot"
        v-slot:actions-after-reset="{ formData, handleSearch: doSearch }"
      >
        <el-button type="text" @click="applyEnabledQuickFilter(formData, doSearch)">仅看启用</el-button>
      </template>

      <!-- 表格顶部工具栏插槽：header-left / header-actions -->
      <template v-slot:header-left>
        <div class="table-demo__toolbar-left">
          <span>当前共 {{ total }} 条</span>
          <span>已选 {{ selectedKeys.length }} 条</span>
        </div>
      </template>
      <template v-if="featureState.useHeaderActionsSlot" v-slot:header-actions>
        <el-button size="small" @click="reloadWithMessage">刷新</el-button>
        <el-button size="small" @click="clearSortState">重置排序</el-button>
      </template>

      <!-- 表头插槽示例：column.headerSlot -->
      <template v-slot:usernameHeader>
        <span>
          <i class="el-icon-link" />
          用户名（link）
        </span>
      </template>

      <!-- 单元格插槽示例：column.slot -->
      <template v-slot:status="{ row }">
        <el-tag size="small" :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
      </template>
      <template v-slot:gender="{ row }">
        <el-tag size="small" :type="row.gender === 1 ? 'primary' : 'danger'">
          {{ row.gender === 1 ? '男' : '女' }}
        </el-tag>
      </template>
      <template v-slot:department="{ row }">
        <el-tag size="small" effect="plain">{{ getDepartmentText(row.department) }}</el-tag>
      </template>

      <!-- action 按钮插槽示例：button.slot -->
      <template v-slot:deleteAction="{ row }">
        <el-button type="text" style="color: #f56c6c" :disabled="row.status === 0" @click="handleDelete(row)">
          删除
        </el-button>
      </template>

      <!-- 空状态插槽示例：empty -->
      <template v-slot:empty>
        <div class="table-demo__empty-slot">
          <i class="el-icon-files" />
          <span>暂无匹配数据，请调整筛选条件</span>
        </div>
      </template>
    </NsTableContainer>

    <el-card shadow="never" class="table-demo__actions">
      <template v-slot:header>实例方法能力（通过 ref 调用）</template>
      <div class="table-demo__action-list">
        <el-button @click="getSelectedRows">获取选中行</el-button>
        <el-button @click="getSelectedKeys">获取选中 ID</el-button>
        <el-button @click="selectRows([3, 7])">选中 ID 3 / 7</el-button>
        <el-button @click="clearSelection">清空选择</el-button>
        <el-button @click="selectAll">全选当前页</el-button>
        <el-button @click="checkSelection">检查选择状态</el-button>
        <el-button @click="setSearchForm">回填搜索条件</el-button>
        <el-button @click="resetSearchForm">重置搜索表单</el-button>
      </div>
    </el-card>

    <!-- <el-card shadow="never" class="table-demo__events">
      <template v-slot:header>事件触发日志（search / reset / add / sort-change ...）</template>
      <div v-if="eventLogs.length" class="table-demo__event-list">
        <div v-for="(item, index) in eventLogs" :key="index" class="table-demo__event-item">
          <span class="table-demo__event-name">{{ item.name }}</span>
          <span class="table-demo__event-time">{{ item.time }}</span>
          <span class="table-demo__event-payload">{{ item.payload }}</span>
        </div>
      </div>
      <el-empty v-else :image-size="60" description="触发一次操作后将在此展示事件参数" />
    </el-card> -->
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import { departmentOptions, fetchDepartmentOptions, fetchStatusOptions, filterUsers, mockUsers } from './mockData'

function createSearchItems() {
  return [
    {
      prop: 'month',
      label: '归属月',
      span: 6,
      component: 'ElSelect',
      attrs: {
        placeholder: '请选择归属月',
        clearable: true,
      },
      children: Array.from({ length: 12 }, function (_, index) {
        return {
          label: index + 1 + '月',
          value: String(index + 1),
        }
      }),
    },
    {
      prop: 'username',
      label: '用户名',
      span: 6,
      component: 'ElInput',
      attrs: {
        placeholder: '请输入用户名',
        clearable: true,
      },
      events: {},
    },
    {
      prop: 'realName',
      label: '真实姓名',
      span: 6,
      component: 'ElInput',
      attrs: {
        placeholder: '请输入真实姓名',
        clearable: true,
      },
    },
    {
      prop: 'emailKeyword',
      label: '邮箱关键字',
      span: 6,
      type: 'slot',
      slot: 'emailKeywordSlot',
      formItemAttrs: {
        required: false,
      },
    },
    {
      prop: 'status',
      label: '状态',
      span: 6,
      component: 'ElSelect',
      attrs: {
        placeholder: '请选择状态',
        clearable: true,
      },
      children: [],
    },
    {
      prop: 'department',
      label: '部门',
      span: 6,
      component: 'ElSelect',
      attrs: {
        placeholder: '请选择部门',
        clearable: true,
        filterable: true,
      },
      children: [],
    },
    {
      prop: 'gender',
      label: '性别',
      span: 6,
      component: 'ElSelect',
      attrs: {
        placeholder: '请选择性别',
        clearable: true,
      },
      children: [
        { label: '全部', value: '' },
        { label: '男', value: 1 },
        { label: '女', value: 2 },
      ],
    },
    {
      prop: 'createTime',
      label: '创建时间',
      span: 6,
      component: 'ElDatePicker',
      attrs: {
        type: 'daterange',
        clearable: true,
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'yyyy-MM-dd',
      },
    },
    {
      prop: 'phone',
      label: '手机号',
      span: 6,
      component: 'ElInput',
      attrs: {
        placeholder: '请输入手机号',
        clearable: true,
      },
    },
    {
      prop: 'active',
      label: '是否激活',
      span: 6,
      component: 'ElSwitch',
      attrs: {
        activeText: '是',
        inactiveText: '否',
      },
      defaultValue: true,
    },
  ]
}

function createColumns(context) {
  return [
    {
      prop: 'id',
      label: 'ID',
      width: 70,
      sortable: true,
      fixed: 'left',
    },
    {
      prop: 'avatar',
      label: '头像(image)',
      width: 110,
      type: 'image',
      imageWidth: '34px',
      imageHeight: '34px',
    },
    {
      label: '基本信息',
      children: [
        {
          prop: 'username',
          label: '用户名',
          minWidth: 150,
          type: 'link',
          headerSlot: 'usernameHeader',
          linkText: '查看用户',
        },
        {
          prop: 'realName',
          label: '真实姓名',
          width: 120,
        },
        {
          prop: 'gender',
          label: '性别',
          width: 90,
          slot: 'gender',
        },
        {
          prop: 'level',
          label: '级别(enum)',
          width: 120,
          enum: [
            { label: '初级', value: 1 },
            { label: '中级', value: 2 },
            { label: '高级', value: 3 },
          ],
        },
      ],
    },
    {
      label: '组织信息',
      children: [
        {
          prop: 'department',
          label: '部门',
          width: 130,
          slot: 'department',
        },
        {
          prop: 'status',
          label: '状态(slot)',
          width: 110,
          slot: 'status',
        },
      ],
    },
    {
      label: '联系方式',
      children: [
        {
          prop: 'phone',
          label: '手机号',
          width: 140,
        },
        {
          prop: 'email',
          label: '邮箱',
          minWidth: 220,
        },
      ],
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180,
      sortable: true,
    },
    {
      type: 'action',
      label: '操作(action)',
      width: 300,
      fixed: 'right',
      buttons: [
        {
          label: '查看',
          type: 'text',
          icon: 'el-icon-view',
          handler: function (row) {
            context.handleView(row)
          },
        },
        {
          label: '编辑',
          type: 'text',
          icon: 'el-icon-edit',
          handler: function (row) {
            context.handleEdit(row)
          },
        },
        {
          label: '禁用',
          type: 'text',
          show: function (row) {
            return row.status === 1
          },
          disabled: function (row) {
            return row.id % 2 === 0
          },
          handler: function (row) {
            context.handleDisable(row)
          },
        },
        {
          label: '删除',
          type: 'text',
          icon: 'el-icon-delete',
          slot: 'deleteAction',
        },
      ],
    },
  ]
}

const containerRef = ref()
const loading = ref(false)
const total = ref(0)
const tableData = ref([])
const searchParams = ref({})
const sortState = ref({
  prop: '',
  order: '',
})
const selectedKeys = ref([])
const eventLogs = ref([])
const paginationMode = ref('backend')
const mockUserCount = mockUsers.length
const externalSearchParams = {
  source: 'vue2-demo',
  active: true,
}
const actionButtons = [{ label: '导出', key: 'export' }]
const searchItems = ref(createSearchItems())
const columns = ref([])
const paginationState = ref({
  currentPage: 1,
  pageSize: 10,
})
const featureState = ref({
  showSearch: true,
  showSearchCollapse: true,
  showHeaderToolbar: true,
  showAddButton: true,
  useHeaderActionsSlot: false,
  useAfterResetActionsSlot: false,
  showSelection: true,
  showIndex: true,
  showPagination: true,
  border: true,
  stripe: true,
  highlightCurrentRow: true,
})
const { proxy } = getCurrentInstance() || {}

const mergedSearchProps = computed(function () {
  return {
    labelWidth: '90px',
    size: 'small',
    defaultSpan: 6,
    showCollapse: featureState.value.showSearchCollapse,
    collapseLimit: 4,
  }
})

const mergedTableProps = computed(function () {
  return {
    showHeaderToolbar: featureState.value.showHeaderToolbar,
    showAddButton: featureState.value.showAddButton,
    addButtonText: '新增用户',
    showSelection: featureState.value.showSelection,
    showIndex: featureState.value.showIndex,
    loading: loading.value,
    rowKey: 'id',
    showPagination: featureState.value.showPagination,
    pageSizes: [5, 10, 20],
    paginationLayout: 'total, sizes, prev, pager, next, jumper',
    stripe: featureState.value.stripe,
    border: featureState.value.border,
    autoHeight: true,
    maxHeight: undefined,
    defaultExpandAll: false,
    highlightCurrentRow: featureState.value.highlightCurrentRow,
    tooltipEffect: 'dark',
  }
})

function createLogPayload(payload) {
  try {
    return JSON.stringify(payload)
  } catch (error) {
    return String(payload)
  }
}

function logEvent(name, payload) {
  const now = new Date()
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(function (value) {
    return String(value).padStart(2, '0')
  }).join(':')
  eventLogs.value.unshift({
    name,
    time,
    payload: createLogPayload(payload),
  })
  eventLogs.value = eventLogs.value.slice(0, 20)
}

function enrichRows(list) {
  return (list || []).map(function (item) {
    return {
      ...item,
      level: (item.id % 3) + 1,
    }
  })
}

function normalizeSearchParams(params) {
  const next = Object.assign({}, params)
  if (typeof next.emailKeyword === 'string') {
    next.emailKeyword = next.emailKeyword.trim()
  }
  if (typeof next.username === 'string') {
    next.username = next.username.trim()
  }
  return next
}

function applyExtraFilters(list) {
  if (!searchParams.value.emailKeyword) return list
  return list.filter(function (item) {
    return String(item.email || '').toLowerCase().indexOf(String(searchParams.value.emailKeyword).toLowerCase()) > -1
  })
}

function compareValue(a, b) {
  if (a === b) return 0
  if (a === undefined || a === null) return -1
  if (b === undefined || b === null) return 1
  const maybeDateA = new Date(a).getTime()
  const maybeDateB = new Date(b).getTime()
  if (!Number.isNaN(maybeDateA) && !Number.isNaN(maybeDateB)) {
    return maybeDateA - maybeDateB
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  return String(a).localeCompare(String(b))
}

function applySort(list) {
  if (!sortState.value.prop || !sortState.value.order) {
    return list
  }
  const direction = sortState.value.order === 'ascending' ? 1 : -1
  return (list || []).slice().sort(function (left, right) {
    return compareValue(left[sortState.value.prop], right[sortState.value.prop]) * direction
  })
}

function triggerSearchByEnter() {
  handleSearch(containerRef.value ? containerRef.value.getSearchFormData() : {})
}

function applyEnabledQuickFilter(formData, doSearch) {
  if (!formData) return
  formData.active = true
  if (typeof doSearch === 'function') {
    doSearch()
  }
}

function getStatusType(status) {
  return status === 1 ? 'success' : 'danger'
}

function getStatusText(status) {
  return status === 1 ? '启用' : '禁用'
}

function getDepartmentText(value) {
  const matched = departmentOptions.find(function (item) {
    return item.value === value
  })
  return matched ? matched.label : value
}

function getCurrentPagination() {
  return containerRef.value && containerRef.value.getPagination
    ? containerRef.value.getPagination()
    : { currentPage1: 1, pageSize1: paginationState.value.pageSize }
}

function paginateList(list, pagination) {
  const currentPage = Number(pagination.currentPage1 || 1)
  const pageSize = Number(pagination.pageSize1 || 10)
  const start = (currentPage - 1) * pageSize
  return (list || []).slice(start, start + pageSize)
}

function resetContainerPage() {
  paginationState.value.currentPage = 1
  if (containerRef.value && containerRef.value.internalPagination) {
    containerRef.value.internalPagination.currentPage = 1
  }
}

function handlePaginationModeChange() {
  if (containerRef.value) {
    containerRef.value.clearAllSelection()
  }
  selectedKeys.value = []
  resetContainerPage()
  logEvent('pagination-mode-change', paginationMode.value)
  loadData()
  proxy.$message.success('已切换为' + (paginationMode.value === 'frontend' ? '前端分页' : '后端分页'))
}

async function loadData() {
  loading.value = true
  try {
    await new Promise(function (resolve) {
      setTimeout(resolve, 250)
    })

    const pageConfig = {
      pageNumberKey: 'currentPage1',
      pageSizeKey: 'pageSize1',
    }

    const filtered = filterUsers(
      mockUsers,
      searchParams.value,
      { currentPage1: 1, pageSize1: mockUserCount || 10 },
      pageConfig,
    )
    const enrichedList = enrichRows(filtered.list)
    const extraFilteredList = applyExtraFilters(enrichedList)
    const sortedList = applySort(extraFilteredList)

    if (paginationMode.value === 'frontend') {
      const pagination = getCurrentPagination()
      tableData.value = paginateList(sortedList, pagination)
      total.value = sortedList.length
      return
    }

    const pagination = getCurrentPagination()
    tableData.value = paginateList(sortedList, pagination)
    total.value = sortedList.length
  } catch (error) {
    proxy.$message.error('加载表格数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch(params) {
  const normalized = normalizeSearchParams(params)
  searchParams.value = normalized
  logEvent('search', normalized)
  loadData()
}

function handleReset() {
  logEvent('reset', searchParams.value)
  proxy.$message.info('搜索条件已重置')
}

function handleSelectionChange(selection) {
  const keys = (selection || []).map(function (item) {
    return item.id
  })
  selectedKeys.value = keys
  logEvent('selection-change', keys)
}

function handleSortChange(sort) {
  sortState.value = sort || { prop: '', order: '' }
  logEvent('sort-change', sortState.value)
  loadData()
}

function handleRowClick(row, column) {
  logEvent('row-click', {
    id: row.id,
    column: column && column.property,
  })
}

function handleSizeChange(size) {
  logEvent('size-change', size)
}

function handleCurrentChange(page) {
  logEvent('current-change', page)
}

function handlePageChange(payload) {
  logEvent('page-change', payload)
}

function handleLinkClick(row, column) {
  logEvent('link-click', {
    id: row.id,
    prop: column && column.prop,
  })
  proxy.$message.info('点击了链接列：' + row.username)
}

function getSelectedRows() {
  const rows = containerRef.value ? containerRef.value.getSelectionRows() : []
  proxy.$alert(JSON.stringify(rows, null, 2), '当前选中行', {
    confirmButtonText: '知道了',
  })
}

function getSelectedKeys() {
  const keys = containerRef.value ? containerRef.value.getSelectionKeys() : []
  proxy.$message.success('当前选中 ID：' + (keys.length ? keys.join(', ') : '无'))
}

function selectRows(ids) {
  if (!containerRef.value) return
  containerRef.value.setSelectionKeys(ids)
  proxy.$message.success('已尝试选中 ID：' + ids.join(', '))
}

function clearSelection() {
  if (!containerRef.value) return
  containerRef.value.clearAllSelection()
  selectedKeys.value = []
  proxy.$message.success('已清空选中状态')
}

function selectAll() {
  if (!containerRef.value) return
  containerRef.value.selectAll()
  proxy.$message.success('已全选当前页')
}

function checkSelection() {
  if (!containerRef.value || !tableData.value.length) return
  const firstSelected = containerRef.value.isRowSelected(tableData.value[0])
  const keySelected = containerRef.value.isKeySelected(3)
  proxy.$message.info('第一行选中：' + (firstSelected ? '是' : '否') + '；ID=3 选中：' + (keySelected ? '是' : '否'))
}

function setSearchForm() {
  if (!containerRef.value) return
  containerRef.value.setSearchFormData({
    username: 'zhang',
    status: 1,
    emailKeyword: 'example',
  })
  proxy.$message.success('已回填搜索条件，可点击“查询”查看效果')
}

function resetSearchForm() {
  if (!containerRef.value) return
  containerRef.value.resetSearchForm()
  proxy.$message.success('已重置搜索表单')
}

function reloadWithMessage() {
  loadData()
  proxy.$message.success('已刷新数据')
}

function clearSortState() {
  sortState.value = {
    prop: '',
    order: '',
  }
  loadData()
  proxy.$message.success('已重置排序')
}

function handleAdd() {
  logEvent('add', { source: 'toolbar-add-button' })
  proxy.$message.success('点击了新增按钮')
}

function handleView(row) {
  proxy.$message.info('查看：' + row.username)
}

function handleEdit(row) {
  proxy.$message.success('编辑：' + row.username)
}

function handleDisable(row) {
  proxy.$message.warning('已模拟禁用：' + row.username)
}

function handleDelete(row) {
  if (row.status === 0) {
    proxy.$message.warning('禁用状态用户不可删除')
    return
  }
  proxy.$confirm('确认删除用户“' + row.username + '”吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      proxy.$message.success('已模拟删除：' + row.username)
      loadData()
    })
    .catch(function () {})
}

watch(
  () => featureState.value.showSelection,
  function (value) {
    if (!value) {
      clearSelection()
    }
  },
)

columns.value = createColumns({
  handleView,
  handleEdit,
  handleDisable,
  handleDelete,
})
searchItems.value[1].events.keyup = function (event) {
  if (event && event.key === 'Enter') {
    triggerSearchByEnter()
  }
}

onMounted(async () => {
  const statusOptions = await fetchStatusOptions()
  const departmentList = await fetchDepartmentOptions()
  searchItems.value[4].children = statusOptions
  searchItems.value[5].children = departmentList
  await nextTick()
  if (containerRef.value) {
    containerRef.value.initSearchAndLoad()
  }
})
</script>

<style scoped>
.table-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.table-demo__container {
  flex: 1;
  min-height: 420px;
}

.table-demo__mode-card,
.table-demo__feature-card,
.table-demo__actions,
.table-demo__events {
  border-radius: 12px;
}

.table-demo__mode-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.table-demo__mode-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-demo__mode-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}

.table-demo__feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px 18px;
}

.table-demo__feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 8px;
}

.table-demo__toolbar-left {
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 13px;
}

.table-demo__empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  padding: 18px 0;
}

.table-demo__action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.table-demo__event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-demo__event-item {
  display: grid;
  grid-template-columns: 170px 90px 1fr;
  gap: 12px;
  align-items: start;
  padding: 8px 10px;
  border-radius: 6px;
  background: #fafafa;
  font-size: 12px;
}

.table-demo__event-name {
  color: #409eff;
  font-weight: 600;
}

.table-demo__event-time {
  color: #909399;
}

.table-demo__event-payload {
  color: #606266;
  word-break: break-all;
}
</style>
