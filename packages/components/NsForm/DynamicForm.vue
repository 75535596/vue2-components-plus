<template>
  <div
    v-if="rows && rows.length"
    class="ns-dynamic-form"
    :class="formClassList"
    :style="wrapperStyle"
  >
    <div
      v-for="(row, rowIndex) in rows"
      :key="`row-${rowIndex}`"
      class="ns-dynamic-form__row"
      :style="rowStyle"
    >
      <div
        v-for="(item, itemIndex) in row"
        :key="item.key || `${rowIndex}-${itemIndex}`"
        class="ns-dynamic-form__item"
        :class="{ 'has-children': hasChildren(item) }"
        :style="getItemStyle(item, row)"
      >
        <template v-if="hasChildren(item)">
          <div
            v-if="!item.hideLabel && item.label"
            class="ns-dynamic-form__group-label"
            :style="groupLabelStyle"
          >
            {{ item.label }}
          </div>
          <div class="ns-dynamic-form__children">
            <div
              v-for="(child, childIndex) in item.children"
              :key="child.key || `${rowIndex}-${itemIndex}-${childIndex}`"
              class="ns-dynamic-form__child"
            >
              <div
                v-if="!child.hideLabel && child.label"
                class="ns-dynamic-form__label"
                :class="{ 'has-point': hasPoint || isRequiredField(child) }"
                :style="labelStyle"
              >
                {{ child.label }}
              </div>

              <div class="ns-dynamic-form__value" :style="valueStyle">
                <template v-if="showReadOnlyText(child)">
                  <span v-sline>{{ getReadOnlyDisplayValue(child) }}</span>
                </template>
                <template v-else-if="child.component">
                  <el-form-item
                    class="ns-dynamic-form__form-item"
                    :label-width="'0px'"
                    :prop="`${formPropKey}.${rowIndex}.${itemIndex}.children.${childIndex}.value`"
                    :rules="getFieldRules(child)"
                    :required="getFieldRequired(child)"
                  >

                    <form-field-renderer
                      :field="child"
                      :value="child.value"
                      @input="updateFieldValue(child, $event)"
                      @ref="setComponentRef(child, $event)"
                    />
                  </el-form-item>
                </template>
                <template v-else>
                  <span v-sline>{{ normalizeDisplayValue(child.value, child) }}</span>
                </template>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-if="!item.hideLabel && item.label"
            class="ns-dynamic-form__label"
            :class="{ 'has-point': hasPoint || isRequiredField(item) }"
            :style="labelStyle"
          >
            {{ item.label }}
          </div>

          <div class="ns-dynamic-form__value" :style="valueStyle">
            <template v-if="showReadOnlyText(item)">
              <span v-sline>{{ getReadOnlyDisplayValue(item) }}</span>
            </template>
            <template v-else-if="item.component">
              <el-form-item
                class="ns-dynamic-form__form-item"
                :label-width="'0px'"
                :prop="`${formPropKey}.${rowIndex}.${itemIndex}.value`"
                :rules="getFieldRules(item)"
                :required="getFieldRequired(item)"
              >

                <form-field-renderer
                  :field="item"
                  :value="item.value"
                  @input="updateFieldValue(item, $event)"
                  @ref="setComponentRef(item, $event)"
                />
              </el-form-item>
            </template>
            <template v-else>
              <span v-sline>{{ normalizeDisplayValue(item.value, item) }}</span>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import FormFieldRenderer from './FormFieldRenderer'
import { isNotNull } from '../../utils'

function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item))
  }
  const result = {}
  Object.keys(value).forEach((key) => {
    result[key] = deepClone(value[key])
  })
  return result
}

function normalizeComponentName(component) {
  const name = String(typeof component === 'string' ? component : component && component.name ? component.name : '')
  return name.replace(/-/g, '').toLowerCase()
}

export default {
  name: 'NsForm',
  components: {
    FormFieldRenderer,
  },
  props: {
    model: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    labelWidth: {
      type: String,
      default: '80px',
    },
    superLabelWidth: {
      type: String,
      default: '30px',
    },
    labelColor: {
      type: String,
      default: '#0A7BFF',
    },
    gapH: {
      type: String,
      default: '10px',
    },
    gapV: {
      type: String,
      default: '10px',
    },
    height: {
      type: String,
      default: '32px',
    },
    rows: {
      type: Array,
      default: () => [],
    },
    backgroundColor: {
      type: String,
      default: '',
    },
    valueEmptyTag: {
      type: String,
      default: '--',
    },
    formPropKey: {
      type: String,
      default: 'rows',
    },
    hasPoint: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      componentRefs: {},
    }
  },
  computed: {
    formClassList() {
      return {
        'is-vertical': this.model.indexOf('vertical') > -1,
        'is-table': this.model.indexOf('table') > -1,
        'is-readonly': this.readOnly,
      }
    },
    wrapperStyle() {
      return {
        '--ns-form-label-width': this.normalizeSize(this.labelWidth),
        '--ns-form-super-label-width': this.normalizeSize(this.superLabelWidth),
        '--ns-form-label-color': this.labelColor,
        '--ns-form-row-gap': this.gapV,
        '--ns-form-col-gap': this.gapH,
        '--ns-form-item-height': this.normalizeSize(this.height),
        '--ns-form-background-color': this.backgroundColor || '#ffffff',
      }
    },
    rowStyle() {
      return {
        marginBottom: this.model.indexOf('table') > -1 ? '0' : this.gapV,
      }
    },
    labelStyle() {
      return {
        width: this.normalizeSize(this.labelWidth),
        color: this.labelColor,
      }
    },
    groupLabelStyle() {
      return {
        width: this.normalizeSize(this.superLabelWidth),
        color: this.labelColor,
      }
    },
    valueStyle() {
      return {
        minHeight: this.normalizeSize(this.height),
      }
    },
  },
  watch: {
    rows: {
      handler(newRows) {
        this.initializeDefaultValues(newRows)
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    walkFields(callback) {
      ;(this.rows || []).forEach((row, rowIndex) => {
        ;(row || []).forEach((item, itemIndex) => {
          callback(item, rowIndex, itemIndex, null, null)
          ;(item.children || []).forEach((child, childIndex) => {
            callback(child, rowIndex, itemIndex, childIndex, item)
          })
        })
      })
    },
    initializeDefaultValues(rows) {
      ;(rows || []).forEach((row) => {
        ;(row || []).forEach((item) => {
          if (item && item.key && item.defaultValue === undefined) {
            this.$set(item, 'defaultValue', deepClone(item.value))
          }
          ;(item.children || []).forEach((child) => {
            if (child && child.key && child.defaultValue === undefined) {
              this.$set(child, 'defaultValue', deepClone(child.value))
            }
          })
        })
      })
    },
    normalizeSize(value) {
      if (value === null || value === undefined || value === '') return ''
      return /^\d+$/.test(String(value)) ? `${value}px` : String(value)
    },
    hasChildren(item) {
      return Array.isArray(item.children) && item.children.length > 0
    },
    getItemStyle(item, row) {
      if (item.span === 0) {
        return { display: 'none' }
      }
      if (typeof item.span === 'string' && item.span.indexOf('%') > -1) {
        return {
          flex: `0 0 ${item.span}`,
          maxWidth: item.span,
        }
      }
      if (item.span !== undefined && item.span !== null && item.span !== '') {
        const span = Number(item.span)
        if (!Number.isNaN(span)) {
          const width = span > 24 ? `${span}px` : `${(span / 24) * 100}%`
          return {
            flex: `0 0 ${width}`,
            maxWidth: width,
          }
        }
      }
      const columns = (row || []).filter((field) => field && field.span !== 0).length || 1
      const width = `calc(${100 / columns}% - ${this.gapH})`
      return {
        flex: `0 0 ${width}`,
        maxWidth: width,
      }
    },
    getFieldRules(field) {
      if (this.readOnly) return []
      return (field.params && field.params.rules) || []
    },
    isRequiredField(field) {
      if (!field || this.readOnly) return false
      if (typeof field.required === 'boolean') {
        return field.required
      }
      return this.getFieldRules(field).some((rule) => rule && rule.required)
    },
    getFieldRequired(field) {
      if (!field || this.readOnly) return false
      return field && typeof field.required === 'boolean' ? field.required : undefined
    },


    updateFieldValue(field, value) {
      this.$set(field, 'value', value)
    },

    setComponentRef(field, ref) {
      if (!field || !field.key) return
      this.$set(field, 'ref', ref)
      this.$set(this.componentRefs, field.key, ref)
    },
    showReadOnlyText(field) {
      return this.readOnly && !(field && field.readOnlyUseComponent)
    },
    normalizeDisplayValue(value, field) {
      if (isNotNull(value)) {
        if (Array.isArray(value)) {
          return value.join('，')
        }
        return value
      }
      return (field && field.valueEmptyTag) || this.valueEmptyTag
    },
    getReadOnlyDisplayValue(field) {
      if (!field) {
        return this.valueEmptyTag
      }
      if (typeof field.params?.formatter === 'function') {
        return field.params.formatter(field.value, field) || this.valueEmptyTag
      }
      if (!isNotNull(field.value)) {
        return field.valueEmptyTag || this.valueEmptyTag
      }
      if (this.isUploadComponent(field)) {
        return (field.value || [])
          .map((item) => item.fileName || item.name || item.filePath)
          .filter(Boolean)
          .join('，') || (field.valueEmptyTag || this.valueEmptyTag)
      }
      if (this.isSwitchComponent(field)) {
        return field.value
          ? field.params?.activeText || '是'
          : field.params?.inactiveText || '否'
      }
      if (this.isSelectLikeComponent(field)) {
        return this.getOptionDisplayText(field)
      }
      if (this.isCascaderComponent(field)) {
        return this.getCascaderDisplayValue(field)
      }
      if (Array.isArray(field.value)) {
        return field.value.join('，')
      }
      return field.value
    },
    getOptionDisplayText(field) {
      const options = field.params?.options || []
      const rawValue = field.value
      const valueList = Array.isArray(rawValue)
        ? rawValue
        : typeof rawValue === 'string' && rawValue.indexOf(',') > -1
          ? rawValue.split(',').filter(Boolean)
          : [rawValue]
      const labels = valueList
        .map((value) => {
          const option = options.find((item) => item.value === value)
          return option ? option.label : value
        })
        .filter((item) => item !== undefined && item !== null && item !== '')
      return labels.join('，') || field.valueEmptyTag || this.valueEmptyTag
    },
    getCascaderDisplayValue(field) {
      const params = field.params || {}
      const options = params.options || []
      const propConfig = {
        value: params.props?.value || 'value',
        label: params.props?.label || 'label',
        children: params.props?.children || 'children',
        multiple: !!params.props?.multiple,
        separator: params.separator || ' / ',
      }

      const normalizePath = (pathValue) => {
        if (Array.isArray(pathValue)) return pathValue
        if (typeof pathValue === 'string' && pathValue.indexOf(',') > -1) {
          return pathValue.split(',').filter(Boolean)
        }
        return [pathValue]
      }

      const getPathLabels = (pathValue) => {
        const labels = []
        let currentOptions = options
        normalizePath(pathValue).forEach((value) => {
          const current = (currentOptions || []).find((item) => item[propConfig.value] === value)
          if (current) {
            labels.push(current[propConfig.label])
            currentOptions = current[propConfig.children]
          }
        })
        return labels.join(propConfig.separator)
      }

      if (propConfig.multiple && Array.isArray(field.value) && Array.isArray(field.value[0])) {
        return field.value.map((item) => getPathLabels(item)).join('，')
      }
      return getPathLabels(field.value)
    },
    isSelectLikeComponent(field) {
      return ['elselect', 'elradiogroup', 'elcheckboxgroup'].includes(normalizeComponentName(field.component))
    },
    isSwitchComponent(field) {
      return normalizeComponentName(field.component) === 'elswitch'
    },
    isCascaderComponent(field) {
      return normalizeComponentName(field.component) === 'elcascader'
    },
    isUploadComponent(field) {
      return normalizeComponentName(field.component) === 'elupload'
    },
    getFormNodeByKey(key) {
      for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex += 1) {
        const row = this.rows[rowIndex]
        for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
          const item = row[colIndex]
          if (item.key === key) return item
          for (let childIndex = 0; childIndex < (item.children || []).length; childIndex += 1) {
            const child = item.children[childIndex]
            if (child.key === key) return child
          }
        }
      }
      return null
    },
    getFormNodeRefByKey(key) {
      return this.componentRefs[key] || null
    },
    getFormKvData() {
      const result = {}
      this.walkFields((field) => {
        if (!field || !field.key) return
        result[field.key] = Array.isArray(field.value) && Array.isArray(field.delValue)
          ? field.value.concat(field.delValue)
          : field.value
      })
      return result
    },
    resetForm(triggerEvents = false) {
      this.walkFields((field) => {
        if (!field || !field.key) return
        const oldValue = deepClone(field.value)
        const nextValue = field.defaultValue !== undefined
          ? deepClone(field.defaultValue)
          : Array.isArray(field.value)
            ? []
            : typeof field.value === 'boolean'
              ? false
              : typeof field.value === 'number'
                ? 0
                : ''
        this.$set(field, 'value', nextValue)
        if (field.delValue !== undefined) {
          this.$set(field, 'delValue', [])
        }
        if (field.params && Array.isArray(field.params.fileList)) {
          field.params.fileList.splice(0, field.params.fileList.length)
        }
        if (triggerEvents && JSON.stringify(oldValue) !== JSON.stringify(nextValue)) {
          if (typeof field.events?.change === 'function') {
            this.$nextTick(() => field.events.change(nextValue))
          }
          if (typeof field.events?.input === 'function') {
            this.$nextTick(() => field.events.input(nextValue))
          }
        }
      })
    },
    setFormData(data) {
      if (!data || typeof data !== 'object') {
        return
      }
      this.walkFields((field) => {
        if (!field || !field.key || !Object.prototype.hasOwnProperty.call(data, field.key)) return
        let nextValue = deepClone(data[field.key])
        if (this.isCascaderComponent(field) && typeof nextValue === 'string' && nextValue.indexOf(',') > -1) {
          nextValue = nextValue.split(',').filter(Boolean)
        }
        this.$set(field, 'value', nextValue)
        if (this.isUploadComponent(field)) {
          const fileList = Array.isArray(nextValue) ? deepClone(nextValue) : []
          if (field.params) {
            this.$set(field.params, 'fileList', fileList)
          }
        }
      })
    },
    initDefaultValues() {
      this.initializeDefaultValues(this.rows)
    },
  },
}
</script>

<style scoped>
.ns-dynamic-form {
  width: 100%;
}

.ns-dynamic-form__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ns-form-col-gap);
}

.ns-dynamic-form__item {
  display: flex;
  align-items: flex-start;
  padding: 0;
}

.ns-dynamic-form__item.has-children {
  align-items: stretch;
}

.ns-dynamic-form.is-vertical .ns-dynamic-form__item,
.ns-dynamic-form__child {
  background: var(--ns-form-background-color);
  border-radius: 4px;
}

.ns-dynamic-form__label,
.ns-dynamic-form__group-label {
  flex: none;
  width: var(--ns-form-label-width);
  min-height: var(--ns-form-item-height);
  line-height: var(--ns-form-item-height);
  padding-right: 12px;
  color: var(--ns-form-label-color);
  word-break: break-all;
}

.ns-dynamic-form__group-label {
  width: var(--ns-form-super-label-width);
  color: var(--ns-form-label-color);
}

.ns-dynamic-form__label.has-point::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.ns-dynamic-form__value {
  flex: 1;
  min-width: 0;
  line-height: var(--ns-form-item-height);
}

.ns-dynamic-form__children {
  flex: 1;
}

.ns-dynamic-form__child {
  display: flex;
  padding: 6px 0;
}

.ns-dynamic-form__form-item {
  margin-bottom: 0;
}

.ns-dynamic-form__form-item /deep/ .el-form-item__content {
  line-height: normal;
}

.ns-dynamic-form.is-table {
  border: 1px solid #ebeef5;
  border-bottom: 0;
}

.ns-dynamic-form.is-table .ns-dynamic-form__row {
  gap: 0;
  margin-bottom: 0 !important;
}

.ns-dynamic-form.is-table .ns-dynamic-form__item {
  padding: 12px;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.ns-dynamic-form.is-table .ns-dynamic-form__item:last-child {
  border-right: 0;
}
</style>
