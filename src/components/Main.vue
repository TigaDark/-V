<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/images/1.jpg" alt="" style="width: 60px;display:block;border-radius: 50%;">
        <span>销售管理后台系统</span>
      </div>
      <div>
        <div style="color: #f5f7fa;font-size: 15px">
          {{rolename}}
        </div>
        <div style="margin-left: 10px">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"></el-avatar>
        </div>
        <el-dropdown size="small" @command="handleCommand">
          <span class="el-dropdown-link">{{username}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a"><i class="el-icon-switch-button"></i>退出系统</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '65px' : '210px'">
        <div class="toggle-button" @click="toggleCollapse"><i class="el-icon-menu"></i></div>
        <!-- 侧边栏菜单区域width: 66px; -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.menuname}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState(subItem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-document"></i>
                <!-- 文本 -->
                <span>{{subItem.menuname}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        '1': 'iconfont icon-danju',
        '2': 'iconfont icon-users',
        '3': 'iconfont icon-user',
        '7': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: '',
      username: '',
      rolename: ''
    }
  },
  created () {
    this.getMenuList()
    // 查询用户信息显示 同时查询保存正在访问的地址以高亮
    this.rolename = window.sessionStorage.getItem('rolename')
    this.username = window.sessionStorage.getItem('username')
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    handleCommand (command) {
      if (command === 'a') {
        window.sessionStorage.clear()
        this.$router.push('/login')
        this.$message.success('退出成功')
      }
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.post('user/usermenus', this.$qs.stringify({
        rid: window.sessionStorage.getItem('rid')
      }))
      if (res.code !== 200) return this.$message.error(res.msg)
      this.menulist = res.data.menu
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>

  .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
