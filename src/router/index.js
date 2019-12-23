import Vue from 'vue'
import VueRouter from 'vue-router'
import login from '../components/Login'
import main from '../components/Main'
import firts from '../components/first'
import contract from '../components/contract/Contract'
import goodsmanger from '../components/contract/GoodsManger'
import buygoods from '../components/goods/BuyGoods'
import sentgoods from '../components/goods/SentGoods'
import customer from '../components/Customer/Customer'
import order from '../components/contract/Orders'
import sale from '../components/sale/SaleContract'
import sales from '../components/sale/Sale'
import totaltics from '../components/Statistics/Totaltics'
import goodstics from '../components/Statistics/Goodstics'
import customertics from '../components/Statistics/Customertics'
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
      { path: '/sale', component: sale },
      { path: '/sales', component: sales },
      { path: '/goodsmanger', component: goodsmanger },
      { path: '/buygoods', component: buygoods },
      { path: '/sentgoods', component: sentgoods },
      { path: '/customer', component: customer },
      { path: '/totaltics', component: totaltics },
      { path: '/goodstics', component: goodstics },
      { path: '/customertics', component: customertics },
      { path: '/order', component: order }]
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
