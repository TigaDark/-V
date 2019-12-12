import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/Login'
import main from '../components/Main'
import firts from '../components/first'
import contract from '../components/contract/Contract'
import customer from '../components/customer/Customer'
import sale from '../components/sale/Sale'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login },
  { path: '/main',
    component: main,
    redirect: '/first',
    children: [
      { path: '/first', component: firts },
      { path: '/contract', component: contract },
      { path: '/customer', component: customer },
      { path: '/sale', component: sale }]
  }

]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
