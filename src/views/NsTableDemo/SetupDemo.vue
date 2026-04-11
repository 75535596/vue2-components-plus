<template>
  <div class="table-demo">
    <el-card shadow="never" class="table-demo__mode-card">
      <div class="table-demo__mode-header">
        <div>
          <div class="table-demo__mode-title">分页模式演示（&lt;script setup&gt; 版）</div>
          <div class="table-demo__mode-desc">
            {{ paginationMode === 'frontend' ? '一次加载全部筛选结果，再在本地完成翻页。' : '每次切页都会按当前页码重新请求模拟数据。' }}
          </div>
        </div>
        <el-radio-group v-model="paginationMode" size="small" @change="handlePaginationModeChange">
          <el-radio-button label="backend">后端分页</el-radio-button>
          <el-radio-button label="frontend">前端分页</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <NsTableContainer
      ref="containerRef"
      class="table-demo__container"
      page-number-key="currentPage1"
      page-size-key="pageSize1"
      page-total-key="total1"
      :search-items="searchItems"
      :external-search-params="externalSearchParams"
      :search-props="searchProps"
      :table-data="tableData"
      :columns="columns"
      :total="total"
      :table-props="mergedTableProps"
      :load-data="loadData"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @selection-change="handleSelectionChange"
    >
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

      <template v-slot:delete-action="{ row }">
        <el-button
          type="text"
          style="color: #f56c6c"
          :disabled="row.status === 0"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </NsTableContainer>

    <el-card shadow="never" class="table-demo__actions">
      <template v-slot:header>选择能力演示</template>
      <div class="table-demo__action-list">
        <el-button @click="getSelectedRows">获取选中行</el-button>
        <el-button @click="getSelectedKeys">获取选中 ID</el-button>
        <el-button @click="selectRows([3,7])">选中 ID 为 3 / 7 的行</el-button>
        <el-button @click="clearSelection">清空选择</el-button>
        <el-button @click="selectAll">全选当前页</el-button>
        <el-button @click="checkSelection">检查选择状态</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, ref } from 'vue'
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
      sortable: true,
    },
    {
      label: '基本信息',
      children: [
        {
          prop: 'username',
          label: '用户名',
          width: 130,
          formatter: function (row, _column, cellValue) {
            return cellValue ? '@' + cellValue : '-'
          },
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
      ],
    },
    {
      label: '组织信息',
      children: [
        {
          prop: 'department',
          label: '部门',
          width: 120,
          slot: 'department',
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
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
      label: '操作',
      width: 260,
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
          slot: 'delete-action',
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
const paginationMode = ref('backend')
const mockUserCount = mockUsers.length
const externalSearchParams = { source: 'vue2-demo' }
const searchProps = { labelWidth: '90px' }
const searchItems = ref(createSearchItems())
const columns = ref([])
const { proxy } = getCurrentInstance() || {}

const mergedTableProps = ref({
  showSelection: true,
  showIndex: true,
  loading: loading.value,
  rowKey: 'id',
  showPagination: true,
  pageSizes: [5, 10, 20],
  stripe: true,
  border: true
})

function handleKeywordEnter(event) {
  if (event && event.key === 'Enter') {
    handleSearch(containerRef.value ? containerRef.value.getSearchFormData() : {})
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
    : { currentPage1: 1, pageSize1: 10 }
}

function paginateList(list, pagination) {
  const currentPage = Number(pagination.currentPage1 || 1)
  const pageSize = Number(pagination.pageSize1 || 10)
  const start = (currentPage - 1) * pageSize
  return (list || []).slice(start, start + pageSize)
}

function resetContainerPage() {
  if (containerRef.value && containerRef.value.internalPagination) {
    containerRef.value.internalPagination.currentPage = 1
  }
}

function handlePaginationModeChange() {
  if (containerRef.value) {
    containerRef.value.clearAllSelection()
  }
  resetContainerPage()
  loadData()
  proxy.$message.success('已切换为' + (paginationMode.value === 'frontend' ? '前端分页' : '后端分页'))
}

async function loadData() {
  loading.value = true
  try {
    await new Promise(function (resolve) {
      setTimeout(resolve, 300)
    })
    const pagination = getCurrentPagination()
    const pageConfig = {
      pageNumberKey: 'currentPage1',
      pageSizeKey: 'pageSize1',
    }
    if (paginationMode.value === 'frontend') {
      const result = filterUsers(
        mockUsers,
        searchParams.value,
        { currentPage1: 1, pageSize1: mockUserCount || 10 },
        pageConfig,
      )
      tableData.value = paginateList(result.list, pagination)
      total.value = result.total
      return
    }
    const result = filterUsers(mockUsers, searchParams.value, pagination, pageConfig)
    tableData.value = result.list
    total.value = result.total
  } catch (error) {
    console.error(error)
    proxy.$message.error('加载表格数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch(params) {
  searchParams.value = Object.assign({}, params)
  loadData()
}

function handleReset() {
  proxy.$message.info('搜索条件已重置')
}

function handleSelectionChange(selection) {
  console.log('选中切换', selection)
  if (!selection) return
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

function handleAdd() {
  proxy.$message.success('点击了新增按钮')
}

function handleView(row) {
  proxy.$message.info('查看：' + row.username)
}

function handleEdit(row) {
  proxy.$message.success('编辑：' + row.username)
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

columns.value = createColumns({ handleView, handleEdit, handleDelete })
searchItems.value[1].events.keyup = handleKeywordEnter

onMounted(async () => {
  const statusOptions = await fetchStatusOptions()
  const departmentList = await fetchDepartmentOptions()
  searchItems.value[3].children = statusOptions
  searchItems.value[4].children = departmentList
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
  gap: 20px;
  height: 100%;
  min-height: 0;
}

.table-demo__container {
  flex: 1;
  min-height: 0;
}

.table-demo__mode-card,
.table-demo__actions {
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

.table-demo__mode-tip {
  margin-top: 6px;
  color: #606266;
}

.table-demo__mode-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}

.table-demo__action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
