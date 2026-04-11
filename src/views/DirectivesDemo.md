# 自定义指令使用说明（`v-sline` / `v-length` / `v-permission` / `v-event-unuse` / `v-event-use`）

本文档严格对应 `packages/directives/index.js` 的当前实现，重点是帮助 AI 生成“可运行、不过度脑补、行为符合源码”的 Vue2 页面代码。

## 1. 入口与注册方式

当前仓库的所有自定义指令都定义在同一个文件中：

| 入口 | 路径 |
|---|---|
| 指令注册函数 | `packages/directives/index.js` |
| 导出函数 | `registerDirective(Vue)` |

推荐注册方式有两种。

### 1.1 安装整库插件

```js
import Vue from 'vue'
import Vue2ComponentsPlus from 'vue2-components-plus'

Vue.use(Vue2ComponentsPlus)
```

### 1.2 在源码环境中单独注册

```js
import Vue from 'vue'
import { registerDirective } from '../../packages/directives'

registerDirective(Vue)
```

## 2. 指令总览

| 指令 | 作用 | 是否有修饰符 |
|---|---|---|
| `v-sline` | 单行省略 | 否 |
| `v-length` | 输入限制 | 是 |
| `v-permission` | 权限显示控制 | 是 |
| `v-event-unuse` | 禁用指针事件 | 否 |
| `v-event-use` | 恢复指针事件 | 否 |

## 3. `v-sline`

### 3.1 作用

绑定后会直接给元素写入以下样式：

- `white-space: nowrap`
- `overflow: hidden`
- `text-overflow: ellipsis`
- `display: inline-block`
- `max-width: 100%`

### 3.2 用法

```vue
<span v-sline>{{ longText }}</span>
```

### 3.3 适用场景

- 表格单元格长文本
- 只读详情页文本
- 表单只读态字段展示

## 4. `v-length`

`v-length` 是当前指令里最核心的一个。它会监听 `input`、`compositionstart`、`compositionend`，对中文输入法场景友好，不会在拼音组合输入过程中强行截断。

### 4.1 绑定目标

- 可以直接绑在原生 `input` / `textarea`
- 也可以绑在组件根节点，内部会自动寻找 `input, textarea`
- 对 `Element UI` 的 `el-input` 可直接使用

### 4.2 基础写法

```vue
<el-input v-model="form.name" v-length="20" />
```

含义：最多 20 个字符。

### 4.3 修饰符

| 修饰符 | 说明 |
|---|---|
| `.number` | 仅允许数字、首位负号、一个小数点 |
| `.regex` | 按正则逐字符校验 |
| `.range` | 数值范围约束，可配合 `int: true` 实现整数模式 |

### 4.4 `binding.value` 配置结构

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `maxLength` | `Number` | `50` | 最大长度 |
| `pattern` | `RegExp` | `null` | `.regex` 模式使用 |
| `min` | `Number` | `null` | `.range` 最小值 |
| `max` | `Number` | `null` | `.range` 最大值 |
| `int` | `Boolean` | `false` | `.range` 时是否仅允许整数 |

### 4.5 典型写法

```vue
<el-input v-model="form.mobile" v-length.number="11" />
<el-input v-model="form.code" v-length.regex="{ maxLength: 6, pattern: /^[A-Z0-9]*$/ }" />
<el-input v-model="form.score" v-length.range="{ min: 0, max: 100 }" />
<el-input v-model="form.age" v-length.range="{ min: 1, max: 120, int: true, maxLength: 3 }" />
```

### 4.6 当前实现的真实行为

- 值被修正后，会主动派发一次原生 `input` 事件，确保 `v-model` 同步
- `.number` 允许负号和小数点，不会自动限制为正整数
- `.range` 超出范围时会直接钳制到边界值
- `.range + int: true` 时只允许整数，是否允许负号取决于 `min < 0`
- `.regex` 是“逐字符累积校验”，`pattern` 必须允许中间态

### 4.7 `.regex` 模式注意事项

为了让 AI 生成稳定代码，必须遵守下面两点：

- 正则不要使用全局 `g` 修饰符
- 正则应允许中间输入状态，例如验证码可写成 `^[A-Z0-9]*$`，不要写必须一次成型的表达式

## 5. `v-permission`

### 5.1 权限来源

权限列表读取顺序如下：

1. `sessionStorage.getItem('btnsPermission')`
2. `localStorage.getItem('btnsPermission')`
3. 默认空数组

权限数据要求是 JSON 数组，每个元素是字符串。

```js
sessionStorage.setItem('btnsPermission', JSON.stringify(['add_btn', 'export_btn', 'admin-btn']))
```

### 5.2 匹配模式

| 写法 | 匹配依据 |
|---|---|
| `v-permission` | 按元素 `id` 匹配 |
| `v-permission.id` | 按元素 `id` 匹配 |
| `v-permission.class` | 按元素 `classList` 匹配 |

### 5.3 无权限时的表现

| 写法 | 无权限效果 |
|---|---|
| `v-permission` / `v-permission.id` | `visibility: hidden` 且 `pointer-events: none` |
| `v-permission.display` / `v-permission.id.display` / `v-permission.class.display` | `display: none` |

### 5.4 示例

```vue
<el-button id="add_btn" v-permission type="primary">新增</el-button>
<el-button id="export_btn" v-permission.id.display>导出</el-button>
<el-button class="admin-btn" v-permission.class>管理员入口</el-button>
```

### 5.5 当前实现限制

- 权限只在 `inserted` 时检查一次，不会自动响应后续权限数据变化
- 如果权限列表改变，需要刷新页面或重新渲染元素
- 使用 `id` 模式时，元素必须真的写上稳定 `id`
- 使用 `class` 模式时，匹配逻辑是“权限值是否存在于当前元素 classList 中”

## 6. `v-event-unuse` / `v-event-use`

### 6.1 行为

| 指令 | 结果 |
|---|---|
| `v-event-unuse` | `pointer-events: none` |
| `v-event-use` | `pointer-events: auto` |

### 6.2 典型组合

```vue
<div v-event-unuse>
  <div v-event-use @click="handleChildClick">子区域恢复交互</div>
</div>
```

### 6.3 适合场景

- 蒙层区域透传点击
- 父容器禁用交互、局部按钮恢复交互
- 自定义卡片覆盖层

## 7. Demo 覆盖内容

`src/views/DirectivesDemo.vue` 建议覆盖以下几类能力，AI 生成页面时也应尽量完整体现：

| 模块 | 建议覆盖点 |
|---|---|
| 省略 | 固定宽度容器中的长文本 |
| 输入限制 | 普通限长、数字、正则、区间、整数区间 |
| 权限 | `id` 模式、`class` 模式、`display` 模式 |
| 事件穿透 | 父级禁用、子级恢复 |

## 8. AI 生成代码规则

- `v-length` 优先用在 `el-input` 上，不要自己重复造截断逻辑
- 数值输入优先使用 `v-length.range`
- 权限按钮必须显式写 `id` 或稳定 class
- `.regex` 模式下不要使用带 `g` 的正则
- `v-permission` 不会自动响应权限切换，页面中不要假设它是响应式权限系统
- `v-event-unuse` / `v-event-use` 只控制鼠标交互，不处理键盘焦点逻辑

## 9. 推荐 Prompt

```text
请生成一个 Vue2.7 页面，集中演示当前项目的 v-sline、v-length、v-permission、v-event-unuse、v-event-use，要求：
1) v-length 覆盖普通限长、number、regex、range、range+int；
2) 给出 sessionStorage.btnsPermission 的模拟注入代码；
3) v-permission 同时演示 id、class、display 三种写法；
4) 演示父级禁用事件、子级恢复事件；
5) 使用 Element UI 的 ElInput、ElButton、ElCard；
6) 不使用 TS，不虚构不存在的指令参数。
```

## 10. 标准模板

```vue
<template>
  <div style="padding: 20px;">
    <el-card shadow="never">
      <div style="width: 220px; margin-bottom: 16px;">
        <span v-sline>{{ longText }}</span>
      </div>

      <el-form label-width="140px">
        <el-form-item label="普通限长">
          <el-input v-model="form.normal" v-length="10" />
        </el-form-item>

        <el-form-item label="数字限长">
          <el-input v-model="form.mobile" v-length.number="11" />
        </el-form-item>

        <el-form-item label="正则校验">
          <el-input v-model="form.code" v-length.regex="{ maxLength: 6, pattern: /^[A-Z0-9]*$/ }" />
        </el-form-item>

        <el-form-item label="数值范围">
          <el-input v-model="form.score" v-length.range="{ min: 0, max: 100 }" />
        </el-form-item>

        <el-form-item label="整数范围">
          <el-input v-model="form.age" v-length.range="{ min: 1, max: 120, int: true, maxLength: 3 }" />
        </el-form-item>
      </el-form>

      <div style="margin-top: 16px;">
        <el-button id="add_btn" v-permission type="primary">新增</el-button>
        <el-button id="export_btn" v-permission.id.display>导出</el-button>
        <el-button class="admin-btn" v-permission.class>管理员入口</el-button>
      </div>

      <div v-event-unuse style="margin-top: 16px; padding: 16px; border: 1px solid #ebeef5;">
        <div v-event-use style="display: inline-block;" @click="handleChildClick">
          点我恢复交互
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const longText = ref('这是一段很长很长的文本，用于演示单行省略效果。')

const form = reactive({
  normal: '',
  mobile: '',
  code: '',
  score: '',
  age: '',
})

const handleChildClick = () => {
  console.log('子区域点击生效')
}

onMounted(() => {
  sessionStorage.setItem('btnsPermission', JSON.stringify(['add_btn', 'admin-btn']))
})
</script>
```
