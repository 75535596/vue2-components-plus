export const departmentOptions = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '运营部', value: 'operation' },
  { label: '人力资源部', value: 'hr' },
  { label: '财务部', value: 'finance' },
]

export const statusOptions = [
  { label: '全部', value: '' },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

const nameSeed = [
  ['zhangsan', '张三'],
  ['lisi', '李四'],
  ['wangwu', '王五'],
  ['zhaoliu', '赵六'],
  ['sunqi', '孙七'],
  ['zhouba', '周八'],
  ['wujiu', '吴九'],
  ['zhengshi', '郑十'],
]

function pad(value) {
  return String(value).padStart(2, '0')
}

export const mockUsers = Array.from({ length: 20 }, function (_, index) {

  const id = index + 1
  const seed = nameSeed[index % nameSeed.length]
  const department = departmentOptions[index % departmentOptions.length]
  const month = (index % 12) + 1
  const day = (index % 28) + 1
  const gender = id % 2 === 0 ? 2 : 1
  const status = id % 5 === 0 ? 0 : 1
  return {

    id,
    username: seed[0] + id,
    realName: seed[1],
    gender,
    department: department.value,
    status,
    phone: '1380013' + pad(id) + pad((id * 3) % 100),
    email: seed[0] + id + '@example.com',
    avatar: id % 2 === 0
      ? 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
      : 'https://cube.elemecdn.com/0/88/03b0d39583f_87968.png',
    createTime: '2024-' + pad(month) + '-' + pad(day) + ' 10:00:00',
    updateTime: '2024-' + pad(month) + '-' + pad(day) + ' 18:30:00',
    month: String(month),
  }
})

export function fetchStatusOptions() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(statusOptions)
    }, 300)
  })
}

export function fetchDepartmentOptions() {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve([{ label: '全部', value: '' }].concat(departmentOptions))
    }, 300)
  })
}

export function filterUsers(users, searchParams, pagination, keyConfig) {
  const params = searchParams || {}
  const pager = pagination || {}
  const config = keyConfig || {}
  const pageNumberKey = config.pageNumberKey || 'currentPage'
  const pageSizeKey = config.pageSizeKey || 'pageSize'

  let list = (users || []).filter(function (item) {
    if (params.month && item.month !== String(params.month)) return false
    if (params.username && item.username.toLowerCase().indexOf(String(params.username).toLowerCase()) === -1) return false
    if (params.realName && item.realName.indexOf(params.realName) === -1) return false
    if (params.status !== '' && params.status !== undefined && params.status !== null && item.status !== params.status) return false
    if (params.department && item.department !== params.department) return false
    if (params.gender !== '' && params.gender !== undefined && params.gender !== null && item.gender !== params.gender) return false
    if (params.phone && item.phone.indexOf(String(params.phone)) === -1) return false
    if (params.active !== undefined && params.active !== null) {
      const active = params.active === true || params.active === 'true'
      if (active && item.status !== 1) return false
      if (!active && item.status !== 0) return false
    }
    if (params.createTime && Array.isArray(params.createTime) && params.createTime.length === 2) {
      const start = new Date(params.createTime[0]).getTime()
      const end = new Date(params.createTime[1]).getTime()
      const current = new Date(item.createTime).getTime()
      if (!Number.isNaN(start) && !Number.isNaN(end) && (current < start || current > end)) {
        return false
      }
    }
    return true
  })

  const total = list.length
  const currentPage = Number(pager[pageNumberKey] || 1)
  const pageSize = Number(pager[pageSizeKey] || 10)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize

  list = list.slice(start, end)

  return {
    list,
    total,
  }
}
