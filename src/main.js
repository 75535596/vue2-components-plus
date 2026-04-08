import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'

// 本地模式
// import NsComponents from 'packages/index'
// import 'packages/assets/main.css'

// npm包模式
import NsComponents from 'vue2-components-plus'
import 'vue2-components-plus/dist/vue2-components-plus.css'

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(NsComponents)

new Vue({
  render: (h) => h(App),
}).$mount('#app')
