<template>
  <div class="table-demo">
    <el-card shadow="never" class="table-demo__mode-card">
      <div class="table-demo__mode-header">
        <div>
          <div class="table-demo__mode-title">分页模式演示</div>
          <div class="table-demo__mode-tip">
            当前共 {{ mockUserCount }} 条模拟数据，当前为{{ paginationMode === 'frontend' ? '前端分页' : '后端分页' }}模式。
          </div>
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

<script lang="ts">


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
          formatter: function (row, column, cellValue) {
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

export default {
  name: 'NsTableDemo',
  data() {
    return {
      loading: false,
      total: 0,
      tableData: [],
      searchParams: {},
      paginationMode: 'backend',
      mockUserCount: mockUsers.length,
      externalSearchParams: {
        source: 'vue2-demo',
      },
      searchProps: {
        labelWidth: '90px',
      },
      searchItems: createSearchItems(),
      columns: [],
    }
  },
  computed: {
    mergedTableProps() {
      return {
        showSelection: true,
        showIndex: true,
        loading: this.loading,
        rowKey: 'id',
        showPagination: true,
        pageSizes: [5, 10, 20],
        stripe: true,
      }
    },
  },
  created() {
    this.columns = createColumns(this)
    this.searchItems[1].events.keyup = this.handleKeywordEnter
  },
  async mounted() {
    const statusOptions = await fetchStatusOptions()
    const departmentList = await fetchDepartmentOptions()
    this.searchItems[3].children = statusOptions
    this.searchItems[4].children = departmentList
    this.$nextTick(() => {
      if (this.$refs.containerRef) {
        this.$refs.containerRef.initSearchAndLoad()
      }
    })
  },

  methods: {
    handleKeywordEnter(event) {
      if (event && event.key === 'Enter') {
        this.handleSearch(this.$refs.containerRef ? this.$refs.containerRef.getSearchFormData() : {})
      }
    },
    getStatusType(status) {
      return status === 1 ? 'success' : 'danger'
    },
    getStatusText(status) {
      return status === 1 ? '启用' : '禁用'
    },
    getDepartmentText(value) {
      const matched = departmentOptions.find(function (item) {
        return item.value === value
      })
      return matched ? matched.label : value
    },
    getCurrentPagination() {
      return this.$refs.containerRef && this.$refs.containerRef.getPagination
        ? this.$refs.containerRef.getPagination()
        : { currentPage1: 1, pageSize1: 10 }
    },
    paginateList(list, pagination) {
      const currentPage = Number(pagination.currentPage1 || 1)
      const pageSize = Number(pagination.pageSize1 || 10)
      const start = (currentPage - 1) * pageSize
      return (list || []).slice(start, start + pageSize)
    },
    resetContainerPage() {
      if (this.$refs.containerRef && this.$refs.containerRef.internalPagination) {
        this.$refs.containerRef.internalPagination.currentPage = 1
      }
    },
    handlePaginationModeChange() {
      if (this.$refs.containerRef) {
        this.$refs.containerRef.clearAllSelection()
      }
      this.resetContainerPage()
      this.loadData()
      this.$message.success('已切换为' + (this.paginationMode === 'frontend' ? '前端分页' : '后端分页'))
    },
    async loadData() {
      this.loading = true
      try {
        await new Promise(function (resolve) {
          setTimeout(resolve, 300)
        })
        const pagination = this.getCurrentPagination()
        const pageConfig = {
          pageNumberKey: 'currentPage1',
          pageSizeKey: 'pageSize1',
        }
        if (this.paginationMode === 'frontend') {
          const result = filterUsers(
            mockUsers,
            this.searchParams,
            { currentPage1: 1, pageSize1: this.mockUserCount || 10 },
            pageConfig,
          )
          this.tableData = this.paginateList(result.list, pagination)
          this.total = result.total
          return
        }
        const result = filterUsers(mockUsers, this.searchParams, pagination, pageConfig)
        this.tableData = result.list
        this.total = result.total
      } catch {
        this.$message.error('加载表格数据失败')
      } finally {

        this.loading = false
      }
    },
    handleSearch(params) {
      this.searchParams = Object.assign({}, params)
      this.loadData()
    },
    handleReset() {
      this.$message.info('搜索条件已重置')
    },
    handleSelectionChange(selection) {
      if (selection && selection.length) {
        this.$message.success('当前选中 ' + selection.length + ' 行')
      }
    },
    getSelectedRows() {
      const rows = this.$refs.containerRef ? this.$refs.containerRef.getSelectionRows() : []
      this.$alert(JSON.stringify(rows, null, 2), '当前选中行', {
        confirmButtonText: '知道了',
      })
    },
    getSelectedKeys() {
      const keys = this.$refs.containerRef ? this.$refs.containerRef.getSelectionKeys() : []
      this.$message.success('当前选中 ID：' + (keys.length ? keys.join(', ') : '无'))
    },
    selectRows(ids) {
      if (!this.$refs.containerRef) return
      this.$refs.containerRef.setSelectionKeys(ids)
      this.$message.success('已尝试选中 ID：' + ids.join(', '))
    },
    clearSelection() {
      if (!this.$refs.containerRef) return
      this.$refs.containerRef.clearAllSelection()
      this.$message.success('已清空选中状态')
    },
    selectAll() {
      if (!this.$refs.containerRef) return
      this.$refs.containerRef.selectAll()
      this.$message.success('已全选当前页')
    },
    checkSelection() {
      if (!this.$refs.containerRef || !this.tableData.length) return
      const firstSelected = this.$refs.containerRef.isRowSelected(this.tableData[0])
      const keySelected = this.$refs.containerRef.isKeySelected(3)
      this.$message.info('第一行选中：' + (firstSelected ? '是' : '否') + '；ID=3 选中：' + (keySelected ? '是' : '否'))
    },
    handleAdd() {
      this.$message.success('点击了新增按钮')
    },
    handleView(row) {
      this.$message.info('查看：' + row.username)
    },
    handleEdit(row) {
      this.$message.success('编辑：' + row.username)
    },
    handleDelete(row) {
      if (row.status === 0) {
        this.$message.warning('禁用状态用户不可删除')
        return
      }
      this.$confirm('确认删除用户“' + row.username + '”吗？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.$message.success('已模拟删除：' + row.username)
          this.loadData()
        })
        .catch(function () {})
    },
  },
}
</script>

<style scoped>
.table-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

