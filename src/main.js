import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import Qs from 'qs'

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$qs = Qs
axios.defaults.baseURL = 'http://localhost:9090/'
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
