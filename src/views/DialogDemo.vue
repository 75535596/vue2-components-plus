<template>
  <div class="dialog-demo">
    <el-card shadow="never" class="dialog-demo__card">
      <div slot="header" class="dialog-demo__header">
        <div>
          <div class="dialog-demo__title">多实例与方法调用面板</div>
          <div class="dialog-demo__desc">Vue2.7 + &lt;script setup&gt;：演示多开、更新配置、调用内部方法、关闭单个与全部弹窗。</div>

        </div>
        <el-tag size="small" type="success">当前 {{ dialogInstances.length }} 个实例</el-tag>
      </div>

      <div class="dialog-demo__actions">
        <el-button type="primary" @click="openDialog()">打开弹窗</el-button>
        <el-button @click="openReadonlyDialog">打开只读弹窗</el-button>
        <el-button @click="openCloseOnlyDialog">打开仅关闭按钮弹窗</el-button>
        <el-button @click="openCustomShellDialog">打开自定义头底部弹窗</el-button>
        <el-button @click="updateDialogOption">更新最后一个弹窗</el-button>
        <el-button @click="callDialogMethod">调用最后一个弹窗内容方法</el-button>
        <el-button type="danger" plain :disabled="!dialogInstances.length" @click="closeAllDialogs">关闭全部</el-button>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="10">
        <el-card shadow="never" class="dialog-demo__card dialog-demo__instance-card">
          <div slot="header">弹窗实例列表</div>
          <div v-if="dialogInstances.length" class="instance-list">
            <div v-for="(instance, index) in dialogInstances" :key="instance.id" class="instance-item">
              <div>
                <div class="instance-item__title">实例 {{ index + 1 }}</div>
                <div class="instance-item__meta">{{ instance.id }}</div>
              </div>
              <div class="instance-item__actions">
                <el-button size="mini" @click="closeDialog(instance)">关闭</el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无已打开弹窗" :image-size="88" />
        </el-card>
      </el-col>

      <el-col :span="14">
        <el-card shadow="never" class="dialog-demo__card">
          <div slot="header">能力说明</div>
          <el-steps direction="vertical" :active="5" finish-status="success">
            <el-step title="打开弹窗" description="每次打开会创建独立实例，并做错位展示。" />
            <el-step title="头尾插槽" description="支持通过 headerDom / footerDom 渲染自定义头部和底部。" />
            <el-step title="更新配置" description="可更新标题、宽高、位置以及传入内容组件的 props。" />
            <el-step title="调用方法" description="通过实例调用弹窗内部组件的公开方法，例如获取表单数据。" />
            <el-step title="关闭管理" description="支持关闭指定实例与一键关闭全部实例。" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import FormDemo from '@/views/FormDemo.vue'

const dialogInstances = ref([])
const openIndex = ref(0)
const lastReadOnly = ref(false)
const { proxy } = getCurrentInstance()

const DialogHeaderBadge = {
  name: 'DialogHeaderBadge',
  props: {
    title: {
      type: String,
      default: '自定义头部',
    },
    tagText: {
      type: String,
      default: '高级',
    },
  },
  render(h) {
    return h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
      h('span', { style: { fontWeight: 600 } }, this.title),
      h(
        'el-tag',
        {
          props: { size: 'mini', type: 'warning' },
        },
        [this.tagText],
      ),
    ])
  },
}

const DialogFooterActions = {
  name: 'DialogFooterActions',
  props: {
    confirmText: {
      type: String,
      default: '自定义确认',
    },
  },
  methods: {
    emitConfirm() {
      this.$emit('confirm')
    },
    emitClose() {
      this.$emit('close')
    },
  },
  render(h) {
    return h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px' } }, [
      h(
        'el-button',
        {
          on: { click: this.emitClose },
        },
        ['关闭'],
      ),
      h(
        'el-button',
        {
          props: { type: 'primary' },
          on: { click: this.emitConfirm },
        },
        [this.confirmText],
      ),
    ])
  },
}

const refreshInstances = () => {
  setTimeout(() => {
    dialogInstances.value = Array.isArray(window.__dialogInstances)
      ? window.__dialogInstances.slice()
      : []
  }, 0)
}

const openDialog = (options = {}) => {
  if (!window.NsDialog) {
    proxy.$message.error('NsDialog 尚未挂载到全局')
    return
  }
  const readOnly = !!options.readOnly
  const dialogConfig = {
    title: options.title || 'NsDialog 示例（setup）',
    class: 'dialog-demo-instance',
    dom: FormDemo,
    width: options.width || '900px',
    height: options.height || '1500px',
    dialogPadding: [10, 10],
    modal: options.modal !== undefined ? options.modal : false,
    draggable: true,
    // maxSize: () => ({
    //   width: '100%',
    //   height: '100%',
    //   x: 0,
    //   y: 0,
    // }),
    // x: `calc(50% - 450px)`,
    // y: `calc(50% - 250px)`,
    option: {
      readOnly,
      insideDialog: true,
      hintText: readOnly ? '当前是只读弹窗内容。' : '可以在弹窗中直接编辑表单并触发事件。',
      ...(options.option || {}),
    },
    events: {
      btnClick: handleInnerButtonClick,
      ...(options.events || {}),
    },
    domCompleted: (domRef) => {
      if (!options.silent && domRef && typeof domRef.showToast === 'function') {
        domRef.showToast('弹窗内容已加载完成')
      }
    },
    confirm: async (closeFn, componentRef, loading) => {
      if (componentRef && typeof componentRef.showToast === 'function') {
        componentRef.showToast('点击了弹窗底部确认按钮')
      }
      let validateResult = true
      if (componentRef && typeof componentRef.getFormData === 'function') {
        validateResult = await componentRef.getFormData()
      }
      if (validateResult === false) {
        if (loading && Object.prototype.hasOwnProperty.call(loading, 'value')) {
          loading.value = false
        }
        return
      }
      setTimeout(() => {
        if (typeof closeFn === 'function') {
          closeFn()
        }
      }, 300)
    },
    close: refreshInstances,
    closed: refreshInstances,
  }

  if (options.extraConfig) {
    const extraConfig = options.extraConfig
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'modalColor')) {
      dialogConfig.modalColor = extraConfig.modalColor
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'closeOnClickModal')) {
      dialogConfig.closeOnClickModal = extraConfig.closeOnClickModal
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'immediately')) {
      dialogConfig.immediately = extraConfig.immediately
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'headerDom')) {
      dialogConfig.headerDom = extraConfig.headerDom
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'headerOption')) {
      dialogConfig.headerOption = extraConfig.headerOption
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'headerEvents')) {
      dialogConfig.headerEvents = extraConfig.headerEvents
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'footerDom')) {
      dialogConfig.footerDom = extraConfig.footerDom
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'footerOption')) {
      dialogConfig.footerOption = extraConfig.footerOption
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'footerEvents')) {
      dialogConfig.footerEvents = extraConfig.footerEvents
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'footerCloseOnly')) {
      dialogConfig.footerCloseOnly = extraConfig.footerCloseOnly
    }
    if (Object.prototype.hasOwnProperty.call(extraConfig, 'showFooter')) {
      dialogConfig.showFooter = extraConfig.showFooter
    }
  }
  window.NsDialog(
    dialogConfig,
    true,
    '#app',
  )
  openIndex.value += 1
  lastReadOnly.value = readOnly
  refreshInstances()
}

const openReadonlyDialog = () => {
  openDialog({
    readOnly: true,
    title: '只读预览弹窗（setup）',
  })
}

const openCloseOnlyDialog = () => {
  openDialog({
    title: '仅关闭按钮弹窗',
    option: {
      hintText: '底部仅保留关闭按钮，回车不会触发确认逻辑。',
    },
    extraConfig: {
      footerCloseOnly: true,
    },
  })
}

const openCustomShellDialog = () => {
  openDialog({
    title: '自定义头底部弹窗',
    modal: true,
    option: {
      hintText: '当前演示 headerDom / footerDom / footerEvents / modalColor / closeOnClickModal',
    },
    extraConfig: {
      modalColor: 'rgba(64, 158, 255, 0.2)',
      closeOnClickModal: false,
      immediately: true,
      headerDom: DialogHeaderBadge,
      headerOption: {
        title: '高级弹窗头部',
        tagText: 'Custom',
      },
      footerDom: DialogFooterActions,
      footerOption: {
        confirmText: '提交',
      },
      footerEvents: {
        confirm: () => {
          proxy.$message.success('触发了自定义底部 confirm 事件')
        },
      },
    },
  })
}

const updateDialogOption = () => {
  if (!dialogInstances.value.length) {
    proxy.$message.warning('请先打开一个弹窗')
    return
  }
  const lastInstance = dialogInstances.value[dialogInstances.value.length - 1]
  lastReadOnly.value = !lastReadOnly.value
  lastInstance.updateOption({
    title: lastReadOnly.value ? '更新后的只读弹窗' : '更新后的编辑弹窗',
    readOnly: lastReadOnly.value,
    hintText: lastReadOnly.value ? '已通过 updateOption 切换为只读。' : '已通过 updateOption 切换为编辑。',
    width: lastReadOnly.value ? '880px' : '960px',
  })
  proxy.$message.success('已更新最后一个弹窗配置')
}

const callDialogMethod = async () => {
  if (!dialogInstances.value.length) {
    proxy.$message.warning('请先打开一个弹窗')
    return
  }
  const lastInstance = dialogInstances.value[dialogInstances.value.length - 1]
  const result = await lastInstance.callMethod('getFormData')
  if (result === false) {
    proxy.$message.warning('弹窗内表单还未通过校验')
    return
  }
  proxy.$message.success('已调用内部组件方法并获取结果')
}

const closeDialog = (instance) => {
  if (!instance || typeof instance.close !== 'function') return
  instance.close()
  refreshInstances()
}

const closeAllDialogs = () => {
  if (typeof proxy.$closeAllNsDialog === 'function') {
    proxy.$closeAllNsDialog()
  } else if (typeof window.closeAllNsDialog === 'function') {
    window.closeAllNsDialog()
  } else if (Array.isArray(window.__dialogInstances)) {
    window.__dialogInstances.slice().forEach((instance) => {
      instance && typeof instance.close === 'function' && instance.close()
    })
  }
  openIndex.value = 0
  refreshInstances()
}

const handleInnerButtonClick = (payload) => {
  const keys = payload ? Object.keys(payload) : []
  proxy.$message.info(`收到弹窗内容事件，共 ${keys.length} 个字段`)
}

onMounted(() => {
  refreshInstances()
  setTimeout(() => {
    openDialog({ silent: true })
  }, 300)
})

onBeforeUnmount(() => {
  closeAllDialogs()
})
</script>

<style scoped>
.dialog-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-demo__card {
  border-radius: 12px;
}

.dialog-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-demo__title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.dialog-demo__desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.dialog-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.instance-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instance-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #fafafa;
}

.instance-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.instance-item__meta {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  word-break: break-all;
}

@media (max-width: 960px) {
  .dialog-demo__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
