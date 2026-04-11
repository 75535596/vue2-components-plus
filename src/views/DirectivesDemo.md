# 自定义指令使用说明（`v-sline` / `v-length` / `v-permission` / `v-event-unuse` / `v-event-use`）

本文档对应 `packages/directives/index.js` 的当前实现，适合 AI 直接生成指令使用代码。

## 1. 注册方式

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

## 2. `v-sline`：单行省略

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

## 3. `v-length`：输入限制（核心）

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

## 4. `v-permission`：权限控制

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

## 5. `v-event-unuse` / `v-event-use`：事件穿透控制

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

## 6. AI 生成代码建议

- 生成表单时，数值输入优先使用 `v-length.range`，避免后端收到非法文本。
- 权限控制推荐统一规范：按钮必须有稳定 `id` 或权限 class。
- `v-permission` 是插入时计算，不会自动响应权限数组变化；权限切换后需刷新或重渲染。
- 对中文输入场景，不要用简单 `substring` 替代 `v-length`，否则会破坏输入体验。
