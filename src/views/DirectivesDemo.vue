<template>
  <div style="padding: 20px;">
    <!-- v-sline 指令演示 -->
    <div class="demo-section">
      <h2>1. v-sline 指令 - 单行文本溢出省略</h2>
      <div style="width: 200px; border: 1px solid #ccc; padding: 10px;">
        <p v-sline>这是一段很长很长很长很长很长很长的文本，用来测试单行省略效果</p>
      </div>
      <div style="width: 200px; border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
        <span v-sline>{{ longText }}</span>
      </div>
    </div>

    <!-- v-length 指令演示 -->
    <div class="demo-section">
      <h2>2. v-length 指令 - 输入长度限制</h2>

      <h3>基础用法 - 限制字符长度</h3>
      <div class="input-group">
        <label>限制5个字符:</label>
        <el-input v-model="basicInput" v-length="5" placeholder="最多输入5个字符" style="width: 300px;" />
        <span>当前: "{{ basicInput }}" ({{ basicInput.length }}/5)</span>
      </div>

      <h3>中文输入测试 - 限制10个字符</h3>
      <div class="input-group">
        <label>中文输入测试:</label>
        <el-input v-model="chineseInput" v-length="10" placeholder="测试中文输入（拼音输入时不截断）" style="width: 300px;" />
        <span>当前: "{{ chineseInput }}" ({{ chineseInput.length }}/10)</span>
        <el-tag type="info">输入中文时，拼音阶段不会截断，失去焦点后才会截断</el-tag>
      </div>

      <h3>原生 input 测试 - 限制8个字符</h3>
      <div class="input-group">
        <label>原生 input 测试:</label>
        <input v-model="nativeInput" v-length="8" placeholder="原生input测试" class="native-input" />
        <span>当前: "{{ nativeInput }}" ({{ nativeInput.length }}/8)</span>
      </div>

      <h3>数字模式 - v-length.number</h3>
      <div class="input-group">
        <label>仅数字，限制8位:</label>
        <el-input v-model="numberInput" v-length.number="8" placeholder="仅能输入数字，最多8位" style="width: 300px;" />
        <span>当前: "{{ numberInput }}" ({{ numberInput.length }}/8)</span>
      </div>

      <h3>正则模式（不支持小数，使用v-length.range） - v-length.regex</h3>
      <div class="input-group">
        <label>字母数字，限制6位:</label>
        <el-input
          v-model="regexInput"
          v-length.regex="{ maxLength: 6, pattern: /^[a-zA-Z0-9]*$/ }"
          placeholder="仅字母数字，最多6位"
          style="width: 300px;"
        />
        <span>当前: "{{ regexInput }}" ({{ regexInput.length }}/6)</span>
      </div>

      <h3>范围模式 - v-length.range</h3>
      <div class="input-group">
        <label>数字范围 0-100:</label>
        <el-input
          v-model="rangeInput1"
          v-length.range="{ min: 0, max: 100 }"
          placeholder="输入0-100之间的数字"
          style="width: 300px;"
        />
        <span>当前: "{{ rangeInput1 }}"</span>
        <el-tag v-if="rangeInput1 && (parseFloat(rangeInput1) < 0 || parseFloat(rangeInput1) > 100)" type="danger">超出范围</el-tag>
      </div>
      <div class="input-group">
        <label>负数范围 -50到50:</label>
        <el-input
          v-model="rangeInput2"
          v-length.range="{ min: -50, max: 50, maxLength: 10 }"
          placeholder="输入-50到50之间的数字"
          style="width: 300px;"
        />
        <span>当前: "{{ rangeInput2 }}"</span>
      </div>

      <div class="input-group">
        <label>小数范围 0.1-99.9:</label>
        <el-input
          v-model="rangeInput3"
          v-length.range="{ min: 0.1, max: 99.9 }"
          placeholder="输入0.1-99.9之间的小数"
          style="width: 300px;"
        />
        <span>当前: "{{ rangeInput3 }}"</span>
      </div>

      <div class="input-group">
        <label>百分比范围 0-100%:</label>
        <el-input
          v-model="rangeInput4"
          v-length.range="{ min: 0, max: 100, maxLength: 5 }"
          placeholder="输入0-100之间的百分比数值"
          style="width: 300px;"
        >
          <template #suffix>%</template>
        </el-input>
        <span>当前: "{{ rangeInput4 }}%"</span>
      </div>

      <h3>整数范围模式 - v-length.range (int)</h3>
      <div class="input-group">
        <label>整数范围 0-100 (仅整数):</label>
        <el-input
          v-model="rangeInput5"
          v-length.range="{ min: 0, max: 100, int: true }"
          placeholder="仅能输入0-100之间的整数"
          style="width: 300px;"
        />
        <span>当前: "{{ rangeInput5 }}"</span>
      </div>

      <div class="input-group">
        <label>年龄范围 1-120 (仅整数):</label>
        <el-input
          v-model="rangeInput6"
          v-length.range="{ min: 1, max: 120, int: true, maxLength: 3 }"
          placeholder="输入年龄1-120岁"
          style="width: 300px;"
        />
        <span>当前: "{{ rangeInput6 }}"岁</span>
      </div>

      <div class="input-group">
        <label>负整数范围 -10到10 (仅整数):</label>
        <el-input
          v-model="rangeInput7"
          v-length.range="{ min: -10, max: 10, int: true }"
          placeholder="输入-10到10之间的整数"
          style="width: 300px;"
        />
        <span>当前: "{{ rangeInput7 }}"</span>
      </div>
    </div>

    <!-- v-permission 指令演示 -->
    <div class="demo-section">
      <h2>3. v-permission 指令 - 按钮权限控制</h2>
      <p>当前权限列表: {{ btnsPermission.join(', ') }}</p>

      <h3>ID 权限控制 (默认模式)</h3>
      <div class="button-group">
        <el-button id="add_btn" v-permission type="primary">添加按钮 (有权限)</el-button>
        <el-button id="edit_btn" v-permission type="success">编辑按钮 (有权限)</el-button>
        <el-button id="delete_btn" v-permission type="danger">删除按钮 (无权限-隐藏)</el-button>
        <el-button id="view_btn" v-permission type="info">查看按钮 (无权限-隐藏)</el-button>
      </div>

      <h3>ID 权限控制 (display模式)</h3>
      <div class="button-group">
        <el-button id="export_btn" v-permission.id.display type="warning">导出按钮 (无权限-display:none)</el-button>
        <el-button id="import_btn" v-permission.id.display type="primary">导入按钮 (无权限-display:none)</el-button>
      </div>

      <h3>Class 权限控制</h3>
      <div class="button-group">
        <el-button class="admin-btn" v-permission.class type="primary">管理员按钮 (有权限)</el-button>
        <el-button class="super-admin" v-permission.class type="danger">超级管理员 (无权限)</el-button>
      </div>

      <div style="margin-top: 10px;">
        <el-button @click="togglePermission" type="primary">切换权限</el-button>
      </div>
    </div>

    <!-- v-event-unuse 和 v-event-use 指令演示 -->
    <div class="demo-section">
      <h2>4. v-event-unuse / v-event-use 指令 - 事件穿透控制</h2>

      <div class="event-demo-container" v-event-unuse @click="parentClick">
        <p>父容器 (v-event-unuse) - 点击事件被禁用</p>
        <div class="child-container" v-event-use @click="childClick">
          <p>子容器 (v-event-use) - 点击事件可用</p>
          <el-button type="primary">可点击的按钮</el-button>
        </div>
        <el-button type="danger">不可点击的按钮</el-button>
      </div>

      <p>点击结果: {{ eventResult }}</p>
    </div>

    <!-- 综合演示 -->
    <div class="demo-section">
      <h2>5. 综合演示</h2>
      <div class="comprehensive-demo">
        <div class="form-item">
          <label>用户名 (字母数字，最多8位):</label>
          <el-input
            v-model="username"
            v-length.regex="{ maxLength: 8, pattern: /^[a-zA-Z0-9]*$/ }"
            placeholder="用户名"
            style="width: 200px;"
          />
        </div>

        <div class="form-item">
          <label>年龄 (数字，最多3位):</label>
          <el-input
            v-model="age"
            v-length.number="3"
            placeholder="年龄"
            style="width: 200px;"
          />
        </div>

        <div class="form-item">
          <label>描述 (最多50字符):</label>
          <el-input
            v-model="description"
            v-length="50"
            type="textarea"
            placeholder="个人描述"
            style="width: 300px;"
          />
        </div>

        <div class="form-item">
          <label>长文本展示:</label>
          <div style="width: 200px; border: 1px solid #ddd; padding: 8px;">
            <span v-sline>{{ description || '这里会显示你输入的描述，如果太长会自动省略...' }}</span>
          </div>
        </div>

        <div class="form-item">
          <el-button id="save_btn" v-permission type="primary">保存 (需要权限)</el-button>
          <el-button @click="clearForm" type="default">清空</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, provide } from 'vue'

// v-sline 演示数据
const longText = ref('这是一个非常非常非常长的文本内容，用来演示v-sline指令的单行省略效果，当文本超出容器宽度时会自动显示省略号')

// v-length 演示数据
const basicInput = ref('')
const nativeInput = ref('')
const numberInput = ref('')
const regexInput = ref('')
const chineseInput = ref('')
const autocompleteInput = ref('')

// v-length.range 演示数据
const rangeInput1 = ref('')
const rangeInput2 = ref('')
const rangeInput3 = ref('')
const rangeInput4 = ref('')
const rangeInput5 = ref('')
const rangeInput6 = ref('')
const rangeInput7 = ref('')

// v-permission 演示数据
const btnsPermission = ref(JSON.parse(sessionStorage.getItem('btnsPermission')) || ['add_btn', 'edit_btn', 'admin-btn'])
sessionStorage.setItem('btnsPermission', JSON.stringify(btnsPermission.value))
// v-event 演示数据
const eventResult = ref('暂无点击')

// 综合演示数据
const username = ref('')
const age = ref('')
const description = ref('')
// 自动完成搜索函数
function querySearch(queryString, cb) {
  const results = queryString
    ? [
        { value: '测试用户1' },
        { value: '测试用户2' },
        { value: '管理员' },
        { value: '普通用户' },
        { value: '访客' }
      ].filter(item => item.value.includes(queryString))
    : []
  cb(results)
}

// 权限切换函数 - 修复无限递归问题
function togglePermission() {
  if (btnsPermission.value.includes('delete_btn')) {
    // 移除权限
    btnsPermission.value = btnsPermission.value.filter(item =>
      !['delete_btn', 'save_btn', 'view_btn', 'export_btn', 'import_btn'].includes(item)
    )
    eventResult.value = '权限已移除，页面将在1秒后刷新以应用更改'
  } else {
    // 添加权限
    const newPermissions = ['delete_btn', 'save_btn', 'view_btn', 'export_btn', 'import_btn']
    newPermissions.forEach(permission => {
      if (!btnsPermission.value.includes(permission)) {
        btnsPermission.value.push(permission)
      }
    })
    eventResult.value = '权限已添加，页面将在1秒后刷新以应用更改'
  }
  sessionStorage.setItem('btnsPermission', JSON.stringify(btnsPermission.value))
  // 延迟刷新页面以应用权限变更
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// 事件演示函数
function parentClick() {
  eventResult.value = '父容器被点击了 - 这不应该发生，因为使用了v-event-unuse'
}

function childClick(event) {
  event.stopPropagation()
  eventResult.value = '子容器被点击了 - v-event-use生效'
}

// 清空表单
function clearForm() {
  username.value = ''
  age.value = ''
  description.value = ''
  basicInput.value = ''
  nativeInput.value = ''
  numberInput.value = ''
  regexInput.value = ''
  chineseInput.value = ''
  autocompleteInput.value = ''
  eventResult.value = '表单已清空'
}
</script>
<style scoped>
.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.demo-section h2 {
  color: #409eff;
  margin-bottom: 20px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.demo-section h3 {
  color: #606266;
  margin: 20px 0 10px 0;
  font-size: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.input-group label {
  min-width: 150px;
  font-weight: 500;
  color: #606266;
}

.input-group span {
  color: #909399;
  font-size: 14px;
}

.native-input {
  width: 300px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.native-input:focus {
  outline: none;
  border-color: #409eff;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.event-demo-container {
  border: 2px solid #f56c6c;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  background-color: #fef0f0;
  cursor: pointer;
}

.child-container {
  border: 2px solid #67c23a;
  padding: 15px;
  margin: 10px 0;
  border-radius: 6px;
  background-color: #f0f9ff;
  cursor: pointer;
}

.comprehensive-demo {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.form-item label {
  min-width: 200px;
  font-weight: 500;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-group,
  .form-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .input-group label,
  .form-item label {
    min-width: auto;
    margin-bottom: 5px;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
