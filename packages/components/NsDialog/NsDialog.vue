<template>
  <el-dialog
    :visible.sync="visible"
    :width="normalizedWidth"
    :modal="modal"
    :modal-class="modalClassName"
    :show-close="false"
    :append-to-body="false"
    :close-on-click-modal="closeOnClickModal"
    :custom-class="dialogCustomClass"
    @close="dealClose"
    @closed="dealClosed"
  >
    <div slot="title" class="ns-dialog-plus__header" @mousedown="handleDragStart">
      <div class="ns-dialog-plus__title">
        <component
          v-if="resolvedHeaderDom"
          :is="resolvedHeaderDom"
          v-bind="headerOption"
          v-on="mergeEvents(headerEvents)"
        />
        <template v-else>{{ currentTitle }}</template>
      </div>
      <div class="ns-dialog-plus__actions">
        <el-button v-if="showMaximizeButton" type="text" class="ns-dialog-plus__action-btn" @click.stop="toggleMaximize">
          {{ isMaximized ? '还原' : '最大化' }}
        </el-button>
        <el-button type="text" class="ns-dialog-plus__action-btn" @click.stop="closeDialog">关闭</el-button>
      </div>
    </div>

    <div class="ns-dialog-plus__body" :style="bodyStyle">
      <component
        :is="resolvedDom"
        ref="contentRef"
        v-bind="currentOption"
        v-on="mergeEvents(events)"
      />
    </div>

    <div v-if="showFooter" slot="footer" class="ns-dialog-plus__footer">
      <component
        v-if="resolvedFooterDom"
        :is="resolvedFooterDom"
        v-bind="footerOption"
        v-on="mergeEvents(footerEvents)"
      />
      <template v-else>
        <el-button @click="closeDialog">{{ footerButtonText.close }}</el-button>
        <el-button type="primary" :loading="footerLoading" @click="dealConfirm">{{ footerButtonText.confirm }}</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { loadCssVars } from '../../utils/loadCssVars'

export default {
  name: 'NsDialogComponent',
  props: {
    className: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    width: {
      type: [Number, String],
      default: 500,
    },
    height: {
      type: [Number, String],
      default: '',
    },
    modal: {
      type: Boolean,
      default: true,
    },
    dialogPadding: {
      type: [Number, String, Array],
      default: -1,
    },
    modalColor: {
      type: String,
      default: 'rgba(0, 0, 0, 0.45)',
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
    dom: {
      type: [Object, Function],
      default: null,
    },
    option: {
      type: Object,
      default: () => ({}),
    },
    events: {
      type: Object,
      default: () => ({}),
    },
    domCompleted: {
      type: Function,
      default: null,
    },
    headerDom: {
      type: [Object, Function],
      default: null,
    },
    headerOption: {
      type: Object,
      default: () => ({}),
    },
    headerEvents: {
      type: Object,
      default: () => ({}),
    },
    showFooter: {
      type: Boolean,
      default: true,
    },
    footerDom: {
      type: [Object, Function],
      default: null,
    },
    footerOption: {
      type: Object,
      default: () => ({}),
    },
    footerTitle: {
      type: Object,
      default: () => ({
        close: '取消',
        confirm: '确定',
      }),
    },
    footerEvents: {
      type: Object,
      default: () => ({}),
    },
    immediately: {
      type: Boolean,
      default: false,
    },
    close: {
      type: Function,
      default: null,
    },
    closed: {
      type: Function,
      default: null,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    confirm: {
      type: Function,
      default: null,
    },
    x: {
      type: [Number, String],
      default: null,
    },
    y: {
      type: [Number, String],
      default: null,
    },
    maxSize: {
      type: Function,
      default: null,
    },
    dialogInstance: {
      type: Object,
      default: null,
    },
    containerId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      visible: false,
      currentTitle: this.title,
      currentOption: { ...this.option },
      currentWidth: this.width,
      currentHeight: this.height,
      currentX: this.x,
      currentY: this.y,
      footerLoading: false,
      isMaximized: false,
      originalSize: {
        width: this.width,
        height: this.height,
        x: this.x,
        y: this.y,
      },
      dragContext: null,
      domCompletedCalled: false,
    }
  },
  computed: {
    normalizedWidth() {
      return this.normalizeSize(this.currentWidth || this.width || 500)
    },
    bodyStyle() {
      const padding = this.resolvePadding()
      return {
        padding,
        minHeight: this.currentHeight ? this.normalizeSize(this.currentHeight) : 'auto',
        maxHeight: this.currentHeight ? this.normalizeSize(this.currentHeight) : 'none',
        overflow: 'auto',
      }
    },
    dialogCustomClass() {
      return ['ns-dialog-plus', this.className, this.hasAbsolutePosition ? 'ns-dialog-plus--absolute' : '']
        .filter(Boolean)
        .join(' ')
    },
    modalClassName() {
      return `ns-dialog-plus-modal ns-dialog-plus-modal--${this.containerId}`
    },
    resolvedDom() {
      return this.resolveComponent(this.dom)
    },
    resolvedHeaderDom() {
      return this.resolveComponent(this.headerDom)
    },
    resolvedFooterDom() {
      return this.resolveComponent(this.footerDom)
    },
    footerButtonText() {
      return {
        close: this.footerTitle?.close || '取消',
        confirm: this.footerTitle?.confirm || '确定',
      }
    },
    showMaximizeButton() {
      return typeof this.maxSize === 'function'
    },
    hasAbsolutePosition() {
      return this.currentX !== null || this.currentY !== null
    },
  },
  watch: {
    option: {
      handler(value) {
        this.currentOption = { ...value }
      },
      deep: true,
    },
    title(value) {
      this.currentTitle = value
    },
    width(value) {
      if (!this.isMaximized) this.currentWidth = value
    },
    height(value) {
      if (!this.isMaximized) this.currentHeight = value
    },
    x(value) {
      if (!this.isMaximized) this.currentX = value
    },
    y(value) {
      if (!this.isMaximized) this.currentY = value
    },
    visible() {
      this.$nextTick(() => {
        this.applyDialogLayout()
        this.syncDialogInstance()
        this.triggerDomCompleted()
      })
    },
  },
  mounted() {
    loadCssVars()
    this.visible = true
    this.updateModalStyle()
    this.syncDialogInstance()
    this.$nextTick(() => {
      this.applyDialogLayout()
      this.triggerDomCompleted()
    })
    document.addEventListener('keydown', this.handleKeydown)
  },
  updated() {
    this.syncDialogInstance()
    this.triggerDomCompleted()
    this.$nextTick(() => {
      this.applyDialogLayout()
    })
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown)
    this.removeDragListeners()
    this.removeModalStyle()
  },
  methods: {
    normalizeSize(value) {
      if (value === null || value === undefined || value === '') return ''
      return /^\d+$/.test(String(value)) ? `${value}px` : String(value)
    },
    resolvePadding() {
      if (Array.isArray(this.dialogPadding)) {
        return this.dialogPadding.map((item) => this.normalizeSize(item)).join(' ')
      }
      if (this.dialogPadding === -1 || this.dialogPadding === '-1') {
        return '16px 20px'
      }
      return this.normalizeSize(this.dialogPadding)
    },
    resolveComponent(source) {
      if (!source) return null
      if (source.default) {
        return source.default
      }
      if (typeof source.then === 'function') {
        return () => source
      }
      return source
    },
    mergeEvents(listeners = {}) {
      return {
        ...listeners,
        close: () => this.closeDialog(),
      }
    },
    resolveDialogElement() {
      return this.$el && this.$el.querySelector ? this.$el.querySelector('.el-dialog') : null
    },
    resolveWrapperElement() {
      return this.$el && this.$el.querySelector ? this.$el.querySelector('.el-dialog__wrapper') : null
    },
    applyDialogLayout() {
      const dialog = this.resolveDialogElement()
      if (!dialog) return
      if (this.currentHeight) {
        dialog.style.height = this.normalizeSize(this.currentHeight)
        dialog.style.display = 'flex'
        dialog.style.flexDirection = 'column'
      } else {
        dialog.style.height = ''
      }
      if (this.hasAbsolutePosition) {
        dialog.style.position = 'fixed'
        dialog.style.margin = '0'
        if (this.currentX !== null) {
          dialog.style.left = this.normalizeSize(this.currentX)
        }
        if (this.currentY !== null) {
          dialog.style.top = this.normalizeSize(this.currentY)
        }
      } else {
        dialog.style.position = ''
        dialog.style.left = ''
        dialog.style.top = ''
      }
    },
    updateModalStyle() {
      if (!this.containerId) return
      let styleEl = document.getElementById(`style-${this.containerId}`)
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = `style-${this.containerId}`
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `.${this.modalClassName.replace(/ /g, '.')} { background-color: ${this.modalColor} !important; }`
    },
    removeModalStyle() {
      if (!this.containerId) return
      const styleEl = document.getElementById(`style-${this.containerId}`)
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl)
      }
    },
    syncDialogInstance() {
      if (!this.dialogInstance) return
      this.dialogInstance.domRef = this.$refs.contentRef || null
      this.dialogInstance.updateOption = (newOption = {}) => {
        if (Object.prototype.hasOwnProperty.call(newOption, 'title')) {
          this.currentTitle = newOption.title
        }
        if (Object.prototype.hasOwnProperty.call(newOption, 'width')) {
          this.currentWidth = newOption.width
        }
        if (Object.prototype.hasOwnProperty.call(newOption, 'height')) {
          this.currentHeight = newOption.height
        }
        if (Object.prototype.hasOwnProperty.call(newOption, 'x')) {
          this.currentX = newOption.x
        }
        if (Object.prototype.hasOwnProperty.call(newOption, 'y')) {
          this.currentY = newOption.y
        }
        const mergedOption = { ...newOption }
        delete mergedOption.title
        delete mergedOption.width
        delete mergedOption.height
        delete mergedOption.x
        delete mergedOption.y
        this.currentOption = {
          ...this.currentOption,
          ...mergedOption,
        }
      }
      this.dialogInstance.callMethod = (methodName, ...args) => {
        const target = this.$refs.contentRef
        if (target && typeof target[methodName] === 'function') {
          return target[methodName](...args)
        }
        return undefined
      }
      this.dialogInstance.close = () => this.closeDialog()
    },
    triggerDomCompleted() {
      if (this.domCompletedCalled) return
      if (this.$refs.contentRef) {
        this.domCompletedCalled = true
        if (typeof this.domCompleted === 'function') {
          this.domCompleted(this.$refs.contentRef)
        }
      }
    },
    toggleMaximize() {
      if (!this.showMaximizeButton) return
      if (!this.isMaximized) {
        this.originalSize = {
          width: this.currentWidth,
          height: this.currentHeight,
          x: this.currentX,
          y: this.currentY,
        }
        const maxConfig = this.maxSize ? this.maxSize() || {} : {}
        this.currentWidth = maxConfig.width || '100vw'
        this.currentHeight = maxConfig.height || '100vh'
        this.currentX = maxConfig.x !== undefined ? maxConfig.x : 0
        this.currentY = maxConfig.y !== undefined ? maxConfig.y : 0
        this.isMaximized = true
      } else {
        this.currentWidth = this.originalSize.width
        this.currentHeight = this.originalSize.height
        this.currentX = this.originalSize.x
        this.currentY = this.originalSize.y
        this.isMaximized = false
      }
      this.$nextTick(() => this.applyDialogLayout())
    },
    closeDialog() {
      this.visible = false
    },
    dealClose() {
      if (typeof this.close === 'function') {
        this.close()
      }
    },
    dealClosed() {
      if (typeof this.closed === 'function') {
        this.closed()
      }
    },
    dealConfirm() {
      this.footerLoading = true
      if (!this.confirm) {
        this.footerLoading = false
        return
      }
      if (this.immediately) {
        this.footerLoading = false
        this.visible = false
        this.confirm(null, this.$refs.contentRef)
        return
      }
      this.confirm(
        () => {
          this.footerLoading = false
          this.visible = false
          this.$message && this.$message.success && this.$message.success('操作成功')
        },
        this.$refs.contentRef,
        {
          value: this.footerLoading,
          set value(nextValue) {
            this.footerLoading = nextValue
          },
        },
      )
    },
    handleKeydown(event) {
      if (!this.visible || !this.showFooter) return
      if (event.key === 'Enter' && !this.footerDom) {
        event.preventDefault()
        this.dealConfirm()
      }
    },
    handleDragStart(event) {
      if (!this.draggable || this.showMaximizeButton || event.button !== 0) {
        return
      }
      const dialog = this.resolveDialogElement()
      if (!dialog) return
      const rect = dialog.getBoundingClientRect()
      this.currentX = rect.left
      this.currentY = rect.top
      this.dragContext = {
        startX: event.clientX,
        startY: event.clientY,
        originX: rect.left,
        originY: rect.top,
      }
      document.addEventListener('mousemove', this.handleDragMove)
      document.addEventListener('mouseup', this.handleDragEnd)
    },
    handleDragMove(event) {
      if (!this.dragContext) return
      const deltaX = event.clientX - this.dragContext.startX
      const deltaY = event.clientY - this.dragContext.startY
      this.currentX = this.dragContext.originX + deltaX
      this.currentY = this.dragContext.originY + deltaY
      this.applyDialogLayout()
    },
    handleDragEnd() {
      this.removeDragListeners()
    },
    removeDragListeners() {
      document.removeEventListener('mousemove', this.handleDragMove)
      document.removeEventListener('mouseup', this.handleDragEnd)
      this.dragContext = null
    },
  },
}
</script>

<style scoped>
.ns-dialog-plus__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--matrix-dialog-header-height);
  cursor: default;
}

.ns-dialog-plus__title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--matrix-dialog-header-text-color);
}

.ns-dialog-plus__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ns-dialog-plus__action-btn {
  padding: 0;
}

.ns-dialog-plus__body {
  min-height: 60px;
}

.ns-dialog-plus__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--matrix-dialog-footer-gap);
}

::v-deep .ns-dialog-plus {
  overflow: hidden;
  border-radius: var(--matrix-dialog-border-radius);
  box-shadow: var(--matrix-dialog-box-shadow);
}

::v-deep .ns-dialog-plus .el-dialog__header {
  padding: 0 20px;
  background: var(--matrix-dialog-header-bg-color);
}

::v-deep .ns-dialog-plus .el-dialog__body {
  padding: 0;
}
</style>
