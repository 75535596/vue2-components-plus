<template>
  <div class="ns-form-title">
    <div class="ns-form-title__header">
      <slot name="title">
        <span class="ns-form-title__icon"></span>
        <span class="ns-form-title__text">{{ title }}</span>
      </slot>
    </div>
    <div class="ns-form-title__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { loadCssVars } from '@/utils/loadCssVars'

export default {
  name: 'NsFormTitle',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  mounted() {
    loadCssVars()
  },
}
</script>

<style scoped>
.ns-form-title {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--matrix-form-title-margin-bottom);
}

.ns-form-title__header {
  display: flex;
  align-items: center;
  gap: var(--matrix-form-title-gap);
  margin-bottom: var(--matrix-form-title-margin-bottom);
  color: var(--matrix-form-title-color);
}

.ns-form-title__icon {
  display: inline-block;
  width: var(--matrix-form-title-width);
  height: var(--matrix-form-title-height);
  border-radius: 4px;
  background: var(--matrix-form-title-icon);
}

.ns-form-title__text {
  font-size: 18px;
  font-weight: 500;
  color: var(--matrix-form-title-color);
}

.ns-form-title__content {
  width: 100%;
}
</style>
