<template>
  <div class="table-demo">
    <el-card shadow="never" class="table-demo__feature-card">
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
          <span>enterTrigger</span>
          <el-switch v-model="featureState.enterTrigger" />
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
        <div class="table-demo__feature-item table-demo__feature-item--inline">
          <span>searchProps.actionsAlign</span>
          <el-radio-group v-model="featureState.searchActionsAlign" size="mini">
            <el-radio-button label="left">left</el-radio-button>
            <el-radio-button label="center">center</el-radio-button>
            <el-radio-button label="right">right</el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-demo__feature-item table-demo__feature-item--full">
          <div class="table-demo__feature-field">
            <span>searchProps.actionsSpan</span>
            <el-input
              v-length.number="2"
              v-model="featureState.searchActionsSpan"
              clearable
              size="mini"
              placeholder="1-24"
            />
          </div>
          <div class="table-demo__feature-field">
            <span>searchProps.actionsWidth</span>
            <el-input
              v-model="featureState.searchActionsWidth"
              size="mini"
              clearable
              placeholder="如 320px / 30%"
            />
          </div>
        </div>
        <!-- <div class="table-demo__feature-item table-demo__feature-item--full">
          <div class="table-demo__feature-field">
            <span>searchProps.collapseToggleText[0]</span>
            <el-input
              v-model="featureState.searchCollapseExpandText"
              size="mini"
              clearable
              placeholder="展开文案"
            />
          </div>
          <div class="table-demo__feature-field">
            <span>searchProps.collapseToggleText[1]</span>
            <el-input
              v-model="featureState.searchCollapseFoldText"
              size="mini"
              clearable
              placeholder="收起文案"
            />
          </div>
        </div> -->
      </div>
    </el-card>

    <NsTableContainer
      ref="containerRef"
      class="table-demo__container"
      page-number-key="currentPage1"
      page-size-key="pageSize1"
      page-total-key="total1"
      :show-search="featureState.showSearch"
      :enter-trigger="featureState.enterTrigger"
      :search-items="searchItems"
      :external-search-params="externalSearchParams"
      :search-props="mergedSearchProps"
      :table-data="tableData"
      :columns="columns"
      :action-buttons="actionButtons"
      :total="total"
      :table-props="mergedTableProps"
      @search="loadData"
      @reset="handleReset"
      @add="handleAdd"
      @selection-change="handleSelectionChange"
      @link-click="handleLinkClick"
    >
      <!-- 容器扩展插槽示例：extend（位于搜索区与表格之间） -->
      <template v-slot:extend>
        <div class="table-demo__extend">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="这里是 NsTableContainer 的 extend 插槽，可用于放置额外筛选信息或业务提示"
          />
        </div>
      </template>

      <!-- 搜索项插槽示例：slot=item.slot -->
      <template v-slot:emailKeywordSlot="{ formData }">
        <el-input
          v-model="formData.body"
          clearable
          placeholder="请输入正文关键字（自定义插槽）"
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
          标题（link）
        </span>
      </template>

      <!-- action 按钮插槽示例：button.slot -->
      <template v-slot:deleteAction="{ row }">
        <el-button type="text" style="color: #f56c6c" @click="handleDelete(row)">
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
        <el-button type="primary" @click="showSearchParams">获取请求参数</el-button>
        <el-button type="success" @click="refreshTable">刷新</el-button>
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

const POSTS_API = 'https://jsonplaceholder.typicode.com/posts'

function createSearchItems() {
  return [
    {
      prop: 'id',
      label: '帖子 ID',
      span: 6,
      component: 'ElInputNumber',
      attrs: {
        placeholder: '精确匹配（?id=）',
        controlsPosition: 'right',
        min: 1,
        max: 100,
      },
    },
    {
      prop: 'userId',
      label: '用户 ID',
      span: 6,
      component: 'ElSelect',
      attrs: {
        placeholder: '精确匹配（?userId=）',
        clearable: true,
      },
      children: Array.from({ length: 10 }, function (_, index) {
        return {
          label: '用户 ' + (index + 1),
          value: index + 1,
        }
      }),
      events: {},
    },
    {
      prop: 'q',
      label: '关键字',
      span: 6,
      component: 'ElInput',
      attrs: {
        placeholder: '在 title / body 中模糊匹配（?q=）',
        clearable: true,
      },
    },
    {
      prop: 'body',
      label: '正文关键字',
      span: 6,
      type: 'slot',
      slot: 'emailKeywordSlot',
      formItemAttrs: {
        required: false,
      },
    },
  ]
}

function createColumns(context) {
  return [
    {
      prop: 'id',
      label: 'ID',
      width: 80,
      sortable: 'custom',
      fixed: 'left',
      align: 'center',
    },
    {
      prop: 'userId',
      label: '用户 ID',
      width: 100,
      sortable: 'custom',
      align: 'center',
    },
    {
      prop: 'title',
      label: '标题(link)',
      minWidth: 260,
      type: 'link',
      headerSlot: 'usernameHeader',
      linkText: function (row) {
        return row.title
      },
    },
    {
      prop: 'body',
      label: '正文',
      minWidth: 320,
      showOverflowTooltip: true,
    },
    {
      type: 'action',
      label: '操作(action)',
      width: 220,
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
const selectedKeys = ref([])
const eventLogs = ref([])
const externalSearchParams = {}
const actionButtons = [{ label: '导出', key: 'export' }]
const searchItems = ref(createSearchItems())
const columns = ref([])
const featureState = ref({
  showSearch: true,
  showSearchCollapse: true,
  searchActionsAlign: 'left',
  searchActionsSpan: 4,
  searchActionsWidth: '',
  searchCollapseExpandText: '展开',
  searchCollapseFoldText: '收起',
  showHeaderToolbar: true,
  showAddButton: true,
  useHeaderActionsSlot: false,
  useAfterResetActionsSlot: false,
  enterTrigger: true,
  showSelection: true,
  showIndex: true,
  showPagination: true,
  border: true,
  stripe: true,
  highlightCurrentRow: true,
})
const { proxy } = getCurrentInstance() || {}

const mergedSearchProps = computed(function () {
  const actionsSpanValue = Number(featureState.value.searchActionsSpan)
  return {
    labelWidth: '90px',
    size: 'small',
    defaultSpan: 6,
    actionsSpan: Number.isFinite(actionsSpanValue) && actionsSpanValue > 0 ? actionsSpanValue : undefined,
    actionsWidth: featureState.value.searchActionsWidth,
    collapseToggleText: [featureState.value.searchCollapseExpandText, featureState.value.searchCollapseFoldText],
    showCollapse: featureState.value.showSearchCollapse,
    collapseLimit: 3,
    actionsAlign: featureState.value.searchActionsAlign,
  }
})

const mergedTableProps = computed(function () {
  return {
    showHeaderToolbar: featureState.value.showHeaderToolbar,
    showAddButton: featureState.value.showAddButton,
    addButtonText: '新增用户',
    showSelection: featureState.value.showSelection,
    showIndex: featureState.value.showIndex,
    indexWidth: 72,
    indexAlign: 'center',
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

function triggerSearchByEnter() {
  if (containerRef.value && containerRef.value.reload) {
    containerRef.value.reload()
  }
}

function applyEnabledQuickFilter(formData, doSearch) {
  if (!formData) return
  formData.userId = 1
  if (typeof doSearch === 'function') {
    doSearch()
  }
}

function buildQuery(params) {
  const usp = new URLSearchParams()
  Object.keys(params).forEach(function (key) {
    const value = params[key]
    if (value === undefined || value === null || value === '') return
    usp.append(key, String(value))
  })
  return usp.toString()
}

async function fetchPosts(query) {
  const params = query || {}
  const requestParams = {
    _page: params.currentPage1 || 1,
    _limit: params.pageSize1 || 10,
  }
  const keyword = String(params.q || '').trim()
  if (keyword) requestParams.q = keyword
  if (params.id) requestParams.id = params.id
  if (params.userId) requestParams.userId = params.userId
  const body = String(params.body || '').trim()
  if (body) requestParams.body_like = body
  const sort = params.sort || {}
  if (sort.prop && sort.order) {
    requestParams._sort = sort.prop
    requestParams._order = sort.order === 'ascending' ? 'asc' : 'desc'
  }

  const response = await fetch(POSTS_API + '?' + buildQuery(requestParams), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error('HTTP ' + response.status)
  }
  const list = await response.json()
  const totalHeader = Number(response.headers.get('x-total-count')) || (Array.isArray(list) ? list.length : 0)
  return { list: Array.isArray(list) ? list : [], total: totalHeader }
}

async function loadData(query) {
  loading.value = true
  try {
    logEvent('search', query)
    const result = await fetchPosts(query)
    let list = result.list
    if (query && query.body) {
      const keyword = String(query.body).trim().toLowerCase()
      if (keyword) {
        list = list.filter(function (item) {
          return String(item.body || '').toLowerCase().indexOf(keyword) !== -1
        })
      }
    }
    tableData.value = list
    total.value = result.total
  } catch (error) {
    if (proxy && proxy.$message) {
      proxy.$message.error('加载表格数据失败：' + (error && error.message ? error.message : ''))
    }
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleReset() {
  logEvent('reset', {})
  proxy.$message.info('搜索条件已重置')
}

function handleSelectionChange(selection) {
  const keys = (selection || []).map(function (item) {
    return item.id
  })
  selectedKeys.value = keys
  logEvent('selection-change', keys)
}

function handleLinkClick(row, column) {
  logEvent('link-click', {
    id: row.id,
    prop: column && column.prop,
  })
  proxy.$message.info('点击了标题链接：#' + row.id)
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
    userId: 1,
    q: 'qui',
    body: 'rerum',
  })
  proxy.$message.success('已回填搜索条件，可点击“查询”查看效果')
}

function resetSearchForm() {
  if (!containerRef.value) return
  containerRef.value.resetSearchForm()
  proxy.$message.success('已重置搜索表单')
}

function showSearchParams() {
  if (!containerRef.value || !containerRef.value.getSearchParams) return
  const params = containerRef.value.getSearchParams()
  proxy.$alert(JSON.stringify(params, null, 2), '当前请求参数（getSearchParams）', {
    confirmButtonText: '知道了',
  })
}

function refreshTable() {
  if (!containerRef.value || !containerRef.value.refresh) return
  containerRef.value.refresh()
  proxy.$message.success('已触发刷新')
}

function reloadWithMessage() {
  if (containerRef.value && containerRef.value.reload) {
    containerRef.value.reload()
  }
  proxy.$message.success('已刷新数据')
}

function clearSortState() {
  if (containerRef.value && containerRef.value.$refs && containerRef.value.$refs.tableRef && containerRef.value.$refs.tableRef.clearSort) {
    containerRef.value.$refs.tableRef.clearSort()
  }
  if (containerRef.value && containerRef.value.reload) {
    containerRef.value.reload()
  }
  proxy.$message.success('已重置排序')
}

function handleAdd() {
  logEvent('add', { source: 'toolbar-add-button' })
  proxy.$message.success('点击了新增按钮')
}

function handleView(row) {
  proxy.$message.info('查看：#' + row.id + ' ' + row.title)
}

function handleEdit(row) {
  proxy.$message.success('编辑：#' + row.id + ' ' + row.title)
}

function handleDelete(row) {
  proxy.$confirm('确认删除帖子“' + row.title + '”吗？', '提示', {
    type: 'warning',
  })
    .then(() => {
      proxy.$message.success('已模拟删除：#' + row.id)
      if (containerRef.value && containerRef.value.reload) {
        containerRef.value.reload()
      }
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
  handleDelete,
})
searchItems.value[1].events.keyup = function (event) {
  if (event && event.key === 'Enter') {
    triggerSearchByEnter()
  }
}

onMounted(async () => {
  await nextTick()
  if (containerRef.value && containerRef.value.initSearchAndLoad) {
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

.table-demo__feature-item--inline {
  white-space: nowrap;
}

.table-demo__feature-item--full {
  grid-column: 1 / -1;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.table-demo__feature-field {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.table-demo__feature-field /deep/ .el-input {
  width: 180px;
}

.table-demo__toolbar-left {
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 13px;
}

.table-demo__extend {
  margin-bottom: 12px;
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
