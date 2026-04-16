# NsTable 组件族使用说明（`NsTableContainer` / `NsSearch` / `NsTable`）

本文档只描述当前仓库表格体系的真实能力，重点帮助 AI 生成“搜索、表格、分页、列渲染、跨页选择”一体化页面代码。

## 1. 组件关系

| 组件 | 路径 | 作用 |
|---|---|---|
| `NsTableContainer` | `packages/components/NsTable/PageContainer.vue` | 搜索 + 表格 + 分页 + 选中状态总控 |
| `NsSearch` | `packages/components/NsTable/PageSearch.vue` | 搜索区 |
| `NsTable` | `packages/components/NsTable/PageTable.vue` | 表格主体与分页条 |
| `TableColumn` | `packages/components/NsTable/TableColumn.js` | 递归列渲染器 |

推荐优先使用 `NsTableContainer`，这样搜索、分页、选中同步逻辑都交给容器维护。

## 2. 最小接入示例

```vue
<NsTableContainer
  ref="tableRef"
  :search-items="searchItems"
  :table-data="tableData"
  :columns="columns"
  :total="total"
  :table-props="{ rowKey: 'id', showSelection: true, showIndex: true }"
  :load-data="fetchData"
  @search="handleSearch"
  @selection-change="handleSelectionChange"
/>
```

## 3. `NsTableContainer`

### 3.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `showSearch` | `Boolean` | `true` | 是否显示搜索区 |
| `externalSearchParams` | `Object` | `{}` | 搜索默认值或外部回填值 |
| `searchItems` | `Array` | `[]` | 搜索配置 |
| `tableData` | `Array` | `[]` | 表格数据 |
| `columns` | `Array` | `[]` | 列配置 |
| `actionButtons` | `Array` | `[]` | 预留字段，当前未直接渲染 |
| `total` | `Number` | `0` | 总条数 |
| `currentPage` | `Number \| null` | `null` | 受控页码 |
| `pageSize` | `Number \| null` | `null` | 受控每页条数 |
| `pageNumberKey` | `String` | `'currentPage'` | `getPagination()` 返回对象的页码键名 |
| `pageSizeKey` | `String` | `'pageSize'` | `getPagination()` 返回对象的条数键名 |
| `pageTotalKey` | `String` | `'total'` | `getPagination()` 返回对象的总数键名 |
| `enterTrigger` | `Boolean` | `true` | 是否开启回车触发“查询”按钮 |
| `searchProps` | `Object` | `{}` | 透传给 `NsSearch` |
| `tableProps` | `Object` | `{}` | 透传给 `NsTable` |
| `loadData` | `Function \| null` | `null` | 分页变化时调用 |

### 3.2 事件

| 事件 | 参数 | 说明 |
|---|---|---|
| `search` | `params` | 查询触发 |
| `reset` | - | 搜索区重置完成 |
| `add` | - | 顶部新增按钮点击 |
| `selection-change` | `selection` | 选中行变化 |
| `sort-change` | `sort` | 排序变化 |
| `row-click` | `row, column, event` | 行点击 |
| `link-click` | `row, column` | link 列点击 |
| `size-change` | `size` | 每页条数变化 |
| `current-change` | `page` | 页码变化 |
| `page-change` | `{ currentPage, pageSize }` | 页码或条数变化后的统一事件 |
| `update:currentPage` | `page` | 双向绑定页码 |
| `update:pageSize` | `size` | 双向绑定条数 |

### 3.3 当前实现的关键行为

- 搜索或重置时会先清空选中状态
- `NsSearch` 触发查询时会携带 `_resetPage: true`，容器收到后会把页码重置为 `1`
- `handleSizeChange` 与 `handleCurrentChange` 会自动调用 `loadData()`
- `initSearchAndLoad()` 在 `showSearch=true` 时优先触发 `search` 事件，而不是直接调用 `loadData()`

### 3.4 实例方法

| 方法 | 说明 |
|---|---|
| `initSearchAndLoad()` | 初始化查询 |
| `getSearchFormData()` | 读取搜索表单 |
| `setSearchFormData(data)` | 回填搜索表单 |
| `resetSearchForm()` | 重置搜索表单 |
| `validateSearchForm()` | 校验搜索表单 |
| `getPagination()` | 获取分页对象 |
| `getSelectionRows()` | 获取选中行 |
| `getSelectionKeys()` | 获取选中 key |
| `setSelectionRows(rows)` | 设置选中行 |
| `setSelectionKeys(keys)` | 设置选中 key |
| `clearAllSelection()` | 清空选中 |
| `selectAll()` | 全选当前页 |
| `isRowSelected(row)` | 判断某行是否选中 |
| `isKeySelected(key)` | 判断某 key 是否选中 |

### 3.5 插槽

| 插槽名 | 说明 |
|---|---|
| `extend` | 位于搜索区与表格之间的扩展区域，可放置业务提示、统计信息或额外操作 |

```vue
<NsTableContainer
  :search-items="searchItems"
  :table-data="tableData"
  :columns="columns"
  :total="total"
>
  <template v-slot:extend>
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="这里是 extend 插槽"
    />
  </template>
</NsTableContainer>
```

## 4. `NsSearch`

### 4.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `items` | `Array` | `[]` | 搜索项配置 |
| `externalParams` | `Object` | `{}` | 默认值或外部注入值 |
| `defaultSpan` | `Number` | `6` | 每项默认栅格 |
| `showCollapse` | `Boolean` | `true` | 是否显示展开/收起 |
| `collapseLimit` | `Number` | `3` | 折叠时显示数量 |
| `slotRenderers` | `Object` | `{}` | 外部插槽渲染器映射 |
| `actionsAlign` | `String` | `'left'` | 查询/重置按钮对齐方式，支持 `left / center / right` |
| `actionsSpan` | `Number \| null` | `null` | 查询/重置按钮栏独立栅格，未设置时回退 `defaultSpan` |
| `actionsWidth` | `String \| Number` | `''` | 查询/重置按钮栏独立宽度，支持如 `320px`、`30%`、`280` |
| `collapseToggleText` | `Array \| String` | `['展开','收起']` | 展开/收起按钮文案，推荐传数组 `[展开文案, 收起文案]` |
| `enterTrigger` | `Boolean` | `true` | 是否给“查询”按钮挂载 `v-enterClick` |

### 4.2 事件

| 事件 | 参数 | 说明 |
|---|---|---|
| `search` | `formData + _resetPage` | 查询触发 |
| `reset` | - | 重置触发 |

### 4.3 按钮栏布局配置

`NsSearch` 默认按钮居左；可通过 `actionsAlign` 配置：

- `left`：按钮居左（默认）
- `center`：按钮居中
- `right`：按钮居右

还可单独控制按钮栏宽度：

- `actionsSpan`：按栅格系统控制按钮栏占位
- `actionsWidth`：按固定宽度控制按钮栏展示宽度
- `collapseToggleText`：推荐使用数组 `[展开文案, 收起文案]`，也兼容字符串 `展开文案/收起文案`
- `enterTrigger`：默认 `true`；设为 `false` 时，回车不会自动触发查询按钮点击
- 同时设置时：`actionsSpan` 与 `actionsWidth` 会同时生效，实际显示宽度通常以 `actionsWidth` 为主
- `TableDemo` 示例页中，`actionsSpan` 与 `actionsWidth` 放在同一行联动演示；`actionsSpan` 输入值会在示例代码里转成数字后再透传给 `NsSearch`

示例：

```vue
<NsSearch
  :items="searchItems"
  :actionsAlign="'right'"
  :actionsSpan="8"
  actionsWidth="320px"
  :collapseToggleText="['更多', '收起']"
/>
```

### 4.4 实例方法

| 方法 | 返回 | 说明 |
|---|---|---|
| `getFormData()` | `Object` | 获取搜索值 |
| `setFormData(data)` | `void` | 合并回填 |
| `resetForm()` | `void` | 重置并触发查询 |
| `validate()` | `Promise<Boolean>` | 表单校验 |
| `clearValidate(props?)` | `void` | 清除校验 |

### 4.5 搜索项配置 `items[]`

| 字段 | 类型 | 说明 |
|---|---|---|
| `prop` | `String` | 表单字段名 |
| `label` | `String` | 标签 |
| `span` | `Number` | 栅格宽度 |
| `component` | `String \| Component` | 组件 |
| `attrs` | `Object` | 透传给组件的属性 |
| `events` | `Object` | 透传给组件的事件 |
| `children` | `Array` | `ElSelect` 的选项源 |
| `defaultValue` | `Any` | 默认值 |
| `formItemAttrs` | `Object` | 透传给 `el-form-item` |
| `type` | `String` | `slot` 表示该项用插槽渲染 |
| `slot` | `Boolean \| String` | 插槽开关或插槽名 |

### 4.6 搜索区插槽

| 插槽名 | scope |
|---|---|
| `actions-after-reset` | `{ formData, handleSearch, handleReset, isCollapsed }` |
| 自定义搜索项插槽 | `{ formData, item }` |

```vue
<template v-slot:actions-after-reset="{ formData, handleSearch }">
  <el-button type="text" @click="() => { formData.status = 1; handleSearch() }">仅看启用</el-button>
</template>
```

## 5. `NsTable`

### 5.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `tableData` | `Array` | `[]` | 表格数据 |
| `columns` | `Array` | `[]` | 列配置 |
| `actionButtons` | `Array` | `[]` | 预留字段 |
| `showAddButton` | `Boolean` | `true` | 是否显示默认新增按钮 |
| `addButtonText` | `String` | `'新增'` | 新增按钮文案 |
| `showHeaderToolbar` | `Boolean` | `true` | 是否显示头部工具栏 |
| `showSelection` | `Boolean` | `false` | 是否显示多选列 |
| `showIndex` | `Boolean` | `false` | 是否显示序号列 |
| `indexWidth` | `String \| Number` | `60` | 序号列宽度 |
| `indexAlign` | `String` | `''` | 序号列单元格对齐方式，支持 `left / center / right` |
| `indexHeaderAlign` | `String` | `''` | 序号列表头对齐方式；未设置时回退 `indexAlign` |
| `border` | `Boolean` | `true` | 边框 |
| `stripe` | `Boolean` | `false` | 斑马纹 |
| `height` | `String \| Number` | `undefined` | 固定高度 |
| `maxHeight` | `String \| Number` | `undefined` | 最大高度 |
| `autoHeight` | `Boolean` | `true` | 未指定高度时自动填充 |
| `rowKey` | `String \| Function` | `undefined` | 行唯一键 |
| `defaultExpandAll` | `Boolean` | `false` | 树表默认展开 |
| `highlightCurrentRow` | `Boolean` | `false` | 高亮当前行 |
| `loading` | `Boolean` | `false` | 加载状态 |
| `showPagination` | `Boolean` | `true` | 是否显示分页 |
| `total` | `Number` | `0` | 总数 |
| `currentPage` | `Number \| null` | `null` | 受控页码 |
| `pageSize` | `Number \| null` | `null` | 受控页大小 |
| `pageSizes` | `Array` | `[10,20,50,100]` | 条数选项 |
| `paginationLayout` | `String` | `'total, sizes, prev, pager, next, jumper'` | 分页布局 |
| `pageNumberKey` | `String` | `'currentPage'` | 分页对象页码键名 |
| `pageSizeKey` | `String` | `'pageSize'` | 分页对象条数键名 |
| `pageTotalKey` | `String` | `'total'` | 分页对象总数字段 |
| `slotRenderers` | `Object` | `{}` | 外部插槽渲染器 |

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

### 5.3 透传能力

- `$attrs` 会透传给内部 `el-table`
- `$listeners` 也会透传，但会排除保留事件
- 因此可直接继续传 `default-sort`、`row-class-name`、`cell-class-name` 等原生能力

### 5.4 实例方法

分为三类：

- 选择相关：`getSelectionRows`、`getSelectionKeys`、`setSelectionRows`、`setSelectionKeys`、`clearSelection`、`toggleRowSelection`、`toggleAllSelection`、`selectAll`、`clearAllSelection`、`isRowSelected`、`isKeySelected`
- 表格控制：`clearSort`、`clearFilter`、`doLayout`、`sort`
- 分页控制：`resetPage`、`setPage`、`setPageSize`、`getPagination`、`setPagination`

### 5.5 真实限制

- `setPagination(pagination)` 只读取 `pagination.currentPage` 和 `pagination.pageSize`
- 它不会识别自定义键名 `pageNumberKey / pageSizeKey`
- 若使用 `header-actions` 插槽，默认新增按钮会隐藏

## 6. 列配置 `columns[]`

`TableColumn.js` 会递归渲染列，因此支持普通列、分组列、操作列、自定义渲染列。

### 6.1 可直接透传的原生列属性

`el-table-column` 的常规字段都可以直接写，例如：

- `prop`
- `label`
- `width`
- `minWidth`
- `sortable`
- `fixed`
- `align`

### 6.2 扩展字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `children` | `Array<Column>` | 子列 |
| `type` | `String` | `action` / `tag` / `image` / `link` |
| `slot` | `String` | 单元格插槽名 |
| `headerSlot` | `String` | 表头插槽名 |
| `buttons` | `Array` | `action` 列按钮列表 |
| `enum` | `Array` | 枚举映射 |
| `options` | `Array` | 同样可用于 tag 枚举映射 |
| `formatter` | `Function` | 自定义显示函数 |
| `tagType` | `String \| Function` | tag 类型 |
| `tagSize` | `String` | tag 大小 |
| `imageWidth` | `String \| Number` | 图片宽度 |
| `imageHeight` | `String \| Number` | 图片高度 |
| `linkText` | `String` | link 文案 |

### 6.3 `action` 列按钮配置

| 字段 | 类型 | 说明 |
|---|---|---|
| `label` | `String` | 按钮文本 |
| `type` | `String` | 按钮类型 |
| `icon` | `String` | 图标类名 |
| `size` | `String` | 尺寸 |
| `link` | `Boolean` | 为真时渲染成 `text` 风格 |
| `show` | `Boolean \| Function` | 是否显示 |
| `disabled` | `Boolean \| Function` | 是否禁用 |
| `handler` | `Function` | 点击回调 |
| `slot` | `String` | 自定义按钮渲染器名称 |

### 6.4 当前实现细节

- `show(row)` 和 `disabled(row)` 当前只接收 `row`，不要假设一定有 `index`
- `handler(row, index)` 会收到行数据与行序号
- `button.slot` 对应的渲染器会收到 `{ row, column, button, $index }`
- `button.style` 当前实现不会被渲染到按钮上，生成代码时不要依赖它

### 6.5 常用列示例

```js
const columns = [
  { prop: 'name', label: '名称', minWidth: 160 },
  {
    prop: 'status',
    label: '状态',
    type: 'tag',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
    tagType: (row) => (row.status === 1 ? 'success' : 'info'),
  },
  {
    prop: 'avatar',
    label: '头像',
    type: 'image',
    width: 90,
    imageWidth: 40,
    imageHeight: 40,
  },
  {
    prop: 'title',
    label: '标题',
    type: 'link',
    minWidth: 180,
    linkText: '查看详情',
  },
  {
    prop: 'customValue',
    label: '自定义',
    slot: 'custom-cell',
  },
  {
    type: 'action',
    label: '操作',
    width: 180,
    fixed: 'right',
    buttons: [
      {
        label: '编辑',
        type: 'text',
        handler: (row) => handleEdit(row),
      },
      {
        label: '删除',
        type: 'text',
        show: (row) => row.status !== -1,
        handler: (row) => handleDelete(row),
      },
    ],
  },
  {
    label: '分组信息',
    children: [
      { prop: 'groupName', label: '组名', width: 120 },
      { prop: 'groupLeader', label: '组长', width: 120 },
    ],
  },
]
```

## 7. 插槽与 `slotRenderers`

### 7.1 推荐优先级

优先使用普通 Vue 具名插槽；只有在需要把渲染函数直接写进配置对象时，才使用 `slotRenderers`。

### 7.2 支持的插槽名

| 插槽名 | 位置 | scope |
|---|---|---|
| `header-left` | 表格头部左侧 | `{ tableData }` |
| `header-actions` | 表格头部右侧 | `{ tableData }` |
| `empty` | 空状态 | `{ tableData }` |
| `actions-after-reset` | 搜索区重置按钮后 | `{ formData, handleSearch, handleReset, isCollapsed }` |
| 搜索项 slot | `NsSearch` | `{ formData, item }` |
| 列 `slot` | `NsTable` | `{ row, column, $index }` |
| 列 `headerSlot` | `NsTable` | Element 表头 scope |
| `button.slot` | `action` 按钮 | `{ row, column, button, $index }` |

### 7.3 `slotRenderers` 的真实签名

当前实现不是 `(type, context) => VNode`，而是直接：

```js
(scope) => VNode
```

也就是说，渲染函数直接收到 scope 对象。

```js
const slotRenderers = {
  statusTag: ({ row }) => h('el-tag', { props: { type: row.status === 1 ? 'success' : 'info' } }, row.status === 1 ? '启用' : '禁用'),
}
```

## 8. 跨页选择

如果 `NsTableContainer` 配置了 `tableProps.rowKey`，容器会自动维护一份跨页选中 key 集合。

### 8.1 必要条件

- 必须设置 `tableProps.rowKey`
- `rowKey` 可以是字符串字段名，也可以是函数

### 8.2 容器会帮你做什么

- 翻页后自动把当前页里已选中的行重新勾上
- `getSelectionKeys()` 返回跨页累计 key
- `getSelectionRows()` 返回当前已缓存的选中行对象

### 8.3 AI 生成代码约束

- 若要稳定使用 `getSelectionKeys / setSelectionKeys / isKeySelected`，一定提供 `rowKey`
- 若业务需要跨页全量批量操作，建议以 key 集合为主，不要只依赖当前页 selection 数组

## 9. Demo 应覆盖的能力

AI 生成页面时，建议至少覆盖下列功能点：

| 模块 | 建议能力 |
|---|---|
| 搜索区 | `ElInput`、`ElSelect`、`slot` 项、默认值、折叠展开 |
| 表格列 | 普通列、分组列、tag、image、link、slot、headerSlot、action |
| 交互 | `search`、`reset`、`add`、`selection-change`、`sort-change`、`row-click`、`link-click` |
| 选择 | `rowKey`、跨页选择、批量操作 |
| 扩展 | `actions-after-reset`、`header-actions`、`empty` |

## 10. AI 生成代码规则

- 优先使用 `NsTableContainer`
- 列配置只写当前实现支持的字段
- `slotRenderers` 写成 `(scope) => VNode`
- 动作按钮显隐逻辑用 `show(row)`，不要依赖第二个参数
- 如需跨页勾选，必须配置 `tableProps.rowKey`
- 若用自定义 `header-actions`，不要再依赖默认新增按钮
- 如果使用 `setPagination()`，传入对象必须是 `{ currentPage, pageSize }`

## 11. 推荐 Prompt

```text
请生成 Vue2.7 + script setup 的 NsTableContainer 页面，要求：
1) searchItems 覆盖 ElInput、ElSelect、ElDatePicker、slot 项、defaultValue；
2) columns 覆盖普通文本列、children 分组列、image、link、tag、自定义 slot、headerSlot、action；
3) 监听 search、reset、add、selection-change、sort-change、row-click、size-change、current-change、page-change、link-click；
4) 提供 rowKey，并演示 getSelectionKeys、setSelectionKeys、isKeySelected；
5) 提供 actions-after-reset、header-actions、empty 插槽示例；
6) 如使用 slotRenderers，按当前项目的 (scope) => VNode 签名实现；
7) 不使用 TS，不虚构不存在的 props 或方法。
```

## 12. 标准模板

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
      indexWidth: 72,
      indexAlign: 'center',
      border: true,
      stripe: true,
      paginationLayout: 'total, sizes, prev, pager, next',
    }"
    :load-data="fetchData"
    @search="onSearch"
    @reset="onReset"
    @add="onAdd"
    @selection-change="onSelectionChange"
    @link-click="onLinkClick"
  >
    <template v-slot:actions-after-reset="{ formData, handleSearch }">
      <el-button type="text" @click="() => { formData.status = 1; handleSearch() }">仅看启用</el-button>
    </template>

    <template v-slot:header-actions>
      <el-button type="primary" @click="onAdd">新增</el-button>
      <el-button :disabled="!selectedIds.length" @click="batchDelete">批量删除</el-button>
    </template>

    <template v-slot:status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'info'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>

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

const searchItems = ref([
  {
    prop: 'keyword',
    label: '关键字',
    component: 'ElInput',
    attrs: { clearable: true, placeholder: '请输入关键字' },
  },
  {
    prop: 'status',
    label: '状态',
    component: 'ElSelect',
    attrs: { clearable: true },
    children: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
  },
])

const columns = ref([
  { prop: 'name', label: '名称', minWidth: 160, type: 'link' },
  { prop: 'code', label: '编码', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180, sortable: true },
  {
    type: 'action',
    label: '操作',
    width: 160,
    fixed: 'right',
    buttons: [
      {
        label: '编辑',
        type: 'text',
        handler: (row) => console.log('编辑', row),
      },
      {
        label: '删除',
        type: 'text',
        handler: (row) => console.log('删除', row),
      },
    ],
  },
])

const fetchData = async () => {
  const searchParams = tableRef.value.getSearchFormData()
  const pagination = tableRef.value.getPagination()
  console.log({ ...searchParams, ...pagination })

  tableData.value = [
    { id: 1, name: '项目一', code: 'P001', status: 1, createTime: '2026-01-01' },
    { id: 2, name: '项目二', code: 'P002', status: 0, createTime: '2026-01-02' },
  ]
  total.value = 2
}

const onSearch = () => {
  fetchData()
}

const onReset = () => {
  console.log('重置完成')
}

const onAdd = () => {
  console.log('新增')
}

const onSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id)
}

const onLinkClick = (row) => {
  console.log('查看详情', row)
}

const batchDelete = () => {
  console.log('批量删除', selectedIds.value)
}

onMounted(() => {
  tableRef.value?.initSearchAndLoad()
})
</script>

<style scoped>
.table-demo /deep/ .page-table__pagination {
  justify-content: center;
}
</style>
```
