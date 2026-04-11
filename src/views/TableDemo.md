# NsTable 组件族使用说明（`NsTableContainer` / `NsSearch` / `NsTable`）

本文档用于外部项目和 AI 代码生成，覆盖属性、插槽、事件、列配置与实例方法。

实现来源：

- `packages/components/NsTable/PageContainer.vue`
- `packages/components/NsTable/PageSearch.vue`
- `packages/components/NsTable/PageTable.vue`
- `packages/components/NsTable/TableColumn.js`

## 1. 组件关系

- `NsTableContainer`：总控容器（搜索 + 表格 + 分页 + 选择状态）。
- `NsSearch`：动态搜索表单。
- `NsTable`：表格主体与分页条。
- `TableColumn`：列递归渲染器（action/link/tag/image/slot/headerSlot）。

## 2. 快速接入示例

```vue
<NsTableContainer
  ref="tableRef"
  page-number-key="currentPage"
  page-size-key="pageSize"
  page-total-key="total"
  :search-items="searchItems"
  :table-data="tableData"
  :columns="columns"
  :total="total"
  :table-props="{ rowKey: 'id', showSelection: true, showIndex: true }"
  :load-data="loadData"
  @search="handleSearch"
  @selection-change="handleSelectionChange"
/>
```

## 3. `NsTableContainer` API

### 3.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `showSearch` | `Boolean` | `true` | 是否显示搜索区 |
| `externalSearchParams` | `Object` | `{}` | 外部注入搜索默认值 |
| `searchItems` | `Array` | `[]` | 搜索项配置 |
| `tableData` | `Array` | `[]` | 表格数据 |
| `columns` | `Array` | `[]` | 列配置 |
| `actionButtons` | `Array` | `[]` | 预留动作按钮配置（当前未直接渲染） |
| `total` | `Number` | `0` | 总条数 |
| `currentPage` | `Number \| null` | `null` | 受控页码（可配 `.sync`） |
| `pageSize` | `Number \| null` | `null` | 受控每页条数（可配 `.sync`） |
| `pageNumberKey` | `String` | `'currentPage'` | 分页对象页码 key |
| `pageSizeKey` | `String` | `'pageSize'` | 分页对象条数 key |
| `pageTotalKey` | `String` | `'total'` | 分页对象总数 key |
| `searchProps` | `Object` | `{}` | 透传给 `NsSearch` |
| `tableProps` | `Object` | `{}` | 透传给 `NsTable` |
| `loadData` | `Function \| null` | `null` | 翻页/切条数时回调 |

### 3.2 事件（`emits`）

| 事件 | 参数 | 说明 |
|---|---|---|
| `search` | `params` | 点击查询或重置后的查询参数 |
| `reset` | - | 搜索表单重置通知 |
| `add` | - | 顶部新增按钮点击 |
| `selection-change` | `selection` | 选中行变化 |
| `sort-change` | `sort` | 排序变化 |
| `row-click` | `row, column, event` | 行点击 |
| `link-click` | `row, column` | link 类型列点击 |
| `size-change` | `size` | 分页条数变化 |
| `current-change` | `page` | 当前页变化 |
| `page-change` | `{ currentPage, pageSize }` | 页码/条数统一变化事件 |
| `update:currentPage` | `page` | 双向绑定页码 |
| `update:pageSize` | `size` | 双向绑定条数 |

### 3.3 插槽（通过 scoped slots 传入）

| 插槽名 | 说明 |
|---|---|
| `header-left` | 表格头部左侧区域 |
| `header-actions` | 表格头部右侧操作区（存在时覆盖默认新增按钮） |
| `empty` | 空状态内容 |
| `actions-after-reset` | 搜索区“重置”后扩展区域 |
| 其他任意名称 | 对应 `searchItems` slot 项 / `columns` 的 `slot`、`headerSlot`、action 按钮 `slot` |

### 3.4 常用插槽作用域（AI 生成代码建议按此命名）

| 插槽名 | scope 字段 |
|---|---|
| 搜索项 slot（`type='slot'`） | `{ formData }` |
| `actions-after-reset` | `{ formData, handleSearch, handleReset, isCollapsed }` |
| 列单元格 `column.slot` | `{ row, column, $index }` |
| 列头 `column.headerSlot` | 无（仅自定义表头内容） |
| action 按钮 `button.slot` | `{ row, index }` |
| `empty` | 无 |

### 3.5 实例方法（`ref`）

| 方法 | 说明 |
|---|---|
| `initSearchAndLoad()` | 初始化查询并加载数据 |
| `getSearchFormData()` | 取搜索表单值 |
| `setSearchFormData(data)` | 回填搜索表单 |
| `resetSearchForm()` | 重置搜索表单 |
| `validateSearchForm()` | 校验搜索表单 |
| `getPagination()` | 获取分页对象（按自定义 key） |
| `getSelectionRows()` | 获取选中行 |
| `getSelectionKeys()` | 获取选中 key（依赖 `rowKey`） |
| `setSelectionRows(rows)` | 设置选中行 |
| `setSelectionKeys(keys)` | 按 key 设置选中 |
| `clearAllSelection()` | 清空选中 |
| `selectAll()` | 全选当前页 |
| `isRowSelected(row)` | 判断行是否选中 |
| `isKeySelected(key)` | 判断 key 是否选中 |

## 4. `NsSearch` API

### 4.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `items` | `Array` | `[]` | 搜索项配置 |
| `externalParams` | `Object` | `{}` | 外部默认值 |
| `defaultSpan` | `Number` | `6` | 每项默认栅格 |
| `showCollapse` | `Boolean` | `true` | 是否显示展开/收起 |
| `collapseLimit` | `Number` | `3` | 折叠态可见数量 |
| `slotRenderers` | `Object` | `{}` | 外部插槽渲染器映射 |

### 4.2 事件

| 事件 | 参数 | 说明 |
|---|---|---|
| `search` | `formData + _resetPage` | 查询触发 |
| `reset` | - | 重置触发 |

### 4.3 实例方法（`NsSearch` 的 ref）

| 方法 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `getFormData()` | - | `Object` | 获取搜索表单数据 |
| `setFormData(data)` | `Object` | `void` | 合并回填搜索表单 |
| `resetForm()` | - | `void` | 重置并触发查询 |
| `validate()` | - | `Promise<Boolean>` | 执行表单校验 |
| `clearValidate(props?)` | `String \| String[]` | `void` | 清除校验 |

### 4.4 搜索项配置 `items[]`

| 字段 | 类型 | 说明 |
|---|---|---|
| `prop` | `String` | 字段键 |
| `label` | `String` | 标签 |
| `span` | `Number` | 栅格宽度（默认 `defaultSpan`） |
| `component` | `String \| Component` | 组件名/组件 |
| `attrs` | `Object` | 透传属性 |
| `events` | `Object` | 透传事件 |
| `children` | `Array` | `ElSelect` 选项：`{label,value,disabled}` |
| `defaultValue` | `Any` | 默认值 |
| `formItemAttrs` | `Object` | 透传 `el-form-item` |
| `type='slot'` / `slot` | - | 声明该项由插槽渲染 |
| `component='ElSwitch'` + `defaultValue` | - | 可直接做布尔筛选默认值 |

### 4.5 搜索区扩展插槽

- `actions-after-reset`：位于“重置”按钮后方，默认无内容。

```vue
<template v-slot:actions-after-reset="{ formData, handleSearch }">
  <el-button type="text" @click="() => { formData.active = true; handleSearch() }">仅看启用</el-button>
</template>
```

## 5. `NsTable` API

### 5.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `tableData` | `Array` | `[]` | 表格数据 |
| `columns` | `Array` | `[]` | 列配置 |
| `actionButtons` | `Array` | `[]` | 预留 |
| `showAddButton` | `Boolean` | `true` | 显示默认新增按钮 |
| `addButtonText` | `String` | `'新增'` | 新增按钮文案 |
| `showHeaderToolbar` | `Boolean` | `true` | 显示头部工具栏 |
| `showSelection` | `Boolean` | `false` | 显示多选列 |
| `showIndex` | `Boolean` | `false` | 显示序号列 |
| `border` | `Boolean` | `true` | 边框 |
| `stripe` | `Boolean` | `false` | 斑马纹 |
| `height` | `String \| Number` | `undefined` | 固定高度 |
| `maxHeight` | `String \| Number` | `undefined` | 最大高度 |
| `autoHeight` | `Boolean` | `true` | 自动高度填充 |
| `rowKey` | `String \| Function` | `undefined` | 行唯一键 |
| `defaultExpandAll` | `Boolean` | `false` | 树表默认展开 |
| `highlightCurrentRow` | `Boolean` | `false` | 高亮当前行 |
| `loading` | `Boolean` | `false` | loading 状态 |
| `showPagination` | `Boolean` | `true` | 显示分页 |
| `total` | `Number` | `0` | 总数 |
| `currentPage` | `Number \| null` | `null` | 受控页码 |
| `pageSize` | `Number \| null` | `null` | 受控条数 |
| `pageSizes` | `Array` | `[10,20,50,100]` | 条数选项 |
| `paginationLayout` | `String` | `'total, sizes, prev, pager, next, jumper'` | 分页布局 |
| `pageNumberKey` | `String` | `'currentPage'` | 分页对象页码 key |
| `pageSizeKey` | `String` | `'pageSize'` | 分页对象条数 key |
| `pageTotalKey` | `String` | `'total'` | 分页对象总数 key |
| `slotRenderers` | `Object` | `{}` | 外部插槽映射 |

### 5.2 事件

| 事件 | 参数 |
|---|---|
| `add` | - |
| `selection-change` | `selection` |
| `sort-change` | `sort` |
| `row-click` | `row, column, event` |
| `size-change` | `size` |
| `current-change` | `page` |
| `link-click` | `row, column` |
| `update:currentPage` | `page` |
| `update:pageSize` | `size` |

### 5.3 插槽

| 插槽名 | 说明 |
|---|---|
| `header-left` | 顶部左侧 |
| `header-actions` | 顶部右侧；存在时默认新增按钮隐藏 |
| `empty` | 表格空态 |
| 其他动态名称 | 列 `slot`、列 `headerSlot`、action 按钮 `slot` |

### 5.4 实例方法（`ref`）

- 选择相关：`getSelectionRows` `getSelectionKeys` `setSelectionRows` `setSelectionKeys` `clearSelection` `toggleRowSelection` `toggleAllSelection` `selectAll` `clearAllSelection` `isRowSelected` `isKeySelected`
- 排序过滤布局：`clearSort` `clearFilter` `doLayout` `sort`
- 分页：`resetPage` `setPage` `setPageSize` `getPagination` `setPagination`

### 5.5 透传能力（高频遗漏点）

- `NsTable` 会将 `$attrs` 透传给内部 `el-table`，可直接传 `row-class-name`、`cell-class-name`、`default-sort` 等原生属性。
- `NsTable` 会将 `$listeners` 透传给内部 `el-table`，但会排除组件自身保留事件：
  - `add`、`selection-change`、`sort-change`、`row-click`、`size-change`、`current-change`、`link-click`
- `setPagination(pagination)` 当前读取固定字段 `pagination.currentPage` 和 `pagination.pageSize`，与 `pageNumberKey/pageSizeKey` 无关。

### 5.6 选择能力生效前提

- 想让 `getSelectionKeys/setSelectionKeys/isKeySelected` 稳定生效，必须设置 `tableProps.rowKey`。
- 跨页保留选择请配合业务侧维护选中 key 集合，再按页回填。

## 6. 列配置 `columns[]`（`TableColumn.js`）

`TableColumn.js` 是列递归渲染器，负责根据 `column.type` 渲染不同类型的列。

### 6.1 通用字段

`el-table-column` 原生字段都可传，如 `prop` `label` `width` `minWidth` `sortable` `fixed` `align` 等。

### 6.2 扩展字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `children` | `Array<Column>` | 子列数组，递归渲染（用于分组列） |
| `type='action'` | `String` | 操作列，渲染 `buttons` |
| `type='tag'` | `String` | 使用 `el-tag` 渲染枚举值 |
| `type='image'` | `String` | 图片列，渲染缩略图 |
| `type='link'` | `String` | 文本按钮，点击触发 `link-click` |
| `slot` | `String` | 单元格插槽名（需配合 `NsTable` 或 `slotRenderers`） |
| `headerSlot` | `String` | 表头插槽名 |
| `enum/options` | `Array` | 枚举映射，如 `[{label:'启用',value:1}]` |
| `formatter(row,col,val)` | `Function` | 格式化显示 |
| `tagType` | `String \| Function` | tag 类型（如 `'success'`/`'danger'` 或函数返回） |
| `tagSize` | `String` | tag 大小（`'small'`/`'medium'`） |
| `imageWidth/imageHeight` | `String \| Number` | 图片尺寸，默认 `40x40` |
| `linkText` | `String` | link 列文案，不传则显示 `prop` 值 |
| `slotRenderers` | `Object` | 外部插槽渲染器映射（键为 slot 名，值为函数） |

### 6.3 action 按钮配置

`column.buttons[]` 支持：

| 字段 | 类型 | 说明 |
|---|---|---|
| `label` | `String` | 文案 |
| `type` | `String` | 按钮类型（`'text'`/`'primary'`/`'danger'` 等） |
| `icon` | `String` | 图标类名 |
| `size` | `String` | 尺寸 |
| `link` | `Boolean` | 是否文本风格 |
| `show` | `Boolean \| Function` | 显示控制，函数签名 `(row, index) => Boolean` |
| `disabled` | `Boolean \| Function` | 禁用控制，函数签名 `(row, index) => Boolean` |
| `handler` | `Function` | 点击处理，函数签名 `(row, index) => void` |
| `slot` | `String` | 自定义按钮插槽名（需外部提供） |

### 6.4 列类型完整示例

```js
const columns = [
  // 1. 普通文本列
  { prop: 'name', label: '名称', minWidth: 150 },

  // 2. 枚举 tag 列
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'tag',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ],
    tagType: (row) => row.status === 1 ? 'success' : 'info'
  },

  // 3. 图片列
  {
    prop: 'avatar',
    label: '头像',
    width: 80,
    type: 'image',
    imageWidth: 40,
    imageHeight: 40
  },

  // 4. link 列（点击触发 link-click 事件）
  {
    prop: 'title',
    label: '标题',
    minWidth: 200,
    type: 'link',
    linkText: '查看详情'
  },

  // 5. 自定义插槽列
  {
    prop: 'custom',
    label: '自定义',
    width: 150,
    slot: 'custom-slot'
  },

  // 6. 操作列
  {
    type: 'action',
    label: '操作',
    width: 200,
    fixed: 'right',
    buttons: [
      {
        label: '编辑',
        type: 'text',
        handler: (row) => handleEdit(row)
      },
      {
        label: '删除',
        type: 'text',
        style: { color: '#F56C6C' },
        show: (row) => row.status !== -1,
        handler: (row) => handleDelete(row)
      },
      {
        label: '详情',
        type: 'primary',
        link: true,
        handler: (row) => handleDetail(row)
      }
    ]
  },

  // 7. 分组列（children 递归）
  {
    label: '分组信息',
    children: [
      { prop: 'groupName', label: '组名', width: 120 },
      { prop: 'groupLeader', label: '组长', width: 100 }
    ]
  }
]
```

### 6.5 headerSlot 表头自定义示例

```vue
<NsTableContainer :columns="columns">
  <!-- 表头插槽：column.headerSlot = 'priority-header' -->
  <template v-slot:priority-header>
    <span>优先级 <i class="el-icon-question"></i></span>
  </template>
</NsTableContainer>
```

### 6.6 slotRenderers 外部插槽渲染器

当列使用 `slot: 'xxx'` 时，需要外部提供插槽或通过 `slotRenderers` 注册：

```js
const columns = [
  { prop: 'custom', label: '自定义', slot: 'custom-render', slotRenderers: {
    'custom-render': (h, { row, column, $index }) => {
      return h('el-tag', {}, row.customValue)
    }
  }}
]
```

## 7. slotRenderers 完整使用说明

### 7.1 概念

`slotRenderers` 是一个映射对象，键为插槽名，值为渲染函数。用于在 `NsTable`/`NsSearch` 内部动态渲染自定义内容。

### 7.2 签名

```ts
(type: string, context: { row?, column?, $index?, formData? }) => VNode
```

### 7.3 使用场景

1. **搜索项自定义**：`items` 中 `type='slot'` 且外部不提供插槽时
2. **表格列自定义**：列 `slot` 字段对应的渲染逻辑
3. **扩展操作区**：自定义按钮渲染

### 7.4 示例

```js
const tableProps = {
  slotRenderers: {
    // 表格单元格插槽渲染
    'status-tag': (h, { row }) => {
      return h('el-tag', {
        type: row.status === 1 ? 'success' : 'danger'
      }, row.status === 1 ? '启用' : '禁用')
    },
    // 操作列自定义按钮
    'custom-action': (h, { row, index }) => {
      return [
        h('el-button', { type: 'text', on: { click: () => handleEdit(row) }}, '编辑'),
        h('el-button', { type: 'text', style: { color: '#F56C6C' }, on: { click: () => handleDelete(row) }}, '删除')
      ]
    }
  }
}

const columns = [
  { prop: 'status', label: '状态', slot: 'status-tag' },
  { type: 'action', label: '操作', slot: 'custom-action' }
]
```

## 8. AI 生成代码建议

- 业务中优先使用 `NsTableContainer`，避免手动维护搜索-分页-加载联动。
- 需要跨页保留勾选时必须提供 `tableProps.rowKey`。
- 如要显示默认新增按钮，不要同时提供 `header-actions` 插槽。
- 搜索表单扩展操作（导出/快捷筛选）优先放 `actions-after-reset` 插槽，不改动核心结构。

## 9. AI 代码生成提示词（Prompt）

```text
请生成 Vue2.7 + script setup 的 NsTableContainer 页面，要求：
1) 同时包含后端分页与前端分页模式切换；
2) searchItems 覆盖 ElInput + ElSelect + ElDatePicker + slot 项 + defaultValue；
3) columns 覆盖：
   - 普通文本列（prop/label/width/minWidth/sortable）
   - children 分组列（嵌套子列）
   - image 列（type='image' + imageWidth/imageHeight）
   - link 列（type='link' + linkText）
   - tag 列（type='tag' + options + tagType函数）
   - 自定义插槽列（slot + slotRenderers）
   - headerSlot 表头自定义
   - action 列（buttons + show函数 + disabled函数 + handler）
4) 监听事件：search/reset/add/selection-change/sort-change/row-click/size-change/current-change/page-change/link-click；
5) 提供 ref 调用示例：
   - getSelectionKeys/setSelectionKeys（需配合 tableProps.rowKey）
   - resetSearchForm/getPagination
   - isKeySelected/isRowSelected
6) 使用 rowKey 并展示跨页选择方案；
7) 提供 actions-after-reset 插槽扩展示例；
8) 使用 slotRenderers 实现自定义列渲染。
```

## 10. 标准代码模板（AI 可直接参考）

```vue
<template>
  <NsTableContainer
    ref="tableRef"
    page-number-key="pageNo"
    page-size-key="pageSize"
    page-total-key="totalCount"
    :search-items="searchItems"
    :table-data="tableData"
    :columns="columns"
    :total="total"
    :table-props="{
      rowKey: 'id',
      showSelection: true,
      showIndex: true,
      border: true,
      stripe: true,
      autoHeight: true
    }"
    :load-data="fetchData"
    @search="onSearch"
    @reset="onReset"
    @add="onAdd"
    @selection-change="onSelectionChange"
    @link-click="onLinkClick"
  >
    <!-- 搜索区扩展按钮 -->
    <template v-slot:actions-after-reset="{ formData, handleSearch }">
      <el-button type="text" @click="() => { formData.status = 1; handleSearch() }">仅看启用</el-button>
    </template>

    <!-- 顶部操作区 -->
    <template v-slot:header-actions>
      <el-button type="primary" icon="el-icon-plus" @click="onAdd">新增</el-button>
      <el-button @click="batchDelete" :disabled="!selectedIds.length">批量删除</el-button>
    </template>

    <!-- 单元格插槽：状态 -->
    <template v-slot:status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'info'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>

    <!-- 表格空态 -->
    <template v-slot:empty>
      <el-empty description="暂无数据" />
    </template>
  </NsTableContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tableRef = ref(null)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])

// 搜索配置
const searchItems = ref([
  {
    prop: 'keyword',
    label: '关键字',
    component: 'ElInput',
    attrs: { placeholder: '请输入名称/编码', clearable: true }
  },
  {
    prop: 'status',
    label: '状态',
    component: 'ElSelect',
    attrs: { clearable: true },
    children: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
])

// 列配置
const columns = ref([
  { prop: 'name', label: '名称', minWidth: 150, type: 'link' },
  { prop: 'code', label: '编码', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
  {
    type: 'action',
    label: '操作',
    width: 150,
    fixed: 'right',
    buttons: [
      {
        label: '编辑',
        type: 'text',
        handler: (row) => console.log('编辑', row)
      },
      {
        label: '删除',
        type: 'text',
        style: { color: '#F56C6C' },
        handler: (row) => console.log('删除', row)
      }
    ]
  }
])

// 数据加载
const fetchData = async () => {
  if (!tableRef.value) return
  
  const searchParams = tableRef.value.getSearchFormData()
  const pagination = tableRef.value.getPagination() // { pageNo, pageSize }
  
  console.log('加载参数:', { ...searchParams, ...pagination })
  
  // 模拟请求
  tableData.value = [
    { id: 1, name: '测试项目1', code: 'P001', status: 1, createTime: '2024-01-01' },
    { id: 2, name: '测试项目2', code: 'P002', status: 0, createTime: '2024-01-02' }
  ]
  total.value = 2
}

const onSearch = (params) => {
  console.log('查询触发:', params)
  fetchData()
}

const onReset = () => {
  console.log('重置触发')
}

const onAdd = () => {
  console.log('新增点击')
}

const onSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const onLinkClick = (row, column) => {
  console.log('链接点击:', row, column)
}

const batchDelete = () => {
  console.log('批量删除 IDs:', selectedIds.value)
}

onMounted(() => {
  // 初始加载
  tableRef.value?.initSearchAndLoad()
})
</script>
```
