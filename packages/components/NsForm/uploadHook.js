import { getCurrentInstance, nextTick } from 'vue'
import { getAllFormNodeByKey } from './index'

function getImageBaseUrl(instance) {
  return instance?.proxy?.$ImageBaseUrl || ''
}

function getFieldPathByKey(rows, key, formPropKey = 'rows') {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      const item = row[colIndex]
      if (item.key === key) {
        return `${formPropKey}.${rowIndex}.${colIndex}.value`
      }
      if (Array.isArray(item.children)) {
        for (let childIndex = 0; childIndex < item.children.length; childIndex += 1) {
          const child = item.children[childIndex]
          if (child.key === key) {
            return `${formPropKey}.${rowIndex}.${colIndex}.children.${childIndex}.value`
          }
        }
      }
    }
  }
  return null
}

export function useFileUpload(state) {
  const instance = getCurrentInstance()

  function handleFormatFileList(field, fileList) {
    const baseUrl = getImageBaseUrl(instance)
    const nextList = Array.isArray(fileList) ? fileList : []
    nextList.forEach((item) => {
      if (item.filePath && !item.url) {
        item.url = `${baseUrl}${item.filePath}`
      }
      if (!item.name) {
        item.name = item.fileName || item.name || item.filePath || '未命名文件'
      }
    })
    if (field && field.params) {
      field.params.fileList = nextList
    }
    if (field) {
      field.value = nextList.slice()
    }
    return nextList
  }

  function handleRemoveFile(file, fileList, fieldKey, rows = state.rows) {
    const field = getAllFormNodeByKey(rows, fieldKey)
    if (!field) {
      return fileList
    }
    const nextValue = (fileList || []).map((item) => ({
      ...item,
      fileName: item.response ? item.response.data.fileName : item.fileName,
      filePath: item.response ? item.response.data.filePath : item.filePath,
      fileSize: item.response ? item.response.data.fileSize : item.fileSize,
    }))
    if (!Array.isArray(field.delValue)) {
      field.delValue = []
    }
    if (!file.response && file.status === 'success') {
      field.delValue.push({ ...file, isDelete: 1 })
    }
    field.value = nextValue
    if (field.params) {
      field.params.fileList = fileList || []
    }
    return fileList
  }

  function handleFileSuccessFile(response, file, fileList, fieldKey, rows = state.rows) {
    const field = getAllFormNodeByKey(rows, fieldKey)
    if (!field) {
      return fileList
    }
    if (!Array.isArray(field.value)) {
      field.value = []
    }
    if (file && file.status === 'success' && response && response.data) {
      field.value.push({ ...response.data })
    }
    if (field.params) {
      field.params.fileList = fileList || []
    }
    return fileList
  }

  function handleCheckFileRequire(rows, key, formRef, formPropKey = 'rows') {
    const field = getAllFormNodeByKey(rows, key)
    if (field && !Array.isArray(field.value)) {
      field.value = []
    }
    const fieldPath = getFieldPathByKey(rows, key, formPropKey)
    nextTick(() => {
      const formInstance = formRef && (formRef.value || formRef)
      if (fieldPath && formInstance && typeof formInstance.validateField === 'function') {
        formInstance.validateField(fieldPath)
      }
    })
  }

  return {
    handleFormatFileList,
    handleRemoveFile,
    handleFileSuccessFile,
    handleCheckFileRequire,
  }
}
