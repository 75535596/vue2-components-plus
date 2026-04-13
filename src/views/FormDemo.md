# NsForm / NsFormTitle 使用说明（面向 AI 代码生成）

本文档只描述当前仓库已经实现的表单能力，目的是让 AI 生成的代码能够直接贴进项目运行，而不是发明不存在的字段或方法。

## 1. 组件关系

| 模块 | 路径 | 作用 |
|---|---|---|
| `NsForm` | `packages/components/NsForm/DynamicForm.vue` | 动态字段渲染器 |
| `NsFormTitle` | `packages/components/NsForm/DynamicFormTitle.vue` | 分组标题容器 |
| `FormFieldRenderer` | `packages/components/NsForm/FormFieldRenderer.js` | 单字段组件渲染器 |
| 导出入口 | `packages/components/NsForm/index.js` | 组件与工具函数导出 |

## 2. 使用定位

- 外层业务页面通常仍然要写 `el-form`
- `NsForm` 负责渲染字段和表单项
- 校验由外层 `el-form` + 内层自动生成的 `el-form-item` 共同完成
- 数据源核心是 `rows`

## 3. 快速示例

```vue
<template>
  <el-form ref="shellForm" :model="state">
    <NsFormTitle title="基础信息">
      <NsForm
        ref="formRef"
        :rows="state.rows"
        formPropKey="rows"
        model="vertical"
        :labelPosition="labelPosition"
        labelWidth="120"
        gapH="16px"
        gapV="12px"
      />
    </NsFormTitle>
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue'

const formRef = ref(null)
const labelPosition = ref('left')

const state = reactive({
  rows: [
    [
      {
        key: 'name',
        label: '姓名',
        value: '',
        component: 'ElInput',
        params: {
          clearable: true,
        },
      },
      {
        key: 'age',
        label: '年龄',
        value: '',
        component: 'ElInput',
        params: {
          'v-length.range': { min: 1, max: 120, int: true },
        },
      },
    ],
  ],
})
</script>
```

## 4. `NsForm` Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `model` | `String` | `''` | 布局模式，包含 `vertical` 或 `table` 时生效 |
| `readOnly` | `Boolean` | `false` | 是否进入只读展示 |
| `labelWidth` | `String` | `'80px'` | 普通标签宽度 |
| `superLabelWidth` | `String` | `'30px'` | 分组父标签宽度 |
| `labelColor` | `String` | `'#0A7BFF'` | 标签颜色 |
| `gapH` | `String` | `'10px'` | 列间距，支持 `20` / `20px` / `1rem` |
| `gapV` | `String` | `'10px'` | 行间距，支持 `20` / `20px` / `1rem` |
| `height` | `String` | `'32px'` | 值区最小高度 |
| `rows` | `Array` | `[]` | 动态字段配置 |
| `backgroundColor` | `String` | `''` | 字段背景色 |
| `valueEmptyTag` | `String` | `'--'` | 空值占位 |
| `formPropKey` | `String` | `'rows'` | 生成内部 `el-form-item.prop` 的前缀 |
| `hasPoint` | `Boolean` | `false` | 是否统一显示红色星号 |
| `labelPosition` | `String` | `'right'` | 标签方向，支持 `left / top / right`(默认 `right`) |

### 4.1 `labelPosition` 说明

- 该属性控制的是 `NsForm` 自己渲染的标签布局，不是外层 `el-form-item` 的标签布局
- 支持值为 `left`、`top`、`right`
- 默认值是 `left`
- 当使用 `top` 时，标签会显示在字段内容上方

### 4.2 `gapH / gapV` 单位说明

- `gapH`、`gapV` 传纯数字字符串时会自动补成 `px`，例如 `gapH="20"`、`gapV="20"`
- 也支持直接传带单位值，例如 `20px`、`1rem`、`10%`
- 列宽计算已按 `gap` 总量精确分配，`gapH="0"` 和 `gapH="0px"` 都可正常铺满

## 5. `rows` 数据结构

### 5.1 总体结构

`rows` 是二维数组：

```js
const rows = [
  [fieldA, fieldB],
  [fieldC],
]
```

- 第一层数组表示“行”
- 第二层数组表示“当前行中的字段”
- 每个字段节点都可以是普通字段，也可以是带 `children` 的分组字段

### 5.2 字段节点 `Field`

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `key` | `String` | 强烈建议必填 | 字段唯一键，数据读写都依赖它 |
| `label` | `String` | 否 | 标签文本 |
| `value` | `Any` | 否 | 当前值 |
| `defaultValue` | `Any` | 否 | 重置时回退值；不传时首次以当前 `value` 快照为默认值 |
| `component` | `String \| Component` | 否 | 字段组件，例如 `ElInput` |
| `params` | `Object` | 否 | 透传给组件的配置对象 |
| `events` | `Object` | 否 | 透传给组件的事件对象 |
| `slots` | `Object` | 否 | 透传给组件的插槽函数 |
| `style` | `Object` | 否 | 组件样式 |
| `required` | `Boolean` | 否 | 显式必填标记 |
| `hideLabel` | `Boolean` | 否 | 是否隐藏标签 |
| `span` | `Number \| String` | 否 | 宽度配置 |
| `children` | `Array<Field>` | 否 | 分组字段 |
| `valueEmptyTag` | `String` | 否 | 当前字段空值占位 |
| `readOnlyUseComponent` | `Boolean` | 否 | 只读时是否仍渲染组件而不是文本 |
| `delValue` | `Array` | 否 | 上传删除记录等扩展数据 |
| `ref` | `Any` | 自动写入 | 渲染完成后自动记录组件实例 |

## 6. `span` 布局规则

| `span` 值 | 当前实现行为 |
|---|---|
| `0` | 当前字段隐藏 |
| `1 ~ 24` | 按 24 栅格换算宽度 |
| `> 24` 的数字 | 视为像素宽度 |
| `'50%'` 这类百分比字符串 | 直接按百分比宽度渲染 |
| 不传 | 当前行所有非隐藏字段均分宽度 |

## 7. `params` 的特殊约定

`params` 不是简单透传，它有几类保留键。

| 键 | 当前实现 |
|---|---|
| `rules` | 给外层 `el-form-item` 使用 |
| `style` | 与 `field.style` 合并 |
| `options` | `ElSelect` / `ElRadioGroup` / `ElCheckboxGroup` 生成选项 |
| `v-*` | 生成指令，例如 `v-length.range` |

### 7.1 指令透传示例

```js
{
  key: 'age',
  component: 'ElInput',
  params: {
    'v-length.range': { min: 1, max: 120, int: true },
  },
}
```

### 7.2 `options` 生成规则

以下组件会根据 `params.options` 自动渲染子选项：

- `ElSelect`
- `ElRadioGroup`
- `ElCheckboxGroup`

每个选项结构为：

```js
{ label: '启用', value: 1, disabled: false }
```

## 8. 插槽与事件机制

### 8.1 插槽

`NsForm` 本体没有组件级插槽，插槽要写在字段节点的 `slots` 里。

```js
field.slots = {
  default: ({ field, value }) => h('span', value),
  tip: () => h('div', '上传说明'),
}
```

当前签名会收到：

| 参数 | 说明 |
|---|---|
| `field` | 当前字段配置对象 |
| `value` | 当前字段值 |

### 8.2 事件

- `field.events` 会透传到组件
- 对非上传组件，`input` 事件会被包装：
  - 先更新 `field.value`
  - 再执行你自己写的 `events.input`
- 上传组件 `ElUpload` 不会自动注入 `value` prop

## 9. 只读模式真实行为

当 `readOnly=true` 且字段未设置 `readOnlyUseComponent` 时，字段会改为文本展示。

### 9.1 文本展示优先级

1. `field.params.formatter(field.value, field)`
2. 上传组件：拼接文件名
3. `ElSwitch`：显示 `activeText / inactiveText` 或 `是 / 否`
4. 选择类组件：根据 `params.options` 反查 label
5. `ElCascader`：根据层级 options 解析路径文本
6. 普通数组：使用中文逗号连接
7. 普通值：直接显示
8. 空值：显示 `field.valueEmptyTag` 或全局 `valueEmptyTag`

### 9.2 AI 生成代码注意

- 只读展示有特殊格式需求时，优先写 `params.formatter`
- 想在只读态仍保留控件外观，显式设置 `readOnlyUseComponent: true`

## 10. 实例方法

通过 `ref="formRef"` 可调用以下方法。

| 方法 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `getFormKvData()` | - | `Object` | 提取全部字段键值 |
| `resetForm(triggerEvents=false)` | `Boolean` | `void` | 重置为默认值 |
| `setFormData(data)` | `Object` | `void` | 按 key 回填 |
| `getFormNodeByKey(key)` | `String` | `Field \| null` | 获取字段节点 |
| `getFormNodeRefByKey(key)` | `String` | `Any` | 获取字段组件实例 |
| `initDefaultValues()` | - | `void` | 为尚未定义 `defaultValue` 的字段补齐默认值快照 |

### 10.1 关键细节

- `getFormKvData()` 会把上传字段的 `value + delValue` 合并后返回
- `resetForm(true)` 只在值真实变化时触发字段的 `events.change` 与 `events.input`
- `resetForm()` 会清空 `delValue`
- 如果字段 `params.fileList` 是数组，`resetForm()` 会同步清空它
- `setFormData(data)` 对 `ElCascader` 的逗号字符串会自动拆成数组
- `setFormData(data)` 对上传组件会同步写入 `params.fileList`

### 10.2 `initDefaultValues()` 的真实限制

这一点必须写清楚，否则 AI 很容易误用。

- 它不会强制覆盖已有 `defaultValue`
- 它的作用是“补齐缺失的默认值快照”
- 如果你想重新定义默认值，应手动修改字段上的 `defaultValue`

## 11. `NsFormTitle`

### 11.1 Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `String` | `''` | 标题文本 |

### 11.2 插槽

| 插槽 | 说明 |
|---|---|
| `title` | 自定义标题区 |
| `default` | 承载 `NsForm` 或其它内容 |

## 12. 导出能力

`packages/components/NsForm/index.js` 还导出了下面这些工具函数。

| 导出项 | 说明 |
|---|---|
| `getAllFormKvData(rows)` | 不依赖组件实例，直接从 `rows` 取值 |
| `getAllFormNodeByKey(rows, key)` | 从 `rows` 查字段节点 |
| `getAllFormNodeRefByKey(rows, key)` | 从 `rows` 查字段 ref |
| `useFileUpload` | 上传辅助 hook |

另外，`NsForm.install` 会顺带注册 directives，因此单独安装 `NsForm` 时也能使用 `v-sline`、`v-length` 等表单相关指令。

## 13. Demo 应覆盖的能力

`src/views/FormDemo.vue` 建议覆盖以下类型，AI 生成页面时也应尽量齐全：

| 场景 | 建议能力 |
|---|---|
| 基础字段 | `ElInput`、`ElSelect`、`ElSwitch` |
| 分组字段 | `children` |
| 上传字段 | `value + params.fileList + delValue` |
| 联动字段 | `events.change` |
| 只读切换 | `readOnly` + `params.formatter` |
| 标签方向 | `labelPosition` 在 `left / top / right` 间切换 |
| 数据操作 | `getFormKvData / setFormData / resetForm` |
| 节点访问 | `getFormNodeByKey / getFormNodeRefByKey` |

## 14. AI 生成代码规则

- 页面外层始终使用 `el-form`
- 每个字段都尽量提供稳定 `key`
- 选项类组件统一使用 `params.options`
- 自定义指令统一放在 `params['v-xxx']`
- 上传场景必须同步维护 `value` 和 `params.fileList`
- 联动逻辑优先写在 `field.events.change`
- 需要控制标签方向时，优先使用 `NsForm.labelPosition`，不要依赖外层 `el-form` 的 `label-position`
- 不要把 `initDefaultValues()` 当成“强制重建全部默认值”的方法

## 15. 推荐 Prompt

```text
请生成 Vue2.7 + script setup 的 NsForm 页面，要求：
1) 外层使用 el-form；
2) rows 至少包含普通输入、选择项、children 分组、上传字段、联动字段；
3) 每个字段遵循 key、label、value、component、params、events 结构；
4) 演示 params.options、params.rules、params.formatter、params['v-length.range']；
5) 演示 getFormKvData、setFormData、resetForm(true)、getFormNodeByKey、getFormNodeRefByKey；
6) 演示 readOnly 与 labelPosition(left/top/right) 切换；
7) 代码风格与当前仓库一致，不使用 TS，不虚构不存在的方法。
```

## 16. 标准模板

```vue
<template>
  <el-form ref="shellForm" :model="state">
    <NsFormTitle title="基础信息">
      <NsForm
        ref="formRef"
        :rows="state.rows"
        formPropKey="rows"
        model="vertical"
        :readOnly="readOnly"
        :labelPosition="labelPosition"
        labelWidth="120"
        gapH="16"
        gapV="12"
      />
    </NsFormTitle>

    <div style="margin-top: 20px;">
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button @click="fillData">回填</el-button>
      <el-button @click="resetForm">重置</el-button>
      <el-button @click="toggleReadonly">切换只读</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { reactive, ref, nextTick } from 'vue'

const shellForm = ref(null)
const formRef = ref(null)
const readOnly = ref(false)
const labelPosition = ref('left')

const state = reactive({
  rows: [
    [
      {
        key: 'name',
        label: '姓名',
        value: '',
        component: 'ElInput',
        params: {
          clearable: true,
          rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        },
      },
      {
        key: 'age',
        label: '年龄',
        value: '',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 1, max: 120, int: true },
        },
      },
    ],
    [
      {
        key: 'status',
        label: '状态',
        value: 1,
        component: 'ElSelect',
        params: {
          clearable: true,
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 },
          ],
          formatter: (value) => (value === 1 ? '启用' : '禁用'),
        },
      },
      {
        key: 'avatar',
        label: '头像',
        value: [],
        component: 'ElUpload',
        params: {
          action: '#',
          autoUpload: false,
          fileList: [],
        },
      },
    ],
  ],
})

const submit = async () => {
  await shellForm.value.validate()
  console.log(formRef.value.getFormKvData())
}

const fillData = () => {
  formRef.value.setFormData({
    name: '张三',
    age: '28',
    status: 1,
    avatar: [{ name: '头像.png', url: 'https://example.com/avatar.png' }],
  })
}

const resetForm = () => {
  formRef.value.resetForm(true)
  nextTick(() => {
    shellForm.value.clearValidate()
  })
}

const toggleReadonly = () => {
  readOnly.value = !readOnly.value
}
</script>
```
