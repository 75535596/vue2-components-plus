<template>
  <div class="posts-demo">
    <el-alert
      class="posts-demo__tip"
      type="success"
      show-icon
      :closable="false"
      title="真实接口示例：GET https://jsonplaceholder.typicode.com/posts"
      description="使用 _page / _limit 真后端分页，X-Total-Count 响应头作为总数；支持 q 关键字搜索、userId 过滤、_sort/_order 排序。"
    />

    <NsTableContainer
      ref="containerRef"
      class="posts-demo__container"
      :show-search="true"
      :enter-trigger="true"
      :search-items="searchItems"
      :search-props="searchProps"
      :table-data="tableData"
      :columns="columns"
      :total="total"
      :table-props="tableProps"
      @search="loadData"
      @link-click="handleLinkClick"
    >
      <template v-slot:userId="{ row }">
        <el-tag size="small" :type="getUserTagType(row.userId)">用户 {{ row.userId }}</el-tag>
      </template>

      <template v-slot:body="{ row }">
        <el-tooltip effect="dark" :content="row.body" placement="top-start">
          <span class="posts-demo__body">{{ row.body }}</span>
        </el-tooltip>
      </template>

      <template v-slot:header-left>
        <span class="posts-demo__toolbar-left">服务端共 {{ total }} 条</span>
      </template>

      <template v-slot:header-actions>
        <el-button size="small" type="primary" @click="reload">刷新</el-button>
      </template>
    </NsTableContainer>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, ref } from 'vue'

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'

const containerRef = ref()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const { proxy } = getCurrentInstance() || {}

const searchItems = ref([
  {
    prop: 'q',
    label: '全文搜索',
    span: 8,
    component: 'ElInput',
    attrs: {
      placeholder: '在 title / body 中模糊匹配（?q=）',
      clearable: true,
    },
  },
  {
    prop: 'id',
    label: 'ID',
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
    label: '所属用户',
    span: 6,
    component: 'ElSelect',
    attrs: {
      placeholder: '精确匹配（?userId=）',
      clearable: true,
    },
    children: Array.from({ length: 10 }, (_, index) => ({
      label: '用户 ' + (index + 1),
      value: index + 1,
    })),
  },
  {
    prop: 'title',
    label: '标题',
    span: 8,
    component: 'ElInput',
    attrs: {
      placeholder: '精确匹配（?title=）',
      clearable: true,
    },
  },
])

const searchProps = {
  labelWidth: '80px',
  size: 'small',
  defaultSpan: 6,
  showCollapse: false,
  actionsAlign: 'left',
}

const tableProps = {
  showHeaderToolbar: true,
  showAddButton: false,
  showSelection: false,
  showIndex: true,
  indexWidth: 60,
  indexAlign: 'center',
  loading: false,
  rowKey: 'id',
  showPagination: true,
  pageSizes: [5, 10, 20, 50],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  border: true,
  stripe: true,
  highlightCurrentRow: true,
  autoHeight: true,
}

const columns = ref([
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: 'custom',
    align: 'center',
  },
  {
    prop: 'userId',
    label: '用户',
    width: 110,
    sortable: 'custom',
    slot: 'userId',
    align: 'center',
  },
  {
    prop: 'title',
    label: '标题',
    minWidth: 260,
    type: 'link',
    linkText: (row) => row.title,
  },
  {
    prop: 'body',
    label: '正文',
    minWidth: 360,
    slot: 'body',
  },
])

function getUserTagType(userId) {
  const types = ['', 'success', 'warning', 'danger', 'info']
  return types[userId % types.length]
}

function buildQuery(params) {
  const usp = new URLSearchParams()
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (value === undefined || value === null || value === '') return
    usp.append(key, String(value))
  })
  return usp.toString()
}

async function fetchPosts(query) {
  const params = query || {}
  const requestParams = {
    _page: params.currentPage || 1,
    _limit: params.pageSize || 10,
  }
  const keyword = String(params.q || '').trim()
  if (keyword) requestParams.q = keyword
  if (params.id) requestParams.id = params.id
  if (params.userId) requestParams.userId = params.userId
  const title = String(params.title || '').trim()
  if (title) requestParams.title = title
  const sort = params.sort || {}
  if (sort.prop && sort.order) {
    requestParams._sort = sort.prop
    requestParams._order = sort.order === 'ascending' ? 'asc' : 'desc'
  }

  const response = await fetch(POSTS_URL + '?' + buildQuery(requestParams), {
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
    const { list, total: totalCount } = await fetchPosts(query)
    tableData.value = list
    total.value = totalCount
  } catch (error) {
    if (proxy && proxy.$message) {
      proxy.$message.error('调用 posts 接口失败：' + (error && error.message ? error.message : '未知错误'))
    }
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleLinkClick(row) {
  if (proxy && proxy.$message) {
    proxy.$message.info('点击了标题：#' + row.id + ' ' + row.title)
  }
}

function reload() {
  if (containerRef.value && containerRef.value.reload) {
    containerRef.value.reload()
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
.posts-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.posts-demo__tip {
  border-radius: 12px;
}

.posts-demo__container {
  flex: 1;
  min-height: 420px;
}

.posts-demo__body {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.posts-demo__toolbar-left {
  color: #606266;
  font-size: 13px;
}
</style>
