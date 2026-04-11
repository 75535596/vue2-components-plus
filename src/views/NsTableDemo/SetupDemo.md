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

### 3.4 实例方法（`ref`）

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

## 6. 列配置 `columns[]`（`TableColumn.js`）

### 6.1 通用字段

`el-table-column` 原生字段都可传，如 `prop` `label` `width` `minWidth` `sortable` `fixed` `align` 等。

### 6.2 扩展字段

| 字段 | 说明 |
|---|---|
| `children` | 子列数组，递归渲染 |
| `type='action'` | 操作列，渲染 `buttons` |
| `type='tag'` | 使用 `el-tag` 渲染 |
| `type='image'` | 图片渲染 |
| `type='link'` | 文本按钮，点击触发 `link-click` |
| `slot` | 单元格插槽名 |
| `headerSlot` | 表头插槽名 |
| `enum/options` | 枚举映射 |
| `formatter(row,col,val)` | 格式化显示 |
| `tagType` | tag 类型（或函数） |
| `tagSize` | tag 大小 |
| `imageWidth/imageHeight` | 图片尺寸 |
| `linkText` | link 文案 |

### 6.3 action 按钮配置

`column.buttons[]` 支持：

| 字段 | 类型 | 说明 |
|---|---|---|
| `label` | `String` | 文案 |
| `type` | `String` | 按钮类型 |
| `icon` | `String` | 图标 |
| `size` | `String` | 尺寸 |
| `link` | `Boolean` | 文本风格 |
| `show` | `Boolean \| (row)=>Boolean` | 显示控制 |
| `disabled` | `Boolean \| (row)=>Boolean` | 禁用控制 |
| `handler` | `(row, index)=>void` | 点击处理 |
| `slot` | `String` | 自定义按钮插槽 |

## 7. AI 生成代码建议

- 业务中优先使用 `NsTableContainer`，避免手动维护搜索-分页-加载联动。
- 需要跨页保留勾选时必须提供 `tableProps.rowKey`。
- 如要显示默认新增按钮，不要同时提供 `header-actions` 插槽。
- 搜索表单扩展操作（导出/快捷筛选）优先放 `actions-after-reset` 插槽，不改动核心结构。
