<template>
  <div class="dialog-demo">
    <el-card shadow="never" class="dialog-demo__card">
      <div slot="header" class="dialog-demo__header">
        <div>
          <div class="dialog-demo__title">NsDialog 预览</div>
          <div class="dialog-demo__desc">演示多开、更新配置、调用内部组件方法、关闭单个与全部弹窗。</div>
        </div>
        <el-tag size="small" type="success">当前 {{ dialogInstances.length }} 个实例</el-tag>
      </div>

      <div class="dialog-demo__actions">
        <el-button type="primary" @click="openDialog()">打开弹窗</el-button>
        <el-button @click="openReadonlyDialog()">打开只读弹窗</el-button>
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
          <el-steps direction="vertical" :active="4" finish-status="success">
            <el-step title="打开弹窗" description="每次打开会创建独立实例，并做错位展示。" />
            <el-step title="更新配置" description="可更新标题、宽高、位置以及传入内容组件的 props。" />
            <el-step title="调用方法" description="通过实例调用弹窗内部组件的公开方法，例如获取表单数据。" />
            <el-step title="关闭管理" description="支持关闭指定实例与一键关闭全部实例。" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FormDemo from '@/views/FormDemo.vue'

export default {
  name: 'DialogDemo',
  data() {
    return {
      dialogInstances: [],
      openIndex: 0,
      lastReadOnly: false,
    }
  },
  mounted() {
    this.refreshInstances()
    setTimeout(() => {
      this.openDialog({ silent: true })
    }, 300)
  },
  beforeDestroy() {
    this.closeAllDialogs()
  },
  methods: {
    getDialogApi() {
      return this.$NsDialog || window.NsDialog
    },
    refreshInstances() {
      setTimeout(() => {
        this.dialogInstances = Array.isArray(window.__dialogInstances)
          ? window.__dialogInstances.slice()
          : []
      }, 0)
    },
    openDialog(options) {
      const api = this.getDialogApi()
      if (!api) {
        this.$message.error('NsDialog 尚未挂载到全局')
        return
      }
      const config = options || {}
      const offset = this.openIndex * 24
      const readOnly = !!config.readOnly
      api(
        {
          title: config.title || 'NsDialog 示例',
          class: 'dialog-demo-instance',
          dom: FormDemo,
          option: {
            readOnly,
            insideDialog: true,
            hintText: readOnly ? '当前是只读弹窗内容。' : '可以在弹窗中直接编辑表单并触发事件。',
          },
          events: {
            btnClick: this.handleInnerButtonClick,
          },
          width: config.width || '960px',
          height: config.height || '620px',
          dialogPadding: [0, 0],
          modal: config.modal !== undefined ? config.modal : false,
          draggable: true,
          x: 120 + offset,
          y: 80 + offset,
          domCompleted: (domRef) => {
            if (!config.silent && domRef && typeof domRef.showToast === 'function') {
              domRef.showToast('弹窗内容已加载完成')
            }
          },
          confirm: (closeFn, componentRef) => {
            if (componentRef && typeof componentRef.showToast === 'function') {
              componentRef.showToast('点击了弹窗底部确认按钮')
            }
            setTimeout(() => {
              if (typeof closeFn === 'function') {
                closeFn()
              }
            }, 300)
          },
          close: this.refreshInstances,
          closed: this.refreshInstances,
        },
        true,
        '#app',
      )
      this.openIndex += 1
      this.lastReadOnly = readOnly
      this.refreshInstances()
    },
    openReadonlyDialog() {
      this.openDialog({
        readOnly: true,
        title: '只读预览弹窗',
      })
    },
    updateDialogOption() {
      if (!this.dialogInstances.length) {
        this.$message.warning('请先打开一个弹窗')
        return
      }
      const lastInstance = this.dialogInstances[this.dialogInstances.length - 1]
      this.lastReadOnly = !this.lastReadOnly
      lastInstance.updateOption({
        title: this.lastReadOnly ? '更新后的只读弹窗' : '更新后的编辑弹窗',
        readOnly: this.lastReadOnly,
        hintText: this.lastReadOnly ? '已通过 updateOption 切换为只读。' : '已通过 updateOption 切换为编辑。',
        width: this.lastReadOnly ? '880px' : '960px',
      })
      this.$message.success('已更新最后一个弹窗配置')
    },
    async callDialogMethod() {
      if (!this.dialogInstances.length) {
        this.$message.warning('请先打开一个弹窗')
        return
      }
      const lastInstance = this.dialogInstances[this.dialogInstances.length - 1]
      const result = await lastInstance.callMethod('getFormData')
      if (result === false) {
        this.$message.warning('弹窗内表单还未通过校验')
        return
      }
      this.$message.success('已调用内部组件方法并获取结果')
    },
    closeDialog(instance) {
      if (!instance || typeof instance.close !== 'function') {
        return
      }
      instance.close()
      this.refreshInstances()
    },
    closeAllDialogs() {
      if (typeof this.$closeAllNsDialog === 'function') {
        this.$closeAllNsDialog()
      } else if (typeof window.closeAllNsDialog === 'function') {
        window.closeAllNsDialog()
      } else if (Array.isArray(window.__dialogInstances)) {
        window.__dialogInstances.slice().forEach((instance) => {
          instance && typeof instance.close === 'function' && instance.close()
        })
      }
      this.openIndex = 0
      this.refreshInstances()
    },
    handleInnerButtonClick(payload) {
      const keys = payload ? Object.keys(payload) : []
      this.$message.info(`收到弹窗内容事件，共 ${keys.length} 个字段`) 
    },
  },
}
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
