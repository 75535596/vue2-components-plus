<template>
  <div class="demo-page">
    <el-card shadow="never" class="demo-card">
      <div slot="header" class="demo-card__header">
        <div>
          <div class="demo-card__title">表单场景能力面板</div>
          <div class="demo-card__desc">覆盖校验、回填、只读、级联、上传和动态表单项等常见场景，使用 &lt;script setup&gt; 写法。</div>

        </div>
        <el-tag size="small" :type="demoReadOnly ? 'info' : 'success'">
          {{ demoReadOnly ? '只读模式' : '编辑模式' }}
        </el-tag>
      </div>

      <el-alert
        v-if="hintText"
        :title="hintText"
        type="info"
        :closable="false"
        class="demo-alert"
      />

      <div class="toolbar">
        <el-button type="primary" @click="getFormData">获取表单数据</el-button>
        <el-button @click="loadDetailData()">模拟详情回填</el-button>
        <el-button @click="resetFormData()">重置表单</el-button>
        <el-button @click="inspectFormNode">查看节点配置</el-button>
        <el-button @click="inspectFormNodeRef">查看节点实例</el-button>
        <el-button @click="rebuildDefaultValues">重建默认值快照</el-button>
        <el-button @click="toggleReadOnly">切换只读</el-button>
        <el-button @click="notifyInnerButton">触发自定义事件</el-button>
        <el-button v-if="insideDialog" type="danger" plain @click="emit('close')">从内容区关闭弹窗</el-button>
      </div>
      <div class="toolbar toolbar--compact">
        <span class="toolbar__label">标签方向</span>
        <el-radio-group v-model="labelPosition" size="small">
          <el-radio-button label="left">left</el-radio-button>
          <el-radio-button label="top">top</el-radio-button>
          <el-radio-button label="right">right</el-radio-button>
        </el-radio-group>
      </div>

      <el-form ref="shellForm" :model="formState" class="shell-form">
        <NsFormTitle title="模型参数">
          <NsForm
            ref="row1Ref"
            :readOnly="demoReadOnly"
            :model="demoReadOnly ? '' : 'vertical'"
            :rows="formState.rows"
            formPropKey="rows"
            backgroundColor="#fff"
            labelColor="#606266"
            labelWidth="140"
            gapH="20"
            gapV="20"
            :labelPosition="labelPosition"
          />
        </NsFormTitle>

        <NsFormTitle title="视频配置">
          <NsForm
            ref="row2Ref"
            :readOnly="demoReadOnly"
            :model="demoReadOnly ? '' : 'vertical'"
            :rows="formState.rows2"
            formPropKey="rows2"
            backgroundColor="#fff"
            labelColor="#606266"
            labelWidth="140"
            gapH="20px"
            gapV="20px"
            :labelPosition="labelPosition"
          />
        </NsFormTitle>

        <NsFormTitle title="结果保存">
          <NsForm
            ref="row3Ref"
            :readOnly="demoReadOnly"
            :model="demoReadOnly ? '' : 'vertical'"
            :rows="formState.rows3"
            formPropKey="rows3"
            backgroundColor="#fff"
            labelColor="#606266"
            labelWidth="140"
            gapH="20px"
            gapV="20px"
            :labelPosition="labelPosition"
          />
        </NsFormTitle>

        <NsFormTitle title="级联选择器">
          <NsForm
            ref="row4Ref"
            :readOnly="demoReadOnly"
            :model="demoReadOnly ? '' : 'vertical'"
            :rows="formState.rows4"
            formPropKey="rows4"
            backgroundColor="#fff"
            labelColor="#606266"
            labelWidth="140"
            gapH="20px"
            gapV="20px"
            :labelPosition="labelPosition"
          />
        </NsFormTitle>

        <NsFormTitle title="文件上传">
          <NsForm
            ref="rowUploadRef"
            :readOnly="demoReadOnly"
            :model="demoReadOnly ? '' : 'vertical'"
            :rows="formState.rowsUpload"
            formPropKey="rowsUpload"
            backgroundColor="#fff"
            labelColor="#606266"
            labelWidth="140"
            gapH="20px"
            gapV="20px"
            :labelPosition="labelPosition"
          />
        </NsFormTitle>
      </el-form>
    </el-card>

    <el-card shadow="never" class="result-card">
      <div slot="header" class="result-card__header">
        <span>输出结果</span>
        <el-button type="text" @click="showToast('已通过组件实例调用方法')">调用实例方法示例</el-button>
      </div>
      <pre class="result-content">{{ outputText || '点击“获取表单数据”后在此查看结果。' }}</pre>
    </el-card>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false,
  },
  insideDialog: {
    type: Boolean,
    default: false,
  },
  hintText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'btnClick'])

const CustomRegionEditor = {
  name: 'CustomRegionEditor',
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
    },
  },
  render(h) {
    return h('div', { class: 'custom-region-editor' }, [
      h('div', { class: 'custom-region-editor__label' }, '模拟区域编辑器'),
      h('el-input', {
        props: {
          type: 'textarea',
          rows: 3,
          value: this.value,
          placeholder: '请输入区域 JSON 或坐标信息',
        },
        on: {
          input: this.handleInput,
        },
      }),
    ])
  },
}

function createRows() {
  return [
    [
      {
        key: 'isEnable',
        label: '是否启用',
        value: false,
        component: 'ElSwitch',
        events: {},
        params: {
          activeText: '启用',
          inactiveText: '禁用',
        },
      },
      {
        key: 'modelName',
        label: '模型名称',
        value: 'demo-detector',
        component: 'ElInput',
        params: {
          clearable: true,
          maxlength: 30,
          rules: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
        },
      },
    ],
    [
      {
        key: 'confidence',
        label: '置信度阈值',
        value: '0.60',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 0, max: 1 },
          rules: [{ required: true, message: '请输入置信度', trigger: 'blur' }],
        },
      },
      {
        key: 'iou',
        label: 'IOU 阈值',
        value: '0.45',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 0, max: 1 },
          rules: [{ required: true, message: '请输入 IOU', trigger: 'blur' }],
        },
      },
    ],
    [
      {
        key: 'inferMode',
        label: '推理模式',
        value: 'fast',
        component: 'ElSelect',
        params: {
          clearable: true,
          options: [
            { label: '快速', value: 'fast' },
            { label: '平衡', value: 'balanced' },
            { label: '高精度', value: 'accurate' },
          ],
        },
      },
      {
        key: 'batchSize',
        label: '批量大小',
        value: '1',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 1, max: 16, int: true },
        },
      },
    ],
  ]
}

function createRows2() {
  return [
    [
      {
        key: 'timeInterval',
        label: '时间间隔（秒）',
        value: '5',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 0, max: 6000, int: true },
          rules: [{ required: true, message: '请输入时间间隔', trigger: 'blur' }],
        },
      },
      {
        key: 'stuck_threshold',
        label: '所属工程',
        value: ['component', 'form'],
        component: 'ElCascader',
        params: {
          clearable: true,
          props: {
            checkStrictly: true,
            emitPath: true,
          },
          options: [
            {
              value: 'guide',
              label: 'Guide',
              children: [
                { value: 'disciplines', label: 'Disciplines' },
                { value: 'navigation', label: 'Navigation' },
              ],
            },
            {
              value: 'component',
              label: '组件库',
              children: [
                { value: 'form', label: 'Form' },
                { value: 'table', label: 'Table' },
              ],
            },
          ],
          rules: [{ required: true, message: '请选择所属工程', trigger: 'change' }],
        },
      },
    ],
    [
      {
        key: 'maxRetries',
        label: '最大重连次数',
        value: '3',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 0, max: 20, int: true },
          rules: [{ required: true, message: '请输入重连次数', trigger: 'blur' }],
        },
      },
      {
        key: 'streamUrl',
        label: '视频流地址',
        value: 'rtsp://example.com/live/001',
        component: 'ElInput',
        params: {
          clearable: true,
          rules: [{ required: true, message: '请输入视频流地址', trigger: 'blur' }],
        },
      },
    ],
  ]
}

function createRows3() {
  return [
    [
      {
        key: 'saveVideo',
        label: '是否保存视频',
        value: true,
        component: 'ElRadioGroup',
        params: {
          options: [
            { label: '是', value: true },
            { label: '否', value: false },
          ],
          rules: [{ required: true, message: '请选择是否保存视频', trigger: 'change' }],
        },
      },
      {
        key: 'preBufferSecond',
        label: '帧前缓存（秒）',
        value: '10',
        component: 'ElInput',
        params: {
          clearable: true,
          'v-length.range': { min: 0, max: 120, int: true },
          rules: [{ required: true, message: '请输入缓存时长', trigger: 'blur' }],
        },
      },
    ],
    [
      {
        key: 'det_area_mode',
        label: '检测区域模式',
        value: 'normal',
        component: 'ElRadioGroup',
        events: {},
        params: {
          options: [
            { label: '常规检测', value: 'normal' },
            { label: '非常规检测', value: 'abnormal' },
          ],
          rules: [{ required: true, message: '请选择区域模式', trigger: 'change' }],
        },
      },
    ],
  ]
}

function createRows4() {
  return [
    [
      {
        key: 'region',
        label: '地区选择',
        value: ['beijing', 'chaoyang'],
        component: 'ElCascader',
        params: {
          props: {
            multiple: false,
            checkStrictly: true,
            emitPath: true,
          },
          showAllLevels: false,
          options: [
            {
              value: 'beijing',
              label: '北京市',
              children: [
                { value: 'chaoyang', label: '朝阳区' },
                { value: 'haidian', label: '海淀区' },
              ],
            },
            {
              value: 'shanghai',
              label: '上海市',
              children: [{ value: 'pudong', label: '浦东新区' }],
            },
          ],
        },
      },
      {
        key: 'department',
        label: '部门选择',
        value: ['company', 'tech', 'frontend'],
        component: 'ElCascader',
        params: {
          props: {
            value: 'code',
            label: 'name',
            children: 'children',
            checkStrictly: true,
            emitPath: true,
          },
          separator: ' / ',
          options: [
            {
              code: 'company',
              name: '公司总部',
              children: [
                {
                  code: 'tech',
                  name: '技术部',
                  children: [
                    { code: 'frontend', name: '前端组' },
                    { code: 'backend', name: '后端组' },
                  ],
                },
                { code: 'sales', name: '销售部' },
              ],
            },
          ],
        },
      },
    ],
    [
      {
        key: 'singleLevelCascader',
        label: '单层级联',
        value: 'shanghai',
        component: 'ElCascader',
        params: {
          options: [
            { value: 'beijing', label: '北京市' },
            { value: 'shanghai', label: '上海市' },
            { value: 'guangzhou', label: '广州市' },
          ],
        },
      },
      {
        key: 'notifyEmails',
        label: '通知邮箱',
        value: 'demo@example.com',
        component: 'ElInput',
        params: {
          clearable: true,
        },
      },
    ],
  ]
}

function createRowsUpload() {
  return [
    [
      {
        key: 'upload_file',
        label: '上传模型文件',
        value: [],
        component: 'ElUpload',
        events: {},
        params: {
          drag: true,
          multiple: true,
          action: '#',
          limit: 2,
          fileList: [],
          accept: '.txt,.md,.json,.jpg,.png,.pdf',
          autoUpload: true,
          httpRequest: null,
          rules: [{ required: true, message: '请上传至少一个文件', trigger: 'change' }],
        },
        slots: {},
      },
    ],
  ]
}

function createDetailData() {
  return {
    isEnable: true,
    modelName: 'helmet-detector-v2',
    confidence: '0.72',
    iou: '0.33',
    inferMode: 'accurate',
    batchSize: '4',
    timeInterval: '3',
    stuck_threshold: ['component', 'table'],
    maxRetries: '5',
    streamUrl: 'rtsp://example.com/live/demo',
    saveVideo: true,
    preBufferSecond: '8',
    det_area_mode: 'abnormal',
    det_area_json: '{"x":10,"y":12,"width":320,"height":180}',
    region: ['shanghai', 'pudong'],
    department: ['company', 'tech', 'backend'],
    singleLevelCascader: 'guangzhou',
    notifyEmails: 'ops@example.com',
    upload_file: [
      {
        name: '示例说明.md',
        url: 'https://cdn.jsdelivr.net/gh/vuejs/art@master/logo.png',
        fileName: '示例说明.md',
        filePath: 'https://cdn.jsdelivr.net/gh/vuejs/art@master/logo.png',
        fileSize: 2048,
      },
    ],
  }
}

const demoReadOnly = ref(props.readOnly)
const labelPosition = ref('left')
const outputText = ref('')
const uploadFileList = ref([])
const formState = reactive({
  rows: createRows(),
  rows2: createRows2(),
  rows3: createRows3(),
  rows4: createRows4(),
  rowsUpload: createRowsUpload(),
})

const shellForm = ref(null)
const row1Ref = ref(null)
const row2Ref = ref(null)
const row3Ref = ref(null)
const row4Ref = ref(null)
const rowUploadRef = ref(null)

const { proxy } = getCurrentInstance()

const getUploadField = () => formState.rowsUpload[0][0]
const getFormRefs = () => [row1Ref.value, row2Ref.value, row3Ref.value, row4Ref.value, rowUploadRef.value].filter(Boolean)

const syncUploadDisabled = () => {
  const uploadField = getUploadField()
  if (uploadField && uploadField.params) {
    proxy.$set(uploadField.params, 'disabled', demoReadOnly.value)
  }
}

watch(
  () => props.readOnly,
  (value) => {
    demoReadOnly.value = value
    syncUploadDisabled()
  },
  { immediate: true },
)

watch(demoReadOnly, () => {
  syncUploadDisabled()
})

const bindFieldEvents = () => {
  formState.rows[0][0].events.change = handleEnableChange
  formState.rows3[1][0].events.change = detAreaModeChange

  const uploadField = getUploadField()
  uploadField.params.httpRequest = mockUploadRequest
  uploadField.events = {
    success: handleUploadSuccess,
    change: handleUploadChange,
    remove: handleUploadRemove,
  }
  syncUploadDisabled()
}

const setUploadSlots = () => {
  const uploadField = getUploadField()
  proxy.$set(uploadField, 'slots', {
    default: () =>
      proxy.$createElement('div', { class: 'upload-trigger' }, [
        proxy.$createElement('i', { class: 'el-icon-upload upload-trigger__icon' }),
        proxy.$createElement('div', { class: 'upload-trigger__title' }, '点击或拖拽文件到此处上传'),
        proxy.$createElement('div', { class: 'upload-trigger__sub' }, '仅做本地模拟，不会真正请求后台'),
      ]),
    tip: () =>
      proxy.$createElement('div', { class: 'el-upload__tip' }, '支持 txt / md / json / jpg / png / pdf，最多 2 个文件'),
  })
}

const toggleReadOnly = () => {
  demoReadOnly.value = !demoReadOnly.value
}

const showToast = (message) => {
  proxy.$message.info(message || '来自 FormDemo 的实例方法调用')
  return true
}

const handleEnableChange = (value) => {
  proxy.$message.info(value ? '已启用模型能力' : '已停用模型能力')
}

const ensureAbnormalField = (mode) => {
  const lastRow = formState.rows3[formState.rows3.length - 1]
  const lastKey = lastRow && lastRow[0] && lastRow[0].key
  if (lastKey === 'det_area_json') {
    formState.rows3.pop()
  }
  if (mode === 'abnormal') {
    formState.rows3.push([
      {
        key: 'det_area_json',
        label: '感兴趣区域',
        value: '',
        component: CustomRegionEditor,
        span: 24,
        params: {
          rules: [{ required: true, message: '请输入感兴趣区域', trigger: 'blur' }],
        },
      },
    ])
  }
}

const detAreaModeChange = (value) => {
  ensureAbnormalField(value)
}

const validateShellForm = () =>
  new Promise((resolve, reject) => {
    if (!shellForm.value) {
      reject(new Error('表单未就绪'))
      return
    }
    shellForm.value.validate((valid) => {
      if (valid) {
        resolve(true)
        return
      }
      reject(new Error('表单校验失败'))
    })
  })

const collectFormData = () =>
  getFormRefs().reduce((result, refInstance) => {
    if (refInstance && typeof refInstance.getFormKvData === 'function') {
      return Object.assign(result, refInstance.getFormKvData())
    }
    return result
  }, {})

const getFormData = async () => {
  try {
    await validateShellForm()
    const data = collectFormData()
    outputText.value = JSON.stringify(data, null, 2)
    proxy.$message.success('表单校验成功')
    return data
  } catch (error) {
    outputText.value = ''
    proxy.$message.error('表单校验失败，请先完善必填项')
    return false
  }
}

const resetFormData = (showMessage = true) => {
  getFormRefs().forEach((refInstance) => {
    if (refInstance && typeof refInstance.resetForm === 'function') {
      refInstance.resetForm()
    }
  })
  ensureAbnormalField('normal')
  uploadFileList.value = []
  const uploadField = getUploadField()
  proxy.$set(uploadField.params, 'fileList', [])
  proxy.$set(uploadField, 'value', [])
  proxy.$set(uploadField, 'delValue', [])
  nextTick(() => {
    shellForm.value.clearValidate()
    outputText.value = ''
    if (showMessage) {
      proxy.$message.success('表单已重置')
    }
  })
}

const loadDetailData = (showMessage = true) => {
  if (showMessage) {
    proxy.$message.info('开始模拟详情回填')
  }
  setTimeout(() => {
    const detail = createDetailData()
    resetFormData(false)
    ensureAbnormalField(detail.det_area_mode)
    nextTick(() => {
      getFormRefs().forEach((refInstance) => {
        if (refInstance && typeof refInstance.setFormData === 'function') {
          refInstance.setFormData(detail)
        }
      })
      uploadFileList.value = detail.upload_file.slice()
      proxy.$set(getUploadField().params, 'fileList', detail.upload_file.slice())
      if (showMessage) {
        proxy.$message.success('详情已回填')
      }
    })
  }, 300)
}

const notifyInnerButton = () => {
  emit('btnClick', collectFormData())
  proxy.$message.success('已触发自定义事件')
}

const inspectFormNode = () => {
  if (!row1Ref.value || typeof row1Ref.value.getFormNodeByKey !== 'function') {
    proxy.$message.warning('表单实例尚未就绪')
    return
  }
  const node = row1Ref.value.getFormNodeByKey('modelName')
  proxy.$message.info(node ? '已找到字段节点：' + node.label : '未找到字段节点 modelName')
}

const inspectFormNodeRef = () => {
  if (!row1Ref.value || typeof row1Ref.value.getFormNodeRefByKey !== 'function') {
    proxy.$message.warning('表单实例尚未就绪')
    return
  }
  const nodeRef = row1Ref.value.getFormNodeRefByKey('modelName')
  if (!nodeRef) {
    proxy.$message.warning('未找到字段实例 modelName')
    return
  }
  if (typeof nodeRef.focus === 'function') {
    nodeRef.focus()
  }
  proxy.$message.success('已获取 modelName 对应组件实例')
}

const rebuildDefaultValues = () => {
  getFormRefs().forEach((refInstance) => {
    if (refInstance && typeof refInstance.initDefaultValues === 'function') {
      refInstance.initDefaultValues()
    }
  })
  proxy.$message.success('已重建默认值快照')
}

const normalizeUploadList = (fileList) =>
  (fileList || []).map((item) => {
    const responseData = item && item.response && item.response.data ? item.response.data : item
    const fileName = responseData.fileName || item.name || '未命名文件'
    const filePath = responseData.filePath || item.url || ''
    const fileSize = responseData.fileSize || item.size || (item.raw && item.raw.size) || 0
    return {
      name: fileName,
      url: filePath,
      fileName,
      filePath,
      fileSize,
    }
  })

const syncUploadFieldValue = (fileList, removedFile) => {
  const uploadField = getUploadField()
  const normalizedList = normalizeUploadList(fileList)
  uploadFileList.value = (fileList || []).slice()
  proxy.$set(uploadField.params, 'fileList', (fileList || []).slice())
  proxy.$set(uploadField, 'value', normalizedList)
  if (removedFile) {
    const removed = normalizeUploadList([removedFile])[0]
    const delValue = Array.isArray(uploadField.delValue) ? uploadField.delValue.slice() : []
    delValue.push(Object.assign({}, removed, { isDelete: 1 }))
    proxy.$set(uploadField, 'delValue', delValue)
  }
  nextTick(() => {
    shellForm.value.validateField('rowsUpload.0.0.value', function () {})
  })
}

const mockUploadRequest = (options) => {
  const file = options.file
  const timer = setTimeout(() => {
    const filePath = URL.createObjectURL(file)
    const response = {
      code: 0,
      data: {
        fileName: file.name,
        filePath,
        fileSize: file.size || 0,
      },
    }
    if (typeof options.onSuccess === 'function') {
      options.onSuccess(response, file)
    }
  }, 400)

  return {
    abort() {
      clearTimeout(timer)
      if (typeof options.onError === 'function') {
        options.onError(new Error('上传已取消'))
      }
    },
  }
}

const handleUploadSuccess = (_response, _file, fileList) => {
  syncUploadFieldValue(fileList)
  proxy.$message.success('文件上传成功')
}

const handleUploadChange = (_file, fileList) => {
  syncUploadFieldValue(fileList)
}

const handleUploadRemove = (file, fileList) => {
  syncUploadFieldValue(fileList, file)
  proxy.$message.warning('已移除文件')
}

onMounted(() => {
  bindFieldEvents()
  setUploadSlots()
  loadDetailData(false)
})

defineExpose({
  getFormData,
  resetFormData,
  loadDetailData,
  showToast,
  inspectFormNode,
  inspectFormNodeRef,
  rebuildDefaultValues,
})
</script>

<style scoped>
.demo-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-card,
.result-card {
  border-radius: 12px;
}

.demo-card__header,
.result-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.demo-card__desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.demo-alert {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.toolbar--compact {
  margin-top: -8px;
}

.toolbar__label {
  font-size: 13px;
  color: #606266;
}

.shell-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-content {
  margin: 0;
  padding: 16px;
  min-height: 180px;
  max-height: 360px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background: #0f172a;
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

.custom-region-editor {
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  padding: 12px;
  background: #fafafa;
}

.custom-region-editor__label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
}

.upload-trigger {
  padding: 12px;
  text-align: center;
  color: #606266;
}

.upload-trigger__icon {
  font-size: 28px;
  color: #409eff;
}

.upload-trigger__title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
}

.upload-trigger__sub {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

@media (max-width: 960px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
