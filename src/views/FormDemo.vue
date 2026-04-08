<template>
  <div class="demo-page">
    <el-card shadow="never" class="demo-card">
      <div slot="header" class="demo-card__header">
        <div>
          <div class="demo-card__title">NsForm 动态表单预览</div>
          <div class="demo-card__desc">覆盖校验、回填、只读、级联、上传和动态表单项等常见场景。</div>
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
        <el-button @click="toggleReadOnly">切换只读</el-button>
        <el-button @click="notifyInnerButton">触发自定义事件</el-button>
        <el-button v-if="insideDialog" type="danger" plain @click="$emit('close')">从内容区关闭弹窗</el-button>
      </div>

      <el-form ref="shellForm" :model="formState" label-position="top" class="shell-form">
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
            gapH="20px"
            gapV="10px"
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
            gapV="10px"
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
            gapV="10px"
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
            gapV="10px"
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
            gapV="10px"
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

<script>
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

export default {
  name: 'FormDemo',
  props: {
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
  },
  data() {
    return {
      demoReadOnly: this.readOnly,
      outputText: '',
      uploadFileList: [],
      formState: {
        rows: createRows(),
        rows2: createRows2(),
        rows3: createRows3(),
        rows4: createRows4(),
        rowsUpload: createRowsUpload(),
      },
    }
  },
  watch: {
    readOnly: {
      immediate: true,
      handler(value) {
        this.demoReadOnly = value
        this.syncUploadDisabled()
      },
    },
    demoReadOnly() {
      this.syncUploadDisabled()
    },
  },
  mounted() {
    this.bindFieldEvents()
    this.setUploadSlots()
    this.loadDetailData(false)
  },
  methods: {
    bindFieldEvents() {
      this.formState.rows[0][0].events.change = this.handleEnableChange
      this.formState.rows3[1][0].events.change = this.detAreaModeChange

      const uploadField = this.getUploadField()
      uploadField.params.httpRequest = this.mockUploadRequest
      uploadField.events = {
        success: this.handleUploadSuccess,
        change: this.handleUploadChange,
        remove: this.handleUploadRemove,
      }
      this.syncUploadDisabled()
    },
    setUploadSlots() {
      const uploadField = this.getUploadField()
      this.$set(uploadField, 'slots', {
        default: () =>
          this.$createElement('div', { class: 'upload-trigger' }, [
            this.$createElement('i', { class: 'el-icon-upload upload-trigger__icon' }),
            this.$createElement('div', { class: 'upload-trigger__title' }, '点击或拖拽文件到此处上传'),
            this.$createElement('div', { class: 'upload-trigger__sub' }, '仅做本地模拟，不会真正请求后台'),
          ]),
        tip: () =>
          this.$createElement('div', { class: 'el-upload__tip' }, '支持 txt / md / json / jpg / png / pdf，最多 2 个文件'),
      })
    },
    getUploadField() {
      return this.formState.rowsUpload[0][0]
    },
    getFormRefs() {
      return ['row1Ref', 'row2Ref', 'row3Ref', 'row4Ref', 'rowUploadRef']
        .map((name) => this.$refs[name])
        .filter(Boolean)
    },
    syncUploadDisabled() {
      const uploadField = this.getUploadField()
      if (uploadField && uploadField.params) {
        this.$set(uploadField.params, 'disabled', this.demoReadOnly)
      }
    },
    toggleReadOnly() {
      this.demoReadOnly = !this.demoReadOnly
    },
    showToast(message) {
      this.$message.info(message || '来自 FormDemo 的实例方法调用')
      return true
    },
    handleEnableChange(value) {
      this.$message.info(value ? '已启用模型能力' : '已停用模型能力')
    },
    ensureAbnormalField(mode) {
      const lastRow = this.formState.rows3[this.formState.rows3.length - 1]
      const lastKey = lastRow && lastRow[0] && lastRow[0].key
      if (lastKey === 'det_area_json') {
        this.formState.rows3.pop()
      }
      if (mode === 'abnormal') {
        this.formState.rows3.push([
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
    },
    detAreaModeChange(value) {
      this.ensureAbnormalField(value)
    },
    validateShellForm() {
      return new Promise((resolve, reject) => {
        this.$refs.shellForm.validate((valid) => {
          if (valid) {
            resolve(true)
            return
          }
          reject(new Error('表单校验失败'))
        })
      })
    },
    collectFormData() {
      return this.getFormRefs().reduce((result, ref) => {
        if (ref && typeof ref.getFormKvData === 'function') {
          return Object.assign(result, ref.getFormKvData())
        }
        return result
      }, {})
    },
    async getFormData() {
      try {
        await this.validateShellForm()
        const data = this.collectFormData()
        this.outputText = JSON.stringify(data, null, 2)
        this.$message.success('表单校验成功')
        return data
      } catch (error) {
        this.outputText = ''
        this.$message.error('表单校验失败，请先完善必填项')
        return false
      }
    },
    resetFormData(showMessage = true) {
      this.getFormRefs().forEach((ref) => {
        if (ref && typeof ref.resetForm === 'function') {
          ref.resetForm()
        }
      })
      this.ensureAbnormalField('normal')
      this.uploadFileList = []
      const uploadField = this.getUploadField()
      this.$set(uploadField.params, 'fileList', [])
      this.$set(uploadField, 'value', [])
      this.$set(uploadField, 'delValue', [])
      this.$nextTick(() => {
        this.$refs.shellForm.clearValidate()
        this.outputText = ''
        if (showMessage) {
          this.$message.success('表单已重置')
        }
      })
    },
    loadDetailData(showMessage = true) {
      if (showMessage) {
        this.$message.info('开始模拟详情回填')
      }
      setTimeout(() => {
        const detail = createDetailData()
        this.resetFormData(false)
        this.ensureAbnormalField(detail.det_area_mode)
        this.$nextTick(() => {
          this.getFormRefs().forEach((ref) => {
            if (ref && typeof ref.setFormData === 'function') {
              ref.setFormData(detail)
            }
          })
          this.uploadFileList = detail.upload_file.slice()
          this.$set(this.getUploadField().params, 'fileList', detail.upload_file.slice())
          if (showMessage) {
            this.$message.success('详情已回填')
          }
        })
      }, 300)
    },
    notifyInnerButton() {
      this.$emit('btnClick', this.collectFormData())
      this.$message.success('已触发自定义事件')
    },
    normalizeUploadList(fileList) {
      return (fileList || []).map((item) => {
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
    },
    syncUploadFieldValue(fileList, removedFile) {
      const uploadField = this.getUploadField()
      const normalizedList = this.normalizeUploadList(fileList)
      this.uploadFileList = (fileList || []).slice()
      this.$set(uploadField.params, 'fileList', (fileList || []).slice())
      this.$set(uploadField, 'value', normalizedList)
      if (removedFile) {
        const removed = this.normalizeUploadList([removedFile])[0]
        const delValue = Array.isArray(uploadField.delValue) ? uploadField.delValue.slice() : []
        delValue.push(Object.assign({}, removed, { isDelete: 1 }))
        this.$set(uploadField, 'delValue', delValue)
      }
      this.$nextTick(() => {
        this.$refs.shellForm.validateField('rowsUpload.0.0.value', function () {})
      })
    },
    mockUploadRequest(options) {
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
    },
    handleUploadSuccess(_response, _file, fileList) {
      this.syncUploadFieldValue(fileList)
      this.$message.success('文件上传成功')
    },
    handleUploadChange(_file, fileList) {
      this.syncUploadFieldValue(fileList)
    },
    handleUploadRemove(file, fileList) {
      this.syncUploadFieldValue(fileList, file)
      this.$message.warning('已移除文件')
    },
  },
}
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
