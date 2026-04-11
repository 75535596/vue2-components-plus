# NsForm / NsFormTitle 使用说明（面向 AI 代码生成）

本文档覆盖 `NsForm`、`NsFormTitle`、字段模型、事件、方法与常见模式，便于 AI 直接生成高质量业务表单代码。

## 1. 组件与入口

- `NsForm`：`packages/components/NsForm/DynamicForm.vue`
- `NsFormTitle`：`packages/components/NsForm/DynamicFormTitle.vue`
- 字段渲染器：`packages/components/NsForm/FormFieldRenderer.js`
- 导出入口：`packages/components/NsForm/index.js`

## 2. 快速示例

```vue
<template>
  <el-form ref="shellForm" :model="state" label-position="top">
    <NsFormTitle title="基础信息">
      <NsForm
        ref="formRef"
        :rows="state.rows"
        formPropKey="rows"
        model="vertical"
        :readOnly="false"
        labelWidth="120"
        gapH="16px"
        gapV="12px"
      />
    </NsFormTitle>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
const formRef = ref()
const state = reactive({
  rows: [
    [
      { key: 'name', label: '姓名', value: '', component: 'ElInput', params: { clearable: true } },
      { key: 'age', label: '年龄', value: '', component: 'ElInput', params: { 'v-length.range': { min: 1, max: 120, int: true } } },
    ],
  ],
})
</script>
```

## 3. `NsForm` 属性（完整）

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `model` | `String` | `''` | 布局模式，支持包含 `vertical` / `table` |
| `readOnly` | `Boolean` | `false` | 只读模式，表单项转文本展示 |
| `labelWidth` | `String` | `'80px'` | 标签宽度 |
| `superLabelWidth` | `String` | `'30px'` | 分组父标签宽度 |
| `labelColor` | `String` | `'#0A7BFF'` | 标签颜色 |
| `gapH` | `String` | `'10px'` | 列间距 |
| `gapV` | `String` | `'10px'` | 行间距 |
| `height` | `String` | `'32px'` | 值区最小高度 |
| `rows` | `Array` | `[]` | 动态字段结构（核心） |
| `backgroundColor` | `String` | `''` | 字段背景色 |
| `valueEmptyTag` | `String` | `'--'` | 空值占位文案 |
| `formPropKey` | `String` | `'rows'` | 生成 el-form-item `prop` 前缀 |
| `hasPoint` | `Boolean` | `false` | 是否统一显示必填星号 |

## 4. 字段模型（`rows`）规范

`rows` 结构：`Array<Row>`，`Row = Array<Field>`

### 4.1 Field 常用字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `key` | `String` | 建议必填 | 字段唯一 key，数据收集/回填依据 |
| `label` | `String` | 否 | 标签文本 |
| `value` | `Any` | 否 | 当前值 |
| `defaultValue` | `Any` | 否 | 默认值；不传则首次以 `value` 作为默认 |
| `component` | `String \| Component` | 否 | 渲染组件，如 `ElInput`/自定义组件 |
| `params` | `Object` | 否 | 透传 props（会过滤 `rules/style/options/v-*`） |
| `events` | `Object` | 否 | 透传事件 |
| `slots` | `Object<slotName, fn>` | 否 | 透传插槽内容 |
| `style` | `Object` | 否 | 当前控件样式 |
| `required` | `Boolean` | 否 | 强制必填标识 |
| `hideLabel` | `Boolean` | 否 | 隐藏标签 |
| `span` | `Number \| String` | 否 | 宽度；`24`栅格、像素、百分比均可 |
| `children` | `Array<Field>` | 否 | 子项分组模式 |
| `valueEmptyTag` | `String` | 否 | 当前字段空值占位 |
| `readOnlyUseComponent` | `Boolean` | 否 | 只读时仍渲染组件 |
| `delValue` | `Array` | 否 | 删除文件等扩展数据，收集时合并 |
| `ref` | `Any` | 自动写入 | 渲染后自动回写字段组件实例 |

### 4.2 `params` 特殊约定

| 键 | 说明 |
|---|---|
| `rules` | 表单校验规则（给 `el-form-item`） |
| `options` | `ElSelect/ElRadioGroup/ElCheckboxGroup` 选项源 |
| `style` | 控件样式，会与 `field.style` 合并 |
| `v-*` | 指令透传，如 `v-length.range` |

## 5. 支持的插槽

`NsForm` 本体没有组件级插槽；插槽通过 `field.slots` 下发给具体控件。

```js
field.slots = {
  default: () => h('div', '自定义上传触发区'),
  tip: () => h('div', { class: 'el-upload__tip' }, '上传说明'),
}
```

## 6. 事件机制

- 字段事件来自 `field.events`，全部透传到控件。
- `input` 事件会被包装：先更新 `field.value`，再调用你的原事件。
- 上传组件（`ElUpload`）不自动注入 `value`，需要通过上传事件维护列表。

## 7. 实例方法（`ref` 可调用）

| 方法 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `getFormKvData()` | - | `Object` | 获取全部 key-value |
| `resetForm(triggerEvents=false)` | `Boolean` | `void` | 重置为默认值，必要时触发 change/input |
| `setFormData(data)` | `Object` | `void` | 按 key 回填 |
| `getFormNodeByKey(key)` | `String` | `Field \| null` | 找字段配置节点 |
| `getFormNodeRefByKey(key)` | `String` | `Any` | 找字段组件实例 |
| `initDefaultValues()` | - | `void` | 重新初始化默认值 |

## 8. `NsFormTitle` 属性与插槽

### 8.1 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `String` | `''` | 标题文本 |

### 8.2 插槽

| 插槽 | 作用 |
|---|---|
| `title` | 自定义标题头 |
| `default` | 承载表单内容 |

## 9. 导出工具函数（`NsForm/index.js`）

| 函数 | 说明 |
|---|---|
| `getAllFormKvData(rows)` | 从 rows 直接提取全部值 |
| `getAllFormNodeByKey(rows, key)` | 从 rows 查找字段节点 |
| `getAllFormNodeRefByKey(rows, key)` | 从 rows 查找字段 ref |
| `useFileUpload` | 上传辅助 hook |

## 10. AI 生成代码建议

- 业务页面外层始终使用 `el-form` 包裹，`NsForm` 负责字段渲染，`el-form` 负责统一校验触发。
- 上传场景同时维护 `value` + `params.fileList` + `delValue`，否则回显和删除记录会不一致。
- 复杂联动用 `field.events.change` 动态增删 `rows` 节点，再 `nextTick` 回填。
- 只读展示有格式需求时优先使用 `params.formatter`。

## 11. Demo 功能映射（`src/views/FormDemo.vue`）

当前 Demo 里新增的扩展操作已对应到以下能力：

| 按钮/场景 | 对应能力 |
|---|---|
| 获取表单数据 | `getFormKvData()` + 外层 `el-form.validate` |
| 模拟详情回填 | `setFormData(data)` |
| 重置表单 | `resetForm(triggerEvents)` |
| 查看节点配置 | `getFormNodeByKey(key)` |
| 查看节点实例 | `getFormNodeRefByKey(key)` |
| 重建默认值快照 | `initDefaultValues()` |
| 切换只读 | `readOnly` + `readOnlyUseComponent` |
| 触发自定义事件 | 通过 `emit('btnClick', payload)` 给外层容器 |

并且 `rows` 已示例 `children` 分组字段结构，可直接按该模式扩展复杂分组表单。
