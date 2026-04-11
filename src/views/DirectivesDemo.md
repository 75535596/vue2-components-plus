# 自定义指令使用说明（`v-sline` / `v-length` / `v-permission` / `v-event-unuse` / `v-event-use`）

本文档对应 `packages/directives/index.js` 的当前实现，适合 AI 直接生成指令使用代码。

## 1. 组件与入口

| 组件/入口 | 路径 |
|---|---|
| 主入口 | `packages/directives/index.js` |
| 指令实现 | `packages/directives/directives/` |
| 注册插件 | `packages/directives/index.js` 导出 `Vue2ComponentsPlus` 插件 |

注册方式见下方第 2 节。

推荐方式是安装组件库插件，指令会自动注册：

```js
import Vue from 'vue'
import Vue2ComponentsPlus from 'vue2-components-plus'

Vue.use(Vue2ComponentsPlus)
```

如果你在本仓库源码环境里单独注册指令，可使用：

```js
import { registerDirective } from '../../packages/directives'
registerDirective(Vue)
```

## 2. v-sline：单行省略

### 2.1 作用

- 自动设置：
  - `white-space: nowrap`
  - `overflow: hidden`
  - `text-overflow: ellipsis`
  - `display: inline-block`
  - `max-width: 100%`

### 2.2 用法

```vue
<span v-sline>{{ longText }}</span>
```

### 2.3 参数/修饰符

- 无参数，无修饰符。

## 3. v-length：输入限制（核心）

`v-length` 通过监听 input/composition 事件限制输入内容，兼容中文输入法（组合输入阶段不截断）。

### 3.1 基础模式

```vue
<el-input v-model="name" v-length="20" />
```

- 含义：最多 20 字符。

### 3.2 支持的修饰符

| 修饰符 | 说明 |
|---|---|
| `.number` | 仅允许数字（可负号、小数点，长度限制） |
| `.regex` | 按正则逐字符校验 |
| `.range` | 数值范围限制，支持整数模式 |

### 3.3 `binding.value` 结构

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `maxLength` | `Number` | `50` | 最大输入长度 |
| `pattern` | `RegExp` | `null` | `.regex` 使用 |
| `min` | `Number` | `null` | `.range` 最小值 |
| `max` | `Number` | `null` | `.range` 最大值 |
| `int` | `Boolean` | `false` | `.range` 下是否仅整数 |

### 3.4 示例

```vue
<el-input v-model="mobile" v-length.number="11" />
<el-input v-model="code" v-length.regex="{ maxLength: 6, pattern: /^[A-Z0-9]*$/ }" />
<el-input v-model="score" v-length.range="{ min: 0, max: 100 }" />
<el-input v-model="age" v-length.range="{ min: 1, max: 120, int: true, maxLength: 3 }" />
```

### 3.5 行为细节

- 绑定元素可为原生 `input/textarea`，也可为组件根节点（内部自动查找 input）。
- 值被修正后会主动触发一次 `input` 事件，确保 `v-model` 同步。
- `.range` 超出范围时会直接裁剪到边界值。
- `.number` 允许负号和小数点；如需仅整数请用 `.range` 且 `int: true`。
- `.regex` 是按"逐字符"检查，`pattern` 需允许中间态（例如 `^[A-Z0-9]*$`）。

## 4. v-permission：权限控制

权限来源：`sessionStorage.btnsPermission`，若无则读 `localStorage.btnsPermission`。

### 4.1 匹配模式

| 写法 | 匹配依据 |
|---|---|
| `v-permission` / `v-permission.id` | 元素 `id` 是否在权限列表中 |
| `v-permission.class` | 元素 classList 是否包含权限项 |

### 4.2 无权限表现

| 修饰符 | 行为 |
|---|---|
| 默认 | `visibility:hidden` + `pointer-events:none` |
| `.display` | `display:none` |

### 4.3 示例

```vue
<el-button id="add_btn" v-permission>新增</el-button>
<el-button id="export_btn" v-permission.id.display>导出</el-button>
<el-button class="admin-btn" v-permission.class>管理员入口</el-button>
```

## 5. v-event-unuse / v-event-use：事件穿透控制

### 5.1 行为

| 指令 | 效果 |
|---|---|
| `v-event-unuse` | `pointer-events: none` |
| `v-event-use` | `pointer-events: auto` |

### 5.2 示例

```vue
<div v-event-unuse>
  父区域不可交互
  <div v-event-use>子区域恢复交互</div>
</div>
```

## 6. v-permission 权限数据来源

权限数据存储在 `sessionStorage.btnsPermission`（优先）或 `localStorage.btnsPermission`。

数据结构为 JSON 数组，元素为权限标识字符串。

```js
// 权限注入示例
sessionStorage.setItem('btnsPermission', JSON.stringify(['add_btn', 'edit_btn', 'delete_btn', 'admin-btn']))

// 检查权限的匹配逻辑
// v-permission / v-permission.id → 匹配元素 id
// v-permission.class → 匹配元素 classList
```

## 7. AI 生成代码建议

- 生成表单时，数值输入优先使用 `v-length.range`，避免后端收到非法文本。
- 权限控制推荐统一规范：按钮必须有稳定 `id` 或权限 class。
- `v-permission` 是插入时计算，不会自动响应权限数组变化；权限切换后需刷新或重渲染。
- 对中文输入场景，不要用简单 `substring` 替代 `v-length`，否则会破坏输入体验。

## 8. AI 代码生成提示词（Prompt）

```text
请生成一个 Vue2 页面，集中演示 v-sline、v-length、v-permission、v-event-unuse、v-event-use：
1) v-length 同时覆盖 number/regex/range(int) 三种模式；
2) 给出 sessionStorage.btnsPermission 的模拟注入代码；
3) 演示无权限时 visibility:hidden 与 display:none 两种效果；
4) 演示父级禁用事件、子级恢复事件；
5) 代码可直接运行，使用 Element UI 的 ElInput/ElButton。
6) v-permission 同时演示 id 模式和 class 模式。
```

## 9. 标准代码模板（AI 可直接参考）

```vue
<template>
  <div style="padding: 20px;">
    <!-- 1. v-sline：单行省略 -->
    <div style="width: 200px;">
      <span v-sline>这是一段非常长的文本，超出宽度会自动省略</span>
    </div>

    <!-- 2. v-length：各种输入限制 -->
    <el-form label-width="120px">
      <el-form-item label="普通限长(10位)">
        <el-input v-model="form.normal" v-length="10" />
      </el-form-item>
      
      <el-form-item label="数字限长(11位)">
        <el-input v-model="form.phone" v-length.number="11" />
      </el-form-item>

      <el-form-item label="字母数字(6位)">
        <el-input v-model="form.code" v-length.regex="{ maxLength: 6, pattern: /^[A-Z0-9]*$/ }" />
      </el-form-item>

      <el-form-item label="数值范围(0-100)">
        <el-input v-model="form.score" v-length.range="{ min: 0, max: 100 }" />
      </el-form-item>

      <el-form-item label="整数范围(1-120)">
        <el-input v-model="form.age" v-length.range="{ min: 1, max: 120, int: true }" />
      </el-form-item>
    </el-form>

    <!-- 3. v-permission：权限控制 -->
    <div style="margin-top: 20px;">
      <!-- 默认模式：无权限时 visibility: hidden -->
      <el-button id="add_btn" v-permission type="primary">新增(有权限)</el-button>
      <el-button id="del_btn" v-permission type="danger">删除(无权限则不可见且占位)</el-button>
      
      <!-- display模式：无权限时 display: none -->
      <el-button id="export_btn" v-permission.id.display type="warning">导出(无权限则不占位)</el-button>
      
      <!-- class模式：通过类名匹配 -->
      <el-button class="admin-btn" v-permission.class>管理员专属</el-button>
    </div>

    <!-- 4. v-event-unuse/use：事件穿透 -->
    <div v-event-unuse @click="onParentClick" style="border: 1px solid #ccc; padding: 20px;">
      父级区域（禁用点击）
      <div v-event-use @click="onChildClick" style="background: #eee; padding: 10px;">
        子级区域（恢复点击）
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'

const form = reactive({
  normal: '',
  phone: '',
  code: '',
  score: '',
  age: ''
})

const onParentClick = () => console.log('父级点击（不会触发）')
const onChildClick = (e) => {
  e.stopPropagation() // 阻止冒泡
  console.log('子级点击（会触发）')
}

onMounted(() => {
  // 模拟注入权限
  if (!sessionStorage.getItem('btnsPermission')) {
    sessionStorage.setItem('btnsPermission', JSON.stringify(['add_btn', 'admin-btn']))
  }
})
</script>
```
