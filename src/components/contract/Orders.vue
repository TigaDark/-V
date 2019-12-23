<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>合同清单管理</el-breadcrumb-item>
      <el-breadcrumb-item>合同清单订购清单管理</el-breadcrumb-item>
      <el-breadcrumb-item>发货管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="15">
            <!--<el-input placeholder="请输入内容" v-model="input3" class="input-with-select">-->
              <!--<el-select v-model="select" slot="prepend" placeholder="请选择"  style="width: 80px;">-->
                <!--<el-option label="合同清单编号" value="1"></el-option>-->
                <!--<el-option label="销售员姓名" value="2"></el-option>-->
                <!--<el-option label="客户姓名" value="3"></el-option>-->
              <!--</el-select>-->
              <!--<el-button slot="append" icon="el-icon-search"></el-button>-->
            <!--</el-input>-->
        <el-col :span="4">
          <el-input placeholder="请输入编号或客户销售员姓名" v-model="queryInfo.query" clearable @clear="getordersList" @input="filterQueryChange2"></el-input>
        </el-col>
        <el-col :span="4">
        <el-button icon="el-icon-search" circle @click="getordersList"></el-button>
        </el-col>
        <el-col :span="4" :offset="12">
          <el-button type="primary" @click="addDialogVisible = true" round ><Icon type="md-add" />合同清单录入</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="合同清单编号" prop="strid" sortable></el-table-column>
        <el-table-column label="所属合同编号" prop="contract.strid"></el-table-column>
        <el-table-column label="客户姓名" prop="contract.customer.name"></el-table-column>
        <el-table-column label="销售人姓名" prop="contract.user.realname"></el-table-column>

        <el-table-column label="执行进度" width="100px" prop="progress" filter-placement="bottom-end" :filters="[{ text: '进行中', value: 0 }, { text: '已完成', value: 1 }]" :filter-method="filterTag" >
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-tag  :type="ordersprogress[scope.row.progress]" plain disabled size="closable" hit="true">{{ordersprogressStr[scope.row.progress]}}</el-tag >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="发货管理" placement="top" :enterable="false">
              <!-- 执行合同清单按钮 -->
              <el-button type="danger" icon="el-icon-s-goods" size="mini" @click="goodsManger(scope.row)" :disabled="scope.row.progress==1"></el-button>
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
      <!--<ul>-->
        <!--<li :key="index" v-for="(goods,index) in goodsList">-->
          <!--<p>{{index+1}}. 商品名字：{{goods.goods.name}}    商品单价：{{goods.goods.price}} 合同清单购买数量：{{goods.quantity}}</p>-->
        <!--</li>-->
      <!--</ul>-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名字" prop="goods.name"></el-table-column>
        <el-table-column label="商品价格" prop="goods.price"></el-table-column>
        <el-table-column label="合同清单购买数量" prop="quantity"></el-table-column>
        <el-table-column label="合同清单未执行数量" prop="surplus"></el-table-column>
        <el-table-column label="状态" prop="goodstatus" filter-placement="bottom-end" :filters="[{ text: '未发货', value: 0 }, { text: '发货中', value: 1 }, { text: '发货完成', value: 2 }]" :filter-method="filterTag3">
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-tag :type="goodstatuss[scope.row.goodstatus]" plain disabled size="closable" hit="true">{{goodstatussstr[scope.row.goodstatus]}}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      ordersList: [],
      total: 0,
      // 控制 采购清单详情显示
      goodsList: [],
      goodsListDialogVisible: false,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 合同清单进度显示图标按钮
      ordersprogress: {
        '0': 'warning',
        '1': 'info'
      },
      ordersprogressStr: {
        '0': '进行中',
        '1': '已完成'
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
      ordersDialogVisible: false,
      orderForm: {
        ordersid: '',
        ordergoodsList: [{
          name: '',
          nums: ''
        }]
      }
    }
  },
  created () {
    this.getordersList()
  },
  methods: {
    filterTag3 (value, row) {
      return row.goodstatus === value
    },
    // 数组过滤 即搜索
    filterQueryChange2 () {
      const query = this.queryInfo.query
      this.ordersList = this.ordersList.filter(item => {
        // 合同清单编号 客户姓名  销售员姓名  就搜索3种
        if ((item.id + '').includes(query) || item.customer.name.includes(query) || item.user.realname.includes(query)) {
          return item
        }
      })
    },
    async getordersList () {
      const { data: res } = await this.$http.post('orders/getordersList', {
        query: this.queryInfo.query,
        pagenum: this.queryInfo.pagenum,
        pagesize: this.queryInfo.pagesize
      })
      if (res.code !== 200) {
        return this.$message.error('获取合同清单列表失败！')
      }
      this.ordersList = res.data.ordersList.list
      this.total = res.data.ordersList.total
    },
    // 监听 pagesize
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getordersList()
    },
    // 监听页码值
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getordersList()
    },
    // 用户确认执行合同清单
    async editordersProcess (row) {
      // 询问用户是否确认执行
      const ordersResult = await this.$confirm(
        '执行合同清单后将不能修改合同清单, 是否执行?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (ordersResult !== 'confirm') {
        return this.$message.info('已取消执行合同清单')
      }
      // 提交修改合同清单进度 的请求 this.ordersList.progress = 1
      const { data: res } = await this.$http.post('orders/editordersProcess', row)
      if (res.code !== 200) {
        this.$message.error('执行合同清单失败！')
      }
      this.getordersList()
      this.$message({
        type: 'success',
        message: '执行合同清单成功'
      })
    },
    // 展示采购清单详情
    async showgoodsListDialogVisible (purchase) {
      this.goodsList = purchase.goodsQuantityList
      this.goodsListDialogVisible = true
    },
    // 点击发货管理跳转界面
    goodsManger (row) {
      if (row.progress === 1) {
        this.$confirm('该合同清单已执行完毕，请处理其他合同清单', '提示', {
          confirmButtonText: '确定'
        })
      }
      this.$router.push({ path: '/goodsmanger', query: { ordersid: row.id } })
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，录入合同清单
    addorders () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('orders/addorders', this.addForm2)

        if (res.code !== 200) {
          this.$message.error('录入失败！')
        }

        this.$message.success('合同清单录入成功！')
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getordersList()
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
    // 修改合同清单提交
    editordersInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.post('orders/editorders', this.editForm2)

        if (res.code !== 200) {
          return this.$message.error('更新合同清单信息失败！')
        }

        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getordersList()
        // 提示修改成功
        this.$message.success('更新合同清单信息成功！')
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
