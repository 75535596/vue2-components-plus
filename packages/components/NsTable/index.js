import NsTableContainer from './PageContainer.vue'
import NsSearch from './PageSearch.vue'
import NsTable from './PageTable.vue'

export * from './Pagination'

;[NsTableContainer, NsSearch, NsTable].forEach((component) => {
  component.install = function install(Vue) {
    Vue.component(component.name, component)
  }
})

export { NsTableContainer, NsSearch, NsTable }
export default NsTableContainer
