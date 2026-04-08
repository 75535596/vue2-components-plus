const RESERVED_KEYS = [
  'children',
  'slot',
  'headerSlot',
  'buttons',
  'enum',
  'type',
  'imageWidth',
  'imageHeight',
  'linkText',
]

const TableColumn = {
  name: 'NsTableColumn',
  props: {
    column: {
      type: Object,
      required: true,
    },
    slotRenderers: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    getColumnProps(column) {
      const props = { ...column }
      RESERVED_KEYS.forEach((key) => delete props[key])
      return props
    },
    getRenderer(name) {
      return name ? this.slotRenderers[name] : null
    },
    getCellValue(row, column) {
      return column.prop ? row[column.prop] : undefined
    },
    isVisible(config, row) {
      if (typeof config.show === 'function') {
        return config.show(row) !== false
      }
      if (config.show === undefined) {
        return true
      }
      return !!config.show
    },
    isDisabled(config, row) {
      return typeof config.disabled === 'function' ? !!config.disabled(row) : !!config.disabled
    },
    renderActionButtons(h, scope, column) {
      const buttons = Array.isArray(column.buttons) ? column.buttons : []
      return buttons
        .filter((button) => this.isVisible(button, scope.row))
        .map((button, index) => {
          const slotRenderer = this.getRenderer(button.slot)
          if (slotRenderer) {
            return slotRenderer({ ...scope, row: scope.row, column, button })
          }
          return h(
            'el-button',
            {
              key: button.label || index,
              props: {
                size: button.size || 'mini',
                type: button.link ? 'text' : button.type || 'text',
                icon: typeof button.icon === 'string' ? button.icon : undefined,
                disabled: this.isDisabled(button, scope.row),
              },
              on: {
                click: () => {
                  if (typeof button.handler === 'function') {
                    button.handler(scope.row, scope.$index)
                  }
                  this.$emit('button-click', scope.row, column, button)
                },
              },
            },
            [button.label],
          )
        })
    },
    renderTag(h, scope, column) {
      const cellValue = this.getCellValue(scope.row, column)
      const tagType = typeof column.tagType === 'function' ? column.tagType(scope.row, cellValue) : column.tagType
      const text = typeof column.formatter === 'function'
        ? column.formatter(scope.row, column, cellValue)
        : this.resolveEnumText(column, cellValue)
      return h('el-tag', { props: { type: tagType || 'info', size: column.tagSize || 'small' } }, [text])
    },
    renderImage(h, scope, column) {
      const src = this.getCellValue(scope.row, column)
      if (!src) {
        return '-'
      }
      return h('img', {
        style: {
          width: column.imageWidth || '40px',
          height: column.imageHeight || '40px',
          objectFit: 'cover',
          borderRadius: '4px',
        },
        attrs: {
          src,
          alt: column.label || 'image',
        },
      })
    },
    renderLink(h, scope, column) {
      const renderer = this.getRenderer(column.slot)
      if (renderer) {
        return renderer(scope)
      }
      const cellValue = this.getCellValue(scope.row, column)
      return h(
        'el-button',
        {
          props: {
            type: 'text',
          },
          on: {
            click: () => this.$emit('link-click', scope.row, column),
          },
        },
        [column.linkText || cellValue || '-'],
      )
    },
    resolveEnumText(column, value) {
      const enumList = column.enum || column.options || []
      if (!Array.isArray(enumList)) {
        return value
      }
      const matched = enumList.find((item) => item.value === value)
      return matched ? matched.label : value
    },
    renderDefaultCell(h, scope, column) {
      const renderer = this.getRenderer(column.slot)
      if (renderer) {
        return renderer(scope)
      }
      if (column.type === 'action') {
        return h('div', { class: 'ns-table-column__actions' }, this.renderActionButtons(h, scope, column))
      }
      if (column.type === 'tag') {
        return this.renderTag(h, scope, column)
      }
      if (column.type === 'image') {
        return this.renderImage(h, scope, column)
      }
      if (column.type === 'link') {
        return this.renderLink(h, scope, column)
      }
      const cellValue = this.getCellValue(scope.row, column)
      if (typeof column.formatter === 'function') {
        return column.formatter(scope.row, column, cellValue)
      }
      if (column.enum) {
        return this.resolveEnumText(column, cellValue)
      }
      return cellValue === undefined || cellValue === null || cellValue === '' ? '-' : cellValue
    },
    renderColumn(h, column) {
      const children = Array.isArray(column.children)
        ? column.children.map((child, index) =>
            h(TableColumn, {
              key: child.prop || child.label || index,
              props: {
                column: child,
                slotRenderers: this.slotRenderers,
              },
              on: {
                'link-click': (...args) => this.$emit('link-click', ...args),
                'button-click': (...args) => this.$emit('button-click', ...args),
              },
            }),
          )
        : []

      const headerRenderer = this.getRenderer(column.headerSlot)
      return h(
        'el-table-column',
        {
          props: this.getColumnProps(column),
          scopedSlots: children.length
            ? headerRenderer
              ? { header: headerRenderer }
              : undefined
            : {
                default: (scope) => this.renderDefaultCell(h, scope, column),
                ...(headerRenderer ? { header: headerRenderer } : {}),
              },
        },
        children,
      )
    },
  },
  render(h) {
    return this.renderColumn(h, this.column)
  },
}

export default TableColumn
