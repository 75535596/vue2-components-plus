<template>
  <div class="page-search">
    <el-form ref="formRef" :inline="true" :model="formData" v-bind="$attrs" class="page-search__form">
      <el-row :gutter="16">
        <el-col
          v-for="(item, index) in visibleItems"
          :key="item.prop || index"
          :span="item.span || defaultSpan"
        >
          <el-form-item
            :label="item.label"
            :prop="item.prop"
            v-bind="item.formItemAttrs || {}"
          >
            <slot-renderer
              v-if="isSlotItem(item)"
              :renderer="getSlotRenderer(item)"
              :scope="{ formData, item }"
            />
            <component
              v-else
              :is="normalizeComponent(item.component || 'el-input')"
              v-model="formData[item.prop]"
              v-bind="item.attrs || {}"
              v-on="item.events || {}"
            >
              <template v-if="isSelectComponent(item)">
                <el-option
                  v-for="(option, optionIndex) in item.children || []"
                  :key="option.value !== undefined ? option.value : optionIndex"
                  :label="option.label"
                  :value="option.value"
                  :disabled="option.disabled"
                />
              </template>
            </component>
          </el-form-item>
        </el-col>

        <el-col :span="defaultSpan" class="page-search__actions">
          <el-form-item label-width="0">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button
              v-if="showCollapse && items.length > collapseLimit"
              type="text"
              @click="toggleCollapse"
            >
              <span>{{ isCollapsed ? '展开' : '收起' }}</span>
              <i :class="isCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'" />
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import SlotRenderer from '../_shared/SlotRenderer'

function toKebabCase(value) {
  if (typeof value !== 'string') return value
  if (value.indexOf('-') > -1) return value.toLowerCase()
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export default {
  name: 'NsSearch',
  components: {
    SlotRenderer,
  },
  inheritAttrs: false,
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    externalParams: {
      type: Object,
      default: () => ({}),
    },
    defaultSpan: {
      type: Number,
      default: 6,
    },
    showCollapse: {
      type: Boolean,
      default: true,
    },
    collapseLimit: {
      type: Number,
      default: 3,
    },
    slotRenderers: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      formData: {},
      isCollapsed: true,
    }
  },
  computed: {
    visibleItems() {
      if (!this.showCollapse || !this.isCollapsed) {
        return this.items
      }
      return this.items.slice(0, this.collapseLimit)
    },
  },
  watch: {
    items: {
      handler() {
        this.initFormData()
      },
      deep: true,
      immediate: true,
    },
    externalParams: {
      handler() {
        this.formData = {
          ...this.formData,
          ...this.externalParams,
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    normalizeComponent(component) {
      return typeof component === 'string' ? toKebabCase(component) : component
    },
    initFormData() {
      const nextData = {}
      ;(this.items || []).forEach((item) => {
        nextData[item.prop] = item.defaultValue !== undefined ? item.defaultValue : undefined
      })
      this.formData = {
        ...nextData,
        ...this.externalParams,
      }
    },
    isSlotItem(item) {
      return item && (item.type === 'slot' || item.slot === true || typeof item.slot === 'string')
    },
    getSlotRenderer(item) {
      const name = typeof item.slot === 'string' ? item.slot : item.slotName || item.prop
      return this.slotRenderers[name] || null
    },
    isSelectComponent(item) {
      const name = String(this.normalizeComponent(item.component || '') || '')
      return name === 'el-select'
    },
    handleSearch() {
      this.$emit('search', { ...this.formData, _resetPage: true })
    },
    handleReset() {
      const nextData = {}
      ;(this.items || []).forEach((item) => {
        nextData[item.prop] = item.defaultValue !== undefined ? item.defaultValue : undefined
      })
      this.formData = {
        ...nextData,
        ...this.externalParams,
      }
      this.$emit('search', { ...this.formData, _resetPage: true })
      this.$emit('reset')
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    getFormData() {
      return { ...this.formData }
    },
    setFormData(data) {
      this.formData = {
        ...this.formData,
        ...(data || {}),
      }
    },
    resetForm() {
      this.handleReset()
    },
    validate() {
      return this.$refs.formRef && this.$refs.formRef.validate ? this.$refs.formRef.validate() : Promise.resolve(true)
    },
    clearValidate(props) {
      if (this.$refs.formRef && this.$refs.formRef.clearValidate) {
        this.$refs.formRef.clearValidate(props)
      }
    },
  },
}
</script>

<style scoped>
.page-search {
  margin-bottom: 16px;
  padding: 16px 16px 0;
  background: #fff;
  border-radius: 4px;
}

.page-search__actions {
  display: flex;
  align-items: center;
}

.page-search__actions /deep/ .el-form-item {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.page-search__actions /deep/ .el-form-item__content {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.page-search__actions /deep/ .el-button {
  white-space: nowrap;
}

.page-search__form {
  width: 100%;
}

.page-search__form /deep/ .el-form-item {
  display: flex;
  align-items: center;
  width: 100%;
  margin-right: 0;
}

.page-search__form /deep/ .el-form-item__label {
  float: none;
  white-space: nowrap;
  padding-right: 12px;
}

.page-search__form /deep/ .el-form-item__content {
  flex: 1;
  min-width: 0;
}

.page-search__form /deep/ .el-form-item__content > .el-input,
.page-search__form /deep/ .el-form-item__content > .el-textarea,
.page-search__form /deep/ .el-form-item__content > .el-select,
.page-search__form /deep/ .el-form-item__content > .el-date-editor,
.page-search__form /deep/ .el-form-item__content > .el-cascader,
.page-search__form /deep/ .el-form-item__content > .el-autocomplete,
.page-search__form /deep/ .el-form-item__content > .el-input-number,
.page-search__form /deep/ .el-form-item__content > .el-slider {
  width: 100%;
}
</style>
