<template>
  <el-container class="demo-layout">
    <el-aside width="240px" class="demo-layout__aside">
      <div class="demo-layout__brand">
        <div class="demo-layout__title">vue2-components</div>
        <div class="demo-layout__desc">Vue2.7 + Element UI 组件预览</div>
      </div>

      <el-menu :default-active="currentPath" class="demo-layout__menu" @select="handleSelect">
        <el-menu-item index="/form-demo">
          <i class="el-icon-edit-outline"></i>
          <span slot="title">NsForm（setup）</span>
        </el-menu-item>
        <el-menu-item index="/table-demo">
          <i class="el-icon-s-grid"></i>
          <span slot="title">NsTable（setup）</span>
        </el-menu-item>
        <el-menu-item index="/dialog-demo">
          <i class="el-icon-copy-document"></i>
          <span slot="title">NsDialog（setup）</span>
        </el-menu-item>
        <el-menu-item index="/directives">
          <i class="el-icon-aim"></i>
          <span slot="title">指令示例</span>
        </el-menu-item>

      </el-menu>



    </el-aside>

    <el-container>
      <el-header class="demo-layout__header">
        <div>
          <div class="demo-layout__page-title">{{ currentTitle }}</div>
          <div class="demo-layout__page-desc">参考主项目示例，提供 Vue2.7 版本组件交互预览。</div>
        </div>
      </el-header>
      <el-main class="demo-layout__main">
        <component :is="currentComponent" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import DialogDemo from '@/views/DialogDemo.vue'
import FormDemo from '@/views/FormDemo.vue'
import TableDemo from '@/views/TableDemo.vue'
import DirectivesDemo from '@/views/DirectivesDemo.vue'



const pageMap = {
  '/form-demo': {
    title: 'NsForm 动态表单示例（<script setup>）',
    component: FormDemo,
  },
  '/table-demo': {
    title: 'NsTable 表格与搜索示例（<script setup>）',
    component: TableDemo,
  },
  '/dialog-demo': {
    title: 'NsDialog 弹窗示例（<script setup>）',
    component: DialogDemo,
  },
  '/directives': {
    title: '指令示例（permission/length）',
    component: DirectivesDemo,
  },
}

const routeAliasMap = {
  '/form-setup': '/form-demo',
  '/table-setup': '/table-demo',
  '/dialog-setup': '/dialog-demo',
}

export default {
  name: 'HLayout',
  data() {
    return {
      currentPath: this.resolvePath(),
    }
  },
  computed: {
    currentConfig() {
      return pageMap[this.currentPath] || pageMap['/form-demo']
    },

    currentTitle() {
      return this.currentConfig.title
    },
    currentComponent() {
      return this.currentConfig.component
    },
  },
  mounted() {
    if (!window.location.hash) {
      window.location.hash = this.currentPath
    }
    window.addEventListener('hashchange', this.handleHashChange)
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.handleHashChange)
  },
  methods: {
    resolvePath() {
      const hash = window.location.hash.replace(/^#/, '') || '/form-demo'
      const normalizedPath = routeAliasMap[hash] || hash
      return pageMap[normalizedPath] ? normalizedPath : '/form-demo'
    },

    handleHashChange() {
      this.currentPath = this.resolvePath()
    },
    handleSelect(path) {
      this.currentPath = path
      if (window.location.hash !== '#' + path) {
        window.location.hash = path
      }
    },
  },
}
</script>

<style scoped>
.demo-layout {
  height: 100vh;
  background: #f5f7fa;
}

.demo-layout__aside {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #ebeef5;
}

.demo-layout__brand {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.demo-layout__title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.demo-layout__desc {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #909399;
}

.demo-layout__menu {
  border-right: 0;
  flex: 1;
}

.demo-layout__header {
  display: flex;
  align-items: center;
  height: 88px !important;
  padding: 0 24px;
  background: linear-gradient(135deg, #ffffff, #f7f9fc);
  border-bottom: 1px solid #ebeef5;
}

.demo-layout__page-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.demo-layout__page-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.demo-layout__main {
  padding: 0;
  overflow: auto;
}
</style>
