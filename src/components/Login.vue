<template>
    <div class="login_container">
      <div class="login_box">
        <!-- 头像区域 -->
        <div class="images">
          <img src="../assets/images/1.jpg" alt="">
          <p style="font-size: 16px;font-weight: 700;text-align: center">销售管理系统</p>
        </div>
        <!-- 登录表单区域 -->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
          </el-form-item>
          <!-- 按钮区域 -->
          <el-form-item class="btns">
            <el-button type="primary" @click="login" class="button_color">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 5, message: '长度至少为5位', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置登录表单
    resetLoginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(this.loginForm)
        if (!valid) return
        const { data: res } = await this.$http.post('user/login', this.loginForm)
        if (res.code !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功')
        // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
        //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token ,rid(以便查询菜单权限) 保存在 sessionStorage 中
        window.sessionStorage.setItem('token', res.data.token)
        window.sessionStorage.setItem('rid', res.data.user.role.id)
        window.sessionStorage.setItem('rolename', res.data.user.role.roelname)
        window.sessionStorage.setItem('username', res.data.user.realname)
        // 2. 通过编程式导航跳转到后台主页，路由地址是 /main
        this.$router.push('/main')
      })
    }
  }
}

</script>

<style lang="less" scoped>
  .button_color{
    background-color: #3c8dbc;
  }
  .el-form-item{
    width: 280px;
    margin-left: 35px;

  }
  .login_container {
    background-color: #4498c4;
    height: 100%;
  }

  .login_box {
    width: 400px;
    height: 400px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .images {
      margin-top:90px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
    }

    .btns {
      margin-left: 95px;
    }
  }
</style>
