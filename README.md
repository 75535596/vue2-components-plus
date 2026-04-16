# vue2-components-plus  组件库

## 简介

vue2-components-plus  是一个功能丰富的 Vue 3 企业级组件库，提供动态表单、函数弹出框组件、带搜索条件的表格、权限控制等完整解决方案。

组件使用示例参考 `dist/ComponentDemo`

Author: zhuyi

## 📸 部分组件预览

### NsDialog

![emh1eWluZw==](http://tc-cdn.processon.com/po/605c2da663768970077b1422-69d608b654ada43fbd3c7d8c)

### NsForm

![emh1eWluZw==](http://tc-cdn.processon.com/po/605c2da663768970077b1422-69d6086554ada43fbd3c7d78)

### NsTableContainer

![emh1eWluZw==](http://tc-cdn.processon.com/po/605c2da663768970077b1422-69d608962a4f3a0f25377b83)


## 📊 功能特性总结

### 组件功能

- ✅ **NsForm**: 动态表单生成和管理
- ✅ **NsDialog**: 灵活弹窗对话框
- ✅ **NsTableContainer**: 动态表格+搜索条件

### 指令功能

- ✅ **v-permission**: 按钮权限控制
- ✅ **v-length**: 输入长度和格式限制
- ✅ **v-sline**: 单行文本省略
- ✅ **v-event-unuse/use**: 事件穿透控制
- ✅ **v-enterClick**: 按回车触发按钮点击

## 使用公共组件库

```bash
# 1. 引入组件库
pnpm i vue2-components-plus element-ui

```

```typescript
// 2. main.ts中引入
// 安装 Element-Plus
Vue.use(ElementUI)
// 安装组件库(ts需要//@ts-ignore)
//@ts-ignore
import NsComponents from 'vue2-components-plus/legacy'
import 'vue2-components-plus/dist/vue2-components-plus.css'

// 状态管理：Vuex
import store from './store'
Vue.use(NsComponents.default || NsComponents, { store })

// 状态管理：Pinia
import { createPinia } from 'pinia'
const pinia = createPinia()
Vue.use(NsComponents.default || NsComponents, { pinia })
```

## 📋 组件列表

### NsForm - 动态表单组件

```vue
<template>
  <NsForm :rows="formConfig" ref="formRef" />
</template>

<script setup>
import { ref } from 'vue'
import { NsForm } from 'vue2-components-plus'

const formRef = ref()
const formConfig = [
  {
    key: 'name',
    label: '姓名',
    value: '',
    component: 'el-input',
    params: { placeholder: '请输入姓名', clearable: true }
  },
  {
    key: 'age',
    label: '年龄',
    value: 18,
    component: 'el-input-number',
    params: { min: 0, max: 100 }
  }
]

// 说明：NsForm 推荐把字段透传属性写在 params 中；历史代码里的 props / attrs 也兼容。

// 获取表单数据
const formData = formRef.value?.getFormData()

// 重置表单
formRef.value?.resetForm()

// 验证表单
const isValid = formRef.value?.validate()
</script>
```

### NsDialog - 弹出框组件

```javascript
import { NsDialog, closeAllNsDialog } from 'vue2-components-plus'

// 打开对话框
NsDialog({
  title: '测试',
  // 任何组件添加 $emit('close') 时，会触发关闭弹出框事件
  dom: VideoDemo, // 也可以通过异步方式：import("@/views/VideoDemo.vue") 和 () => import("@/views/VideoDemo.vue")
  option: {
    // dom对应的自定义组件props属性
    ...data,
  },
  events: {
    // dom组件内部自定义事件emit('btnClick', xxx)
    btnClick: () => {
      console.log("点击中间区域内容");
    },
  },
  modalColor: 'rgb(0 21 115 / 20%)', // 遮罩层颜色
  width: '800px', // 宽度, 整个弹出框的高度，非内容高度
  height: '450px', // 高度, 不配置则默认为内容高度
  dialogPadding: [10, 20], // 弹窗内padding
  showFooter: true, // 默认显示底部按钮
  immediately: false, // true立即取消弹出框, false异步请求后取消弹出框，默认false
  draggable: true, // 是否可拖拽，默认false

  confirm: async (closeFn, componentRef, footerLoading) => { // 底部确认按钮回调事件
    // componentRef可以调用内部函数，前提需要defineExpose
    try{
      const selectRows = componentRef?.value?.getSelectedRows();
      console.log("点击确认，选择数据：", selectRows);
    } catch(e) {
      console.log(e)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // footerLoading可以控制底部loading状态
    if(footerLoading) {
      footerLoading.value = false
    }
    // 请求数据，再关闭
    if(closeFn) {
      closeFn()
    }
  },
  close: () => { // 关闭弹出时立即出发
    console.log("点击关闭");
  },
  closed: () => { // 弹窗销毁时触发
    console.log("完成关闭");
  },
  // 头部+底部自定义配置
  headerDom: xxx,
  headerOption: {},
  headerEvents: {},
  footerDom: yyy,
  footerOption: {},
  footerEvents: {},
  // 底部按钮名称
  footerTitle: {
    close: "取消",
    confirm: "确定",
  },
}, true, '#app') // true为是否遮罩（非必填）， '#app'为挂载点（非必填）

// 关闭所有对话框
closeAllNsDialog()
```

### Legacy / ES5 兼容构建
- **产物与入口**：ES5 产物在 `dist/vue2-components-plus.es5.js`，入口别名 `vue2-components-plus/legacy`（根目录有 `legacy.js` 指向 ES5）。
- **生成（维护者）**：`pnpm build:es5`（会先跑默认 `pnpm build`，再用 Babel 输出 ES5 文件）。
- **在老版 webpack + Vue2 项目中使用**：
  ```js
  import Vue from 'vue'
  import LegacyLib from 'vue2-components-plus/legacy'
  import 'vue2-components-plus/dist/vue2-components-plus.css'
  Vue.use(LegacyLib.default || LegacyLib)
  ```
- **无打包器 / 直接 `<script>` 引入**（先把 dist 文件放到静态目录）：
  ```html
  <link rel="stylesheet" href="/lib/vue2-components-plus.css" />
  <script src="/lib/vue2-components-plus.es5.js"></script>
  <script>
    Vue.use(Vue2ComponentsPlus.default || Vue2ComponentsPlus)
  </script>
  ```
- **若仍有语法报错**：在宿主项目对 `node_modules/vue2-components-plus` 追加 `babel-loader` 规则（targets IE11）。

## 🔧 自定义指令

### 1. v-permission - 按钮权限控制

```vue
<template>
  <!-- 使用class控制权限，无权限时隐藏 -->
  <el-button v-permission.class.display>查看</el-button>
  
  <!-- 使用id控制权限，无权限时隐藏 -->
  <el-button v-permission.id>编辑</el-button>
  
  <!-- 默认使用id控制权限 -->
  <el-button id="zuhu_list_add" v-permission>新增</el-button>
</template>

<script setup>
// 权限配置（需要在引入组件库之前设置）
import { createApp } from 'vue'

const app = createApp(App)

// 方式1：使用 provide/inject
const btnsPermission = ['zuhu_list_add', 'zuhu_list_edit', 'admin-btn']
app.provide('btnsPermission', btnsPermission)

// 方式2：使用全局属性
app.config.globalProperties.$btnsPermission = ['zuhu_list_add', 'zuhu_list_edit']

// 方式3：使用 sessionStorage（适用于动态权限）（推荐）
sessionStorage.setItem('btnsPermission', JSON.stringify(['zuhu_list_add', 'zuhu_list_edit']))

// 方式4：使用 localStorage（持久化权限）
localStorage.setItem('btnsPermission', JSON.stringify(['zuhu_list_add', 'zuhu_list_edit']))

app.use(NsComponents) // 引入组件库
</script>
```

#### 权限控制优先级说明

权限控制按以下优先级进行判断（从高到低）：

1. **sessionStorage** → `sessionStorage.getItem('btnsPermission')`
2. **localStorage** → `localStorage.getItem('btnsPermission')`
3. **全局属性** → `app.config.globalProperties.$btnsPermission`
4. **provide/inject** → `app.provide('btnsPermission', btnsPermission)`

#### 指令修饰符说明

- **v-permission** - 默认模式，使用 `id` 选择器，无权限时设置 `visibility: hidden`
- **v-permission.id** - 显式指定使用 `id` 选择器
- **v-permission.class** - 使用 `class` 选择器
- **v-permission.id.display** - 使用 `id` 选择器，无权限时设置 `display: none`
- **v-permission.class.display** - 使用 `class` 选择器，无权限时设置 `display: none`

#### 动态权限切换示例

```javascript
// 动态切换权限
function togglePermission() {
  // 获取当前权限列表
  let btnsPermission = JSON.parse(sessionStorage.getItem('btnsPermission')) || []
  
  // 添加新权限
  if (!btnsPermission.includes('delete_btn')) {
    btnsPermission.push('delete_btn')
  } else {
    // 移除权限
    btnsPermission = btnsPermission.filter(item => item !== 'delete_btn')
  }
  
  // 更新权限存储
  sessionStorage.setItem('btnsPermission', JSON.stringify(btnsPermission))
  
  // 刷新页面或重新渲染组件
  location.reload() // 或使用响应式更新
}
```

#### 实际应用场景

```vue
<template>
  <!-- 按钮组权限控制 -->
  <div class="toolbar">
    <el-button id="add_btn" v-permission type="primary">添加</el-button>
    <el-button id="edit_btn" v-permission type="success">编辑</el-button>
    <el-button id="delete_btn" v-permission type="danger">删除</el-button>
    <el-button id="export_btn" v-permission.id.display type="warning">导出</el-button>
    <el-button class="admin-btn" v-permission.class type="info">管理员</el-button>
  </div>
  
  <!-- 菜单权限控制 -->
  <el-menu>
    <el-menu-item index="1" id="dashboard_menu" v-permission>
      <span>仪表盘</span>
    </el-menu-item>
    <el-menu-item index="2" class="user-menu" v-permission.class>
      <span>用户管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
// 权限配置示例
const app = createApp(App)

// 实际项目中，权限数据通常从后端获取
const userPermissions = {
  // 普通用户权限
  normal: ['add_btn', 'edit_btn', 'dashboard_menu'],
  // 管理员权限
  admin: ['add_btn', 'edit_btn', 'delete_btn', 'export_btn', 'admin-btn', 'user-menu']
}

// 根据用户角色设置权限
const userRole = 'admin' // 从登录信息获取
app.provide('btnsPermission', userPermissions[userRole])

app.use(NsComponents)
</script>
```

### 2. v-length - 输入长度限制

```vue
<template>
  <!-- 限制最大长度50（默认） -->
  <el-input v-length placeholder="请输入用户名" />
  
  <!-- 自定义长度限制 -->
  <el-input v-length="100" placeholder="最多100字符" />
  
  <!-- 仅允许输入数字 -->
  <el-input v-length.number="11" placeholder="请输入手机号" />
  
  <!-- 自定义正则表达式 -->
  <el-input v-length.regex="{ maxLength: 10, pattern: /^[a-zA-Z]*$/ }" placeholder="仅允许字母" />
  
  <!-- 数字范围限制 -->
  <el-input v-length.range="{ min: 0, max: 100, int: true, maxLength: 10 }" placeholder="0-100整数" />
</template>
```

### 3. v-sline - 单行文本省略

```vue
<template>
  <span v-sline>这是一段很长的文本内容，超出部分会自动显示省略号...</span>
</template>
```

### 4. v-event-unuse / v-event-use - 事件穿透控制

```vue
<template>
  <!-- 阻止事件穿透 -->
  <div v-event-use>
    <button>这个按钮可以点击</button>
  </div>
  
  <!-- 允许事件穿透 -->
  <div v-event-unuse>
    <div>这个区域的事件会穿透到下层</div>
  </div>
</template>
```

### 5. v-enterClick - 回车触发点击

```vue
<template>
  <el-button v-enterClick type="primary" @click="handleSearch">查询</el-button>
</template>
```

#### 行为说明

- 在当前页面按下 Enter 时，自动触发绑定元素的 `click`
- 当焦点位于 `el-select` 输入框且下拉面板处于展开状态时，不会触发点击，避免与选项确认冲突
- 指令在绑定时注册 `document.keydown` 监听，在组件卸载时自动移除监听，避免内存泄露

#### 使用建议

- 推荐绑定到“查询”按钮，配合搜索区实现回车即查询
- 如果页面有多个按钮同时绑定该指令，按一次回车会触发多个点击，应只在一个主操作按钮上使用

## 🔧 工具函数

### 1. 通用工具函数

```javascript
import { isNotNull } from 'vue2-components-plus'

// 检查值是否非空
const result = isNotNull(value) // 返回布尔值
```

### 2. 动态资源加载

```javascript
import { loadAccess, removeDynamicAccess } from 'vue2-components-plus'

// 加载JS/CSS资源
await loadAccess('https://example.com/script.js', 'script-tag', false)

// 移除动态加载的资源
removeDynamicAccess('script-tag')
```

### 3. CSS变量管理

```javascript
import { loadCssVars } from 'vue2-components-plus'

// 获取所有CSS变量
const cssVars = loadCssVars()
console.log(cssVars['--matrix-primary-color'])
```

### 4. 表格排序工具

```javascript
import { handleSortChange, headerClick, handleHeaderCellClass } from 'vue2-components-plus'

// 在表格组件中使用
<el-table
  @sort-change="(sort) => handleSortChange(sort, searchForm, getList)"
  @header-click="headerClick"
  :header-cell-class-name="(params) => handleHeaderCellClass(params, searchForm)"
>
  <!-- 表格内容 -->
</el-table>
```

### 5. SM2加密工具

```javascript
import { getEncryptSm2 } from 'vue2-components-plus'

// 使用SM2加密
const encrypted = getEncryptSm2(publicKey, ["xxx", "yyy"], isAdd04=false, cipherMode=1)
```

### 6. 动态表单工具函数

```javascript
import { 
  useFileUpload, 
  getAllFormNodeByKey, 
  getAllFormKvData, 
  getAllFormNodeRefByKey 
} from 'vue2-components-plus'

// 表单文件上传hook
const { uploadFile, deleteFile } = useFileUpload()

// 根据key获取表单节点信息
const formNode = getAllFormNodeByKey(formRows, 'username')

// 获取表单所有键值对数据
const formData = getAllFormKvData(formRows)

// 根据key获取表单节点引用
const nodeRef = getAllFormNodeRefByKey(formRows, 'username')
```
