<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>合同管理</el-breadcrumb-item>
      <el-breadcrumb-item>合同查看</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="15">
            <!--<el-input placeholder="请输入内容" v-model="input3" class="input-with-select">-->
              <!--<el-select v-model="select" slot="prepend" placeholder="请选择"  style="width: 80px;">-->
                <!--<el-option label="合同编号" value="1"></el-option>-->
                <!--<el-option label="销售员姓名" value="2"></el-option>-->
                <!--<el-option label="客户姓名" value="3"></el-option>-->
              <!--</el-select>-->
              <!--<el-button slot="append" icon="el-icon-search"></el-button>-->
            <!--</el-input>-->
        <el-col :span="4">
          <el-input placeholder="请输入编号或客户销售员姓名" v-model="queryInfo.query" clearable @clear="getContractList" @input="filterQueryChange2"></el-input>
        </el-col>
        <el-col :span="4">
        <el-button icon="el-icon-search" circle @click="getContractList"></el-button>
        </el-col>
        <el-col :span="4" :offset="12">
          <el-button type="primary" @click="addDialogVisible = true" round ><Icon type="md-add" />合同录入</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="contractList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="合同编号" prop="id" sortable></el-table-column>
        <el-table-column label="客户姓名" prop="customer.name"></el-table-column>
        <el-table-column label="销售人姓名" prop="user.realname"></el-table-column>
        <el-table-column label="采购清单" width="100px">
          <template slot-scope="scope">
            <div style="float: left;margin-right: 15px">
            {{scope.row.purchase.id}}
            </div>
            <el-tooltip effect="dark" content="清单详情查看" placement="top" :enterable="false">
              <el-button type="success"   icon="el-icon-zoom-in" size="mini"  circle @click="showgoodsListDialogVisible(scope.row.purchase)"></el-button>
            </el-tooltip>
        </template>
        </el-table-column>
        <el-table-column label="总金额" prop="totalmoney" sortable></el-table-column>
        <el-table-column label="是否付款" prop="purchase.ispay" filter-placement="bottom-end" :filters="[{ text: '未付款', value: 0 }, { text: '已付款', value: 1 }]" :filter-method="filterTag2">
          <template slot-scope="scope" >
            <!-- 付款显示按钮 -->
            <el-tag  :type="scope.row.purchase.ispay ? 'primary' : 'danger'" size="closable" disabled>{{scope.row.purchase.ispay ? '已付款' : '未付款'}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="合同开始时间" width="150px" sortable prop="start_timeStr">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.start_timeStr}}</span>
          </template>
        </el-table-column>
        <el-table-column label="合同结束时间" width="150px" sortable prop="end_timeStr">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ scope.row.end_timeStr}}</span>
          </template>
        </el-table-column>
        <el-table-column label="执行进度" width="100px" prop="progress" filter-placement="bottom-end" :filters="[{ text: '未执行', value: 0 }, { text: '执行中', value: 1 }, { text: '已完成', value: 2 }]" :filter-method="filterTag" >
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-tag  :type="contractprogress[scope.row.progress]" plain disabled size="closable" hit="true">{{contractprogressStr[scope.row.progress]}}</el-tag >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)" :disabled="scope.row.progress!=0"></el-button>
            <el-tooltip effect="dark" content="执行合同" placement="top" :enterable="false">
            <!-- 执行合同按钮 -->
            <el-button type="warning" icon="el-icon-check" size="mini" @click="editContractProcess(scope.row)" :disabled="scope.row.progress!=0"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="发货管理" placement="top" :enterable="false">
              <!-- 执行合同按钮 -->
              <el-button type="danger" icon="el-icon-s-goods" size="mini" @click="goodsManger(scope.row)" :disabled="scope.row.progress==2"></el-button>

            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 清单详情查看 -->
    <el-dialog title="采购清单详情" :visible.sync="goodsListDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <ul>
        <li :key="index" v-for="(goods,index) in goodsList">
          <p>{{index+1}}. 商品名字：{{goods.goods.name}}    商品单价：{{goods.goods.price}}  购买数量：{{goods.quantity}}</p>
        </li>
      </ul>
    </el-dialog>
    <!-- 合同录入 -->
    <el-dialog title="合同录入" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="110px">
        <el-form-item label="采购清单编号" prop="purchaseid">
          <el-input v-model="addForm.purchaseid" type="number" size="small"></el-input>
        </el-form-item>
        <el-form-item label="客户姓名" prop="customername" >
          <el-input v-model="addForm.customername" disabled size="small"></el-input>
        </el-form-item>
        <el-form-item label="处理的销售员" prop="username">
          <el-input v-model="addForm.username" size="small"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addContract">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改合同 -->
    <el-dialog title="修改合同" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="110px">
        <el-form-item label="采购清单编号" prop="purchaseid">
          <el-input v-model="editForm.purchaseid" type="number" size="small"></el-input>
        </el-form-item>
        <el-form-item label="客户姓名" prop="customername" >
          <el-input v-model="editForm.customername" disabled size="small"></el-input>
        </el-form-item>
        <el-form-item label="处理的销售员" prop="username">
          <el-input v-model="editForm.username" size="small"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editContractInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证采购
    var checkPruchase = async (rule, value, cb) => {
      const { data: res } = await this.$http.post('purchase/checkPurchase', this.$qs.stringify({
        purchaseid: this.addForm.purchaseid
      }))
      if (res.data.purchase === null) {
        return cb(new Error('该清单不存在！'))
      }
      this.addForm.customername = res.data.purchase.customer.name
      if (res.code === 200) {
        // 可以用的采购清单
        this.addForm2.purchaseid = this.addForm.purchaseid
        this.addForm2.customerid = res.data.purchase.customer.id
        return cb()
      }

      cb(new Error(res.msg))
    }
    // 验证是否存在销售员
    var checkUser = async (rule, value, cb) => {
      const { data: res } = await this.$http.post('user/checkUser', this.$qs.stringify({
        username: this.addForm.username
      }))
      if (res.code === 200) {
        // 可以用的销售员
        this.addForm2.userid = res.data.user.id
        return cb()
      }

      cb(new Error(res.msg))
    }
    // 验证采购
    var checkPruchase2 = async (rule, value, cb) => {
      // 如果还是原来的 就不用管
      if (this.editForm.purchaseid === this.editpurchaseid) {
        return cb()
      }
      const { data: res } = await this.$http.post('purchase/checkPurchase', this.$qs.stringify({
        purchaseid: this.editForm.purchaseid
      }))
      if (res.data.purchase === null) {
        return cb(new Error('该清单不存在！'))
      }
      this.editForm.customername = res.data.purchase.customer.name
      if (res.code === 200) {
        // 可以用的采购清单
        this.editForm2.purchaseid = this.editForm.purchaseid
        this.editForm2.customerid = res.data.purchase.customer.id
        return cb()
      }
      cb(new Error(res.msg))
    }
    // 验证是否存在销售员
    var checkUser2 = async (rule, value, cb) => {
      const { data: res } = await this.$http.post('user/checkUser', this.$qs.stringify({
        username: this.editForm.username
      }))
      if (res.code === 200) {
        // 可以用的销售员
        this.editForm2.userid = res.data.user.id
        return cb()
      }

      cb(new Error(res.msg))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      contractList: [],
      total: 0,
      // 控制 采购清单详情显示
      goodsList: [],
      goodsListDialogVisible: false,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 合同进度显示图标按钮
      contractprogress: {
        '0': 'warning',
        '1': 'primary',
        '2': 'info'
      },
      contractprogressStr: {
        '0': '未执行',
        '1': '执行中',
        '2': '已完成'
      },
      // 添加用户的表单数据 form2 用来提交id
      addForm: {
        purchaseid: '',
        username: '',
        customername: ''
      },
      addForm2: {
        purchaseid: '',
        userid: '',
        customerid: ''
      },
      // 添加表单的验证
      addFormRules: {
        purchaseid: [
          { required: true, message: '请输入采购清单id', trigger: 'blur' },
          { validator: checkPruchase, trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入销售员姓名', trigger: 'blur' },
          { validator: checkUser, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      editForm: {
        purchaseid: '',
        username: '',
        customername: ''
      },
      editForm2: {
        id: '',
        purchaseid: '',
        userid: '',
        customerid: ''
      },
      editpurchaseid: '',
      // 修改表单的验证规则对象
      editFormRules: {
        purchaseid: [
          { required: true, message: '请输入采购清单id', trigger: 'blur' },
          { validator: checkPruchase2, trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入销售员姓名', trigger: 'blur' },
          { validator: checkUser2, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getContractList()
  },
  methods: {
    // 数组过滤 即搜索
    filterQueryChange2 () {
      const query = this.queryInfo.query
      this.contractList = this.contractList.filter(item => {
        // 合同编号 客户姓名  销售员姓名  就搜索3种
        if ((item.id + '').includes(query) || item.customer.name.includes(query) || item.user.realname.includes(query)) {
          return item
        }
      })
    },
    filterTag (value, row) {
      return row.progress === value
    },
    filterTag2 (value, row) {
      return row.purchase.ispay === value
    },
    async getContractList () {
      const { data: res } = await this.$http.post('contract/getContractList', {
        query: this.queryInfo.query,
        pagenum: this.queryInfo.pagenum,
        pagesize: this.queryInfo.pagesize
      })
      if (res.code !== 200) {
        return this.$message.error('获取合同列表失败！')
      }
      this.contractList = res.data.contractList.list
      this.total = res.data.contractList.total
    },
    // 监听 pagesize
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getContractList()
    },
    // 监听页码值
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getContractList()
    },
    // 用户确认执行合同
    async editContractProcess (row) {
      if (row.purchase.ispay === 0) {
        this.$confirm('该采购清单用户未付款，不能执行', '提示', {
          confirmButtonText: '确定'
        })
        return
      }
      // 询问用户是否确认执行
      const contractResult = await this.$confirm(
        '执行合同后将不能修改合同, 是否执行?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (contractResult !== 'confirm') {
        return this.$message.info('已取消执行合同')
      }
      // 提交修改合同进度 的请求 this.contractList.progress = 1
      const { data: res } = await this.$http.post('contract/editContractProcess', row)
      if (res.code !== 200) {
        this.$message.error('执行合同失败！')
      }
      this.getContractList()
      this.$message({
        type: 'success',
        message: '执行合同成功'
      })
    },
    // 展示采购清单详情
    async showgoodsListDialogVisible (purchase) {
      this.goodsList = purchase.goodsQuantityList
      this.goodsListDialogVisible = true
    },
    // 点击发货管理跳转界面
    goodsManger (row) {
      if (row.progress === 0) {
        this.$confirm('该合同未执行，不能发货，请先执行合同', '提示', {
          confirmButtonText: '确定'
        })
      } else if (row.progress === 3) {
        this.$confirm('该合同已执行完毕，请处理其他合同', '提示', {
          confirmButtonText: '确定'
        })
      } else if (row.purchase.ispay === 0) {
        this.$confirm('该采购清单用户未支付，不能发货', '提示', {
          confirmButtonText: '确定'
        })
      } else if (row.progress === 1) {
        this.$router.push({ path: '/goodsmanger', query: { purchaseid: row.purchase.id } })
      }
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，录入合同
    addContract () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('contract/addContract', this.addForm2)

        if (res.code !== 200) {
          this.$message.error('录入失败！')
        }

        this.$message.success('合同录入成功！')
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getContractList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (row) {
      this.editForm.customername = row.customer.name
      this.editForm.purchaseid = row.purchase.id
      this.editForm.username = row.user.realname
      this.editForm2.id = row.id
      this.editForm2.customerid = row.customer.id
      this.editForm2.purchaseid = row.purchase.id
      this.editForm2.userid = row.user.id
      this.editpurchaseid = this.editForm2.purchaseid
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改合同提交
    editContractInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.post('contract/editContract', this.editForm2)

        if (res.code !== 200) {
          return this.$message.error('更新合同信息失败！')
        }

        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getContractList()
        // 提示修改成功
        this.$message.success('更新合同信息成功！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-select .el-input {
    width: 130px;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>
