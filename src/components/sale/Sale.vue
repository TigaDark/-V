<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>销售人员信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>销售人员信息查看</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="15">
        <!--</el-input>-->
        <el-col :span="4">
          <el-input placeholder="请输入编号或销售员姓名" v-model="queryInfo.query" clearable @clear="getSalerList" @input="filterQueryChange2"></el-input>
        </el-col>
        <el-col :span="4">
          <el-button icon="el-icon-search" circle @click="getSalerList"></el-button>
        </el-col>
        <el-col :span="4" :offset="12">
          <el-button type="primary" @click="addDialogVisible = true" round ><Icon type="md-add" />添加</el-button>
        </el-col>
      </el-row>

      <!-- 销售员列表区域 -->
      <el-table :data="salerList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="账户" prop="username"></el-table-column>
        <el-table-column label="姓名" prop="realname"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="phone"></el-table-column>
        <el-table-column label="地址" prop="address"></el-table-column>
        <el-table-column label="入职时间" prop="entrytimeStr"></el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加销售员的对话框 -->
    <el-dialog title="添加销售员" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="账户" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realname">
          <el-input v-model="addForm.realname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="addForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="addForm.address"></el-input>
        </el-form-item>
        <el-form-item label="入职时间" prop="entrytime">
          <el-date-picker
            v-model="addForm.entrytime"
            align="right"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改销售员的对话框 -->
    <el-dialog title="修改销售员" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
        <el-form-item label="账户" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="realname">
          <el-input v-model="editForm.realname" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="editForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address"></el-input>
        </el-form-item>
        <el-form-item label="入职时间" prop="entrytime">
          <el-date-picker
            v-model="editForm.entrytime"
            align="right"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            value-format="timestamp"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkPhone = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    var checkUsername = async (rule, value, cb) => {
      // 看看 账户是否存在
      const { data: res } = await this.$http.post('user/checkUsername', this.$qs.stringify({
        username: this.addForm.username
      }))
      if (res.code === 200) {
        // 可以用的销售员
        return cb()
      }

      cb(new Error(res.msg))
    }
    var checkRealname = async (rule, value, cb) => {
      // 看看 账户是否存在
      const { data: res } = await this.$http.post('user/checkUser', this.$qs.stringify({
        username: this.addForm.realname
      }))
      if (res.code !== 200) {
        // 可以用的销售员
        return cb()
      }

      cb(new Error('该销售员已存在'))
    }

    return {
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '今天',
          onClick (picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick (picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
      // 获取销售员列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      salerList: [],
      total: 0,
      // 控制添加销售员对话框的显示与隐藏
      addDialogVisible: false,
      // 添加销售员的表单数据
      addForm: {
        username: '',
        realname: '',
        email: '',
        phone: '',
        entrytime: '',
        address: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        entrytimeStr: [
          { required: true, message: '请选择入职时间', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入销售员账户', trigger: 'blur' },
          { validator: checkUsername, trigger: 'blur' }
        ],
        realname: [
          { required: true, message: '请输入销售员名', trigger: 'blur' },
          { min: 2, message: '销售员名的长度至少为2', trigger: 'blur' },
          { validator: checkRealname, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 控制修改销售员对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的销售员信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        address: [
          { required: true, message: '请输入地址', trigger: 'blur' }
        ],
        entrytimeStr: [
          { required: true, message: '请选择入职时间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的销售员信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getSalerList()
  },
  methods: {
    filterQueryChange2 () {
      const query = this.queryInfo.query
      this.salerList = this.salerList.filter(item => {
        // 合同编号 客户姓名  销售员姓名  就搜索3种
        if (item.username.includes(query) || item.realname.includes(query) || item.phone.includes(query) || item.address.includes(query) || item.email.includes(query)) {
          return item
        }
      })
    },
    async getSalerList () {
      const { data: res } = await this.$http.post('user/getSaleList', {
        query: this.queryInfo.query,
        pagenum: this.queryInfo.pagenum,
        pagesize: this.queryInfo.pagesize
      })
      if (res.code !== 200) {
        return this.$message.error('获取销售员列表失败！')
      }
      this.salerList = res.data.saleList.list
      this.total = res.data.saleList.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getSalerList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getSalerList()
    },
    // 监听添加销售员对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新销售员
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加销售员的网络请求
        const { data: res } = await this.$http.post('user/addsalers', this.addForm)

        if (res.code !== 200) {
          this.$message.error('添加销售员失败！')
        }

        this.$message.success('添加销售员成功！')
        // 隐藏添加销售员的对话框
        this.addDialogVisible = false
        // 重新获取销售员列表数据
        this.getSalerList()
      })
    },
    // 展示编辑销售员的对话框
    async showEditDialog (row) {
      this.editForm = row
      this.editDialogVisible = true
    },
    // 监听修改销售员对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改销售员信息并提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改销售员信息的数据请求
        const { data: res } = await this.$http.post('user/editsaler', this.editForm)

        if (res.code !== 200) {
          return this.$message.error('更新销售员信息失败！')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getSalerList()
        // 提示修改成功
        this.$message.success('更新销售员信息成功！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
