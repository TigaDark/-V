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
          <el-button icon="el-icon-search" circle @click="getgoodsticsBytime"></el-button>
        </el-col>
        <div style="margin-top: 70px;margin-left: 25px" v-for="(value, key,index) in this.goodstics" :key="index">
          <ul>
            <li>商品名称：{{ key }}  销售额： {{ value }}</li>
          </ul>
        </div>
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
      goodstics: '',
      nametics: ''
    }
  },
  created () {
    this.getgoodstics()
  },
  methods: {
    deleteItem (item, index) {
      this.orderForm.ordergoodsList.splice(index, 1)
    },
    async getgoodstics () {
      console.log(this.strtime)
      const { data: res } = await this.$http.post('contract/getgoodstics')
      if (res.code !== 200) {
        return this.$message.error('获取销售额失败！')
      }
      this.nametics = res.data.nametics
      this.goodstics = res.data.goodstics
      console.log(this.goodstics)
    },
    async getgoodsticsBytime () {
      console.log(this.strtime[0])
      const { data: res } = await this.$http.post('contract/getgoodsticsBytime', {
        starttime: this.strtime[0],
        endtime: this.strtime[1]
      })
      if (res.code !== 200) {
        return this.$message.error('获取销售额失败！')
      }
      this.nametics = res.data.nametics
      this.goodstics = res.data.goodstics
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
