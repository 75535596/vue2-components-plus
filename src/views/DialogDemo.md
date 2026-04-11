# NsDialog 使用说明（面向 AI 代码生成）

本文档基于当前仓库实现，目标是让 AI 或开发者可直接据此生成可运行代码。

## 1. 组件定位

- `NsDialog` 不是普通 SFC 标签组件，而是一个函数式弹窗创建器：
  - 入口：`packages/components/NsDialog/index.js`
  - 视图实现：`packages/components/NsDialog/NsDialog.vue`
- 用法是调用 `NsDialog(config, modal?, appendTo?)` 动态创建实例。
- 支持多开，实例挂在 `window.__dialogInstances`，可逐个关闭/统一关闭。

## 2. 基础调用

```js
import FormDemo from '@/views/FormDemo.vue'

window.NsDialog(
  {
    title: '示例弹窗',
    dom: FormDemo,
    option: { readOnly: false },
    events: {
      btnClick(payload) {
        console.log('子组件事件', payload)
      },
    },
  },
  true,
  '#app',
)
```

## 3. `NsDialog(config, modal, appendTo)` 参数

### 3.1 函数参数

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `config` | `Object` | - | 弹窗配置对象，见下表 |
| `modal` | `Boolean` | `true` | 是否展示遮罩 |
| `appendTo` | `String` | `'#app'` | 挂载容器选择器 |

### 3.2 `config` 支持字段（完整）

以下字段来自 `NsDialog.vue` `props` + `index.js` 增强能力。

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `id` | `String` | 自动生成 | 实例唯一 id |
| `class` | `String` | `''` | 传入后映射为 `className` |
| `title` | `String` | `''` | 弹窗标题 |
| `width` | `Number \| String` | `500` | 宽度，数字自动补 `px` |
| `height` | `Number \| String` | `''` | 高度，设置后 body 自适应滚动 |
| `modal` | `Boolean` | 函数参数 | 遮罩开关 |
| `dialogPadding` | `Number \| String \| Array` | `-1` | 内容 padding，`-1` 用默认值 |
| `modalColor` | `String` | `rgba(0, 0, 0, 0.45)` | 遮罩颜色 |
| `closeOnClickModal` | `Boolean` | `true` | 点击遮罩是否关闭 |
| `dom` | `Object \| Function` | `null` | 主体内容组件（必填） |
| `option` | `Object` | `{}` | 透传给 `dom` 的 props |
| `events` | `Object` | `{}` | 透传给 `dom` 的事件监听（`v-on`） |
| `domCompleted` | `Function` | `null` | 内容组件 ref 就绪回调，参数是内容 ref |
| `headerDom` | `Object \| Function` | `null` | 自定义头部组件 |
| `headerOption` | `Object` | `{}` | 透传给 `headerDom` 的 props |
| `headerEvents` | `Object` | `{}` | 透传给 `headerDom` 的事件 |
| `showFooter` | `Boolean` | `true` | 是否显示底部区域 |
| `footerDom` | `Object \| Function` | `null` | 自定义底部组件 |
| `footerOption` | `Object` | `{}` | 透传给 `footerDom` 的 props |
| `footerTitle` | `Object` | `{ close:'取消', confirm:'确定' }` | 默认底部按钮文案 |
| `footerEvents` | `Object` | `{}` | 透传给 `footerDom` 的事件 |
| `footerButtonReverse` | `Boolean` | `false` | 默认按钮顺序反转（注意：通过 `NsDialog(...)` 工厂创建时，当前实现会强制置为 `true`） |
| `immediately` | `Boolean` | `false` | 点击确认后是否立即关闭 |
| `close` | `Function` | `null` | 弹窗 close 事件回调 |
| `closed` | `Function` | `null` | 弹窗 closed 事件回调（销毁前） |
| `draggable` | `Boolean` | `false` | 是否可拖拽 |
| `confirm` | `Function` | `null` | 点击确认回调 |
| `x` | `Number \| String` | `null` | 固定定位 left |
| `y` | `Number \| String` | `null` | 固定定位 top |
| `maxSize` | `Function` | `null` | 最大化配置函数 |
| `store` | `Object` | `null` | 注入 Vuex（在 `index.js` 解析） |
| `pinia` | `Object` | `null` | 注入 Pinia（在 `index.js` 解析） |

## 4. 回调与事件

### 4.1 `confirm(closeFn, contentRef, loadingProxy)`

- `closeFn`：调用后关闭弹窗。
- `contentRef`：内容组件实例，可调用其公开方法。
- `loadingProxy`：可写对象，用于控制确认按钮 loading。

```js
confirm(closeFn, contentRef, loading) {
  Promise.resolve(contentRef.getFormData()).then((ok) => {
    if (!ok) {
      loading.value = false
      return
    }
    closeFn()
  })
}
```

### 4.2 透传事件对象

- `events`、`headerEvents`、`footerEvents` 都会自动合并一个 `close` 事件：
  - 在子组件内可直接触发 `this.$emit('close')` 来关弹窗。

### 4.3 交互细节（易遗漏）

- 当 `showFooter=true` 且未使用 `footerDom` 时，按回车键会触发默认确认逻辑（`dealConfirm`）。
- 最大化按钮的显示条件不是 `showMaximizeButton` 配置项，而是 `maxSize` 为函数。

## 5. 实例能力（返回值）

`NsDialog(...)` 返回 `instance` 对象，支持：

| 方法/字段 | 说明 |
|---|---|
| `id` | 实例 id |
| `close()` | 主动关闭弹窗 |
| `updateOption(partial)` | 动态更新 title/width/height/x/y/option |
| `callMethod(name, ...args)` | 调用内容组件实例方法 |
| `domRef` | 内容组件 ref（就绪后） |

```js
const ins = window.NsDialog({ title: 'A', dom: FormDemo })
ins.updateOption({ title: 'B', width: '960px', readOnly: true })
const data = await ins.callMethod('getFormData')
ins.close()
```

## 6. 全局能力

| 方法 | 位置 | 说明 |
|---|---|---|
| `closeAllNsDialog()` | `NsDialog/index.js` | 关闭所有实例 |
| `setExternalApp(app, options)` | `NsDialog/index.js` | 外部上下文注入（Vue/store/pinia） |

## 7. AI 生成代码建议

- 创建弹窗时必须提供 `dom`，否则函数返回 `false`。
- 内容组件应暴露可调用方法（如 `getFormData`）以配合 `callMethod`/`confirm`。
- 若需要完全自定义底部，设置 `footerDom` 并自己处理确认关闭逻辑。
- 需要多开管理时，维护返回实例数组，不要只存最后一个。
