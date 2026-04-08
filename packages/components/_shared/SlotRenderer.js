export default {
  name: 'NsSlotRenderer',
  functional: true,
  props: {
    renderer: {
      type: Function,
      default: null,
    },
    scope: {
      type: Object,
      default: () => ({}),
    },
  },
  render(h, ctx) {
    const renderer = ctx.props.renderer
    return renderer ? renderer(ctx.props.scope || {}) : null
  },
}
