# NsDialog 使用说明（面向 AI 代码生成）

本文档严格对应当前仓库实现，目标不是介绍“理想 API”，而是让 AI 和开发者基于现有能力直接生成可运行代码。

## 1. 组件定位

- `NsDialog` 是函数式弹窗工厂，不是通过 `<NsDialog />` 标签直接使用的常规组件。
- 入口文件：`packages/components/NsDialog/index.js`
- 视图实现：`packages/components/NsDialog/NsDialog.vue`
- 调用方式：`window.NsDialog(config, modal?, appendTo?)`
- 支持多实例；所有实例会记录到 `window.__dialogInstances`
- 返回值是实例对象，不是 Promise

## 2. 最小可运行示例

```js
import FormDemo from '@/views/FormDemo.vue'

const instance = window.NsDialog(
  {
    title: '示例弹窗',
    dom: FormDemo,
    option: {
      readOnly: false
    },
    events: {
      btnClick(payload) {
        console.log('收到内容组件事件', payload)
      },
    },
  },
  true,
  '#app',
)
```

## 3. 调用签名

### 3.1 `NsDialog(config, modal, appendTo)`

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `config` | `Object` | - | 弹窗配置对象，必须至少包含 `dom` |
| `modal` | `Boolean` | `true` | 是否显示遮罩 |
| `appendTo` | `String` | `'#app'` | 挂载容器选择器，找不到时回退到 `document.body` |

### 3.2 返回值

如果 `config` 缺失或 `config.dom` 不存在，返回 `false`。正常情况下返回实例对象。

## 4. `config` 字段总表

下表为当前实现实际支持的字段，来源于 `NsDialog.vue` 的 `props` 和 `index.js` 工厂增强逻辑。

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | `String` | 自动生成 | 实例 id |
| `class` | `String` | `''` | 最终映射为内部 `className` |
| `title` | `String` | `''` | 弹窗标题 |
| `width` | `Number \| String` | `500` | 弹窗宽度，数字会补 `px` |
| `height` | `Number \| String` | `''` | 弹窗高度；设置后弹窗 body 使用纵向自适应布局 |
| `dialogPadding` | `Number \| String \| Array` | `-1` | body 内边距；`-1` 表示默认 `16px 20px` |
| `modalColor` | `String` | `rgba(0, 0, 0, 0.45)` | 遮罩颜色 |
| `closeOnClickModal` | `Boolean` | `true` | 点击遮罩是否关闭 |
| `dom` | `Object \| Function` | `null` | 主体内容组件，必填 |
| `option` | `Object` | `{}` | 透传给 `dom` 的 props |
| `events` | `Object` | `{}` | 透传给 `dom` 的事件 |
| `domCompleted` | `Function` | `null` | 内容组件 ref 可用后的回调，参数为内容 ref |
| `headerDom` | `Object \| Function` | `null` | 自定义头部组件 |
| `headerOption` | `Object` | `{}` | 透传给 `headerDom` 的 props |
| `headerEvents` | `Object` | `{}` | 透传给 `headerDom` 的事件 |
| `showFooter` | `Boolean` | `true` | 是否显示底部 |
| `footerDom` | `Object \| Function` | `null` | 自定义底部组件 |
| `footerOption` | `Object` | `{}` | 透传给 `footerDom` 的 props |
| `footerTitle` | `Object` | `{ close: '取消', confirm: '确定' }` | 默认底部按钮文案 |
| `footerEvents` | `Object` | `{}` | 透传给 `footerDom` 的事件 |
| `footerButtonReverse` | `Boolean` | `false` | 仅对默认底部按钮顺序生效：`true`=确认在左、取消在右；`false`=取消在左、确认在右。当前工厂创建时会强制为 `true` |
| `footerCloseOnly` | `Boolean` | `false` | 仅对默认底部生效；设为 `true` 时只显示关闭按钮，不显示确认按钮 |
| `immediately` | `Boolean` | `false` | 点击确认后是否先关闭再执行 `confirm` |
| `close` | `Function` | `null` | `el-dialog` 的 `close` 阶段回调 |
| `closed` | `Function` | `null` | `el-dialog` 的 `closed` 阶段回调；工厂会在这里销毁实例 |
| `draggable` | `Boolean` | `false` | 是否允许拖拽标题栏 |
| `confirm` | `Function` | `null` | 点击默认确认按钮时的回调，签名为 `(closeFn, contentRef, loadingProxy)` |
| `x` | `Number \| String` | `null` | 固定定位 `left` |
| `y` | `Number \| String` | `null` | 固定定位 `top` |
| `maxSize` | `Function` | `null` | 存在时显示最大化按钮，函数返回最大化后的宽高坐标 |
| `store` | `Object` | `null` | 注入给动态实例的 Vuex store |
| `pinia` | `Object` | `null` | 注入给动态实例的 Pinia 实例 |

### 4.1 易混淆字段详解（中文）

| 字段 | 详细说明 | 常见误区 |
|---|---|---|
| `option` | 透传给内容组件的 props，等价于 `<component v-bind="option" />` | 不是 NsDialog 自己的 props，不会直接改弹窗壳子 |
| `events` | 透传给内容组件的事件对象，等价于 `<component v-on="events" />`，且内部会自动合并一个 `close` 事件 | 以为必须自己传 `close`；实际上组件已注入 |
| `showFooter` | 控制底部区域是否整体显示 | 设为 `false` 后，默认按钮和自定义 footer 都不会出现 |
| `footerDom` | 自定义底部组件；一旦提供，默认取消/确定按钮不再渲染 | 以为还能同时显示默认按钮；实际二选一 |
| `footerTitle` | 仅影响默认底部按钮文案，不影响自定义 `footerDom` | 给了 `footerDom` 后再改 `footerTitle` 不会生效 |
| `footerEvents` | 仅透传给 `footerDom` 的事件，默认按钮不会读取这里的 `confirm` | 以为能通过 `footerEvents.confirm` 控制默认确认按钮 |
| `footerButtonReverse` | 仅控制默认按钮顺序：`true`=确定在左，`false`=确定在右 | 以为会影响自定义 `footerDom`；不会 |
| `footerCloseOnly` | 仅默认底部生效；`true` 时只渲染取消按钮 | 以为会隐藏自定义 footer；不会 |
| `immediately` | 默认确认按钮点击后是否先关窗再执行 `confirm` | 设为 `true` 时 `confirm` 拿不到 `loadingProxy` |
| `confirm` | 默认确认按钮回调；建议手动控制 `closeFn` 与 loading 状态 | 以为 return Promise 就会自动关窗；当前实现不会自动等待 |
| `close` / `closed` | 分别对应 `el-dialog` 的 `close` 和 `closed` 生命周期 | 误把资源释放写在 `close`；更稳妥放在 `closed` |
| `x` / `y` | 传任一项就切换为 fixed 定位，支持数字和带单位字符串 | 只传 `x` 不传 `y` 时，`y` 会按居中 top 自动计算 |
| `maxSize` | 传函数才显示最大化按钮，函数返回 `{ width, height, x, y }` | 以为是布尔开关；实际必须是函数 |

## 5. 核心行为

### 5.1 内容组件如何接收数据

- `option` 会以 `v-bind="currentOption"` 的方式透传给内容组件
- `events` 会以 `v-on="mergeEvents(events)"` 的方式透传给内容组件
- `mergeEvents` 会额外注入一个 `close` 事件，因此内容组件内部可以直接 `this.$emit('close')`

### 5.2 头部和底部如何自定义

- `headerDom` / `footerDom` 接收组件对象或异步组件
- `headerOption` / `footerOption` 作为 props 透传
- `headerEvents` / `footerEvents` 作为事件透传
- 这两类事件同样会额外合并 `close`

### 5.3 默认确认按钮行为

- 只有在 `showFooter=true` 且未传 `footerDom` 时，才会显示默认确认/取消按钮
- `footerButtonReverse=true` 时顺序是「确定 | 取消」，`footerButtonReverse=false` 时顺序是「取消 | 确定」
- 通过 `window.NsDialog(...)` 工厂创建时，当前实现会把 `footerButtonReverse` 强制设为 `true`
- 若 `footerCloseOnly=true`，默认底部只显示关闭按钮
- 点击默认确认按钮后会执行 `dealConfirm`
- 若未配置 `confirm`，按钮只会短暂进入 loading 后立即结束，不会自动关闭
- 若配置了 `confirm` 且不调用 `closeFn()`，需要在业务侧手动 `loadingProxy.value = false` 结束 loading
- 若 `confirm` 中调用了 `closeFn()`，组件会关闭，并自动弹出一次 `操作成功`

### 5.4 底部按钮显示矩阵（默认底部）

仅在 `showFooter=true` 且 `footerDom` 未传时适用：

| 条件 | 显示结果 |
|---|---|
| `footerCloseOnly=true` | 仅显示「取消」按钮 |
| `footerCloseOnly=false` 且 `footerButtonReverse=true` | 显示「确定 | 取消」 |
| `footerCloseOnly=false` 且 `footerButtonReverse=false` | 显示「取消 | 确定」 |

### 5.5 `immediately=true` 的真实行为

这一点是 AI 生成代码最容易写错的地方。

- 点击确认后会先关闭弹窗
- 然后调用 `confirm(null, contentRef)`
- 当前实现不会传入第三个 `loadingProxy`
- 因为弹窗已经先关闭，所以 `immediately=true` 更适合“无需等待结果、触发即关”的场景

### 5.6 拖拽、定位、最大化

- `draggable=true` 时，只有标题栏可拖拽
- 只要传了 `x` 或 `y`，弹窗就改为 `position: fixed`
- 最大化按钮是否显示，不取决于单独开关，而是取决于 `maxSize` 是否为函数
- `maxSize()` 返回的对象支持 `width`、`height`、`x`、`y`

### 5.7 回车行为

- 当 `visible=true`、`showFooter=true`、`footerDom` 不存在时，按回车会触发默认确认逻辑
- 当 `footerCloseOnly=true` 时，即使使用默认底部，回车也不会触发确认
- 如果用了自定义底部组件，回车不会自动触发 `footerEvents.confirm`

## 6. `confirm` 回调签名

### 6.1 常规模式

```js
confirm: async (closeFn, contentRef, loadingProxy) => {
  const data = await contentRef.getFormData()
  if (!data) {
    loadingProxy.value = false
    return
  }
  closeFn()
}
```

### 6.2 参数含义

| 参数 | 说明 |
|---|---|
| `closeFn` | 调用后关闭弹窗，仅在 `immediately=false` 时有意义 |
| `contentRef` | 内容组件实例，可调用其公开方法 |
| `loadingProxy` | 可读写对象，使用 `loadingProxy.value = false` 可在校验失败时取消确认按钮 loading（仅在 `immediately=false` 时传入） |

### 6.3 更稳妥的生成策略

- 如果需要异步校验后再关闭，用 `immediately=false`
- 内容组件应暴露公开方法，例如 `getFormData`
- 让 `confirm` 只负责校验、提交和决定是否调用 `closeFn`
- 在校验失败或捕获异常时，显式设置 `loadingProxy.value = false`
- 不要假设 `confirm` 返回 Promise 后会被组件自动等待；当前实现不会自动处理返回值

## 7. 实例对象能力

`NsDialog(...)` 返回的实例对象结构如下。

| 字段/方法 | 说明 |
|---|---|
| `id` | 实例 id |
| `domRef` | 内容组件 ref，渲染完成后可用 |
| `close()` | 主动关闭弹窗 |
| `updateOption(partial)` | 动态更新配置 |
| `callMethod(name, ...args)` | 调用内容组件实例方法 |

### 7.1 `updateOption` 的真实更新范围

`updateOption(partial)` 会对以下字段做特殊处理：

- `title`
- `width`
- `height`
- `x`
- `y`

除此之外，其余字段不会回写到顶层配置，而是会并入 `currentOption`，等价于继续给内容组件追加 props。

```js
const instance = window.NsDialog({
  title: '用户编辑',
  dom: FormDemo,
  option: { readOnly: false },
})

instance.updateOption({
  title: '用户详情',
  width: '960px',
  readOnly: true,
})

const data = await instance.callMethod('getFormData')
instance.close()
```

## 8. 全局能力

| 方法 | 位置 | 说明 |
|---|---|---|
| `closeAllNsDialog()` | `packages/components/NsDialog/index.js` | 关闭当前所有实例 |
| `setExternalApp(app, options)` | `packages/components/NsDialog/index.js` | 解析外部 Vue / store / pinia 上下文 |

### 8.1 何时使用 `setExternalApp`

- 在非当前 Vue 根实例上下文里调用 `window.NsDialog`
- 希望动态弹窗也能访问外部 store 或 pinia
- 希望用指定的 Vue 构造器创建实例

## 9. Demo 功能映射

`src/views/DialogDemo.vue` 当前已验证以下组合模式：

| 场景 | 对应能力 |
|---|---|
| 打开普通弹窗 | `dom + option + events` |
| 打开只读弹窗 | `option.readOnly` |
| 仅显示关闭按钮 | `footerCloseOnly=true` |
| 多开错位显示 | `x / y` 动态偏移 |
| 自定义头部 | `headerDom + headerOption` |
| 自定义底部 | `footerDom + footerOption + footerEvents` |
| 禁止点击遮罩关闭 | `closeOnClickModal=false` |
| 蓝色遮罩 | `modalColor` |
| 最大化 | `maxSize` |
| 动态切换标题和内容 props | `instance.updateOption()` |
| 调用内容方法 | `instance.callMethod()` |
| 全量关闭 | `this.$closeAllNsDialog()` 或 `window.closeAllNsDialog()` |

## 10. AI 生成代码约束

- 必须通过 `window.NsDialog(...)` 调用，不要写成 `<NsDialog />`
- `dom` 必填
- 需要被外层调用的方法必须在内容组件上暴露为实例方法
- `updateOption()` 适合改标题、宽高、坐标和内容 props，不适合更新所有顶层行为配置
- 自定义底部时，关闭动作要么触发 `$emit('close')`，要么由外层自己维护逻辑
- 若要保留多个弹窗，业务侧应保存返回实例数组

## 11. 推荐 Prompt

```text
请基于当前项目的 NsDialog 工厂生成 Vue2.7 页面，要求：
1) 只能通过 window.NsDialog(config, modal, '#app') 打开弹窗；
2) 演示普通弹窗、只读弹窗、自定义 headerDom/footerDom 弹窗；
3) 内容组件通过 option 接收 props，通过 events 向外派发事件；
4) 演示 instance.updateOption 和 instance.callMethod；
5) 演示 draggable、x/y 定位、maxSize 最大化；
6) 演示 closeAllNsDialog；
7) 代码风格与当前仓库一致，不使用 TS，不虚构不存在的 props。
```

## 12. 标准模板

```vue
<template>
  <div>
    <el-button type="primary" @click="openDialog">打开弹窗</el-button>
    <el-button :disabled="!dialogInstance" @click="toggleReadonly">切换只读</el-button>
    <el-button :disabled="!dialogInstance" @click="callInnerMethod">调用内容方法</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FormDemo from '@/views/FormDemo.vue'

const dialogInstance = ref(null)
const readonly = ref(false)

const openDialog = () => {
  dialogInstance.value = window.NsDialog(
    {
      title: '用户编辑',
      width: '960px',
      height: '620px',
      dom: FormDemo,
      draggable: true,
      x: 'calc(50% - 480px)',
      y: 'calc(50% - 310px)',
      option: {
        readOnly: readonly.value
      },
      events: {
        btnClick(payload) {
          console.log('内容组件事件', payload)
        },
      },
      confirm: async (closeFn, contentRef, loadingProxy) => {
        const result = await contentRef.getFormData()
        if (!result) {
          loadingProxy.value = false
          return
        }
        closeFn()
      },
      closed: () => {
        dialogInstance.value = null
      },
    },
    true,
    '#app',
  )
}

const toggleReadonly = () => {
  if (!dialogInstance.value) return
  readonly.value = !readonly.value
  dialogInstance.value.updateOption({
    title: readonly.value ? '用户详情' : '用户编辑',
    readOnly: readonly.value,
  })
}

const callInnerMethod = async () => {
  if (!dialogInstance.value) return
  const data = await dialogInstance.value.callMethod('getFormData')
  console.log(data)
}
</script>
```
