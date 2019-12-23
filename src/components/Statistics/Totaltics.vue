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
        <el-col :span="8">
          <div class="block">
            <el-date-picker
              v-model="strtime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button icon="el-icon-search" circle @click="getTotalticsBytime"></el-button>
        </el-col>

        <el-col :span="4">
          总销售额：<el-input v-model="totaltics" disabled style="width: 120px"></el-input>
        </el-col>
      </el-row>
    </el-card>

  </div>
</template>

<script>
export default {
  data () {
    return {
      strtime: '',
      // 0-未发货 1-发货中 2-发货完成
      goodstatuss: {
        '0': 'warning',
        '1': 'primary',
        '2': 'info'
      },
      goodstatussstr: {
        '0': '未发货',
        '1': '发货中',
        '2': '发货完成'
      },
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
      totaltics: ''
    }
  },
  created () {
    this.getTotaltics()
  },
  methods: {
    deleteItem (item, index) {
      this.orderForm.ordergoodsList.splice(index, 1)
    },
    filterTag3 (value, row) {
      return row.goodstatus === value
    },
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
    async getTotaltics () {
      console.log(this.strtime)
      const { data: res } = await this.$http.post('contract/getTotaltics')
      if (res.code !== 200) {
        return this.$message.error('获取销售额失败！')
      }
      this.totaltics = res.data.total
    },
    async getTotalticsBytime () {
      console.log(this.strtime[0])
      const { data: res } = await this.$http.post('contract/getTotalticsBytime', {
        starttime: this.strtime[0],
        endtime: this.strtime[1]
      })
      if (res.code !== 200) {
        return this.$message.error('获取销售额失败！')
      }
      this.totaltics = res.data.total
    },
    // 监听 pagesize
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getTotaltics()
    },
    // 监听页码值
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getTotaltics()
    },
    // 用户确认执行合同
    async editContractProcess (row) {
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
      this.getTotaltics()
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
        this.$confirm('该合同未执行，不能生成合同清单，请先执行合同', '提示', {
          confirmButtonText: '确定'
        })
      } else if (row.progress === 3) {
        this.$confirm('该合同已执行完毕，请处理其他合同', '提示', {
          confirmButtonText: '确定'
        })
      } else if (row.progress === 1) {
        this.ordersDialogVisible = true
      }
      this.goodsList = row.purchase.goodsQuantityList
      this.orderForm.contractid = row.id
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
        this.getTotaltics()
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
    closeOrdersDialog () {
      this.$refs.orderFormRef.resetFields()
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
        this.getTotaltics()
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
