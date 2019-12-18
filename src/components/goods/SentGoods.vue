<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>货物管理</el-breadcrumb-item>
      <el-breadcrumb-item>发货单处理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getInvoiceList">
            <el-button slot="append" icon="el-icon-search" @click="getInvoiceList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="invoiceList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goodsQuantity.goods.name"></el-table-column>
        <el-table-column label="客户名称" prop="customer.name"></el-table-column>
        <el-table-column label="客户发货地址" prop="customer.address"></el-table-column>
        <el-table-column label="单价" prop="goodsQuantity.goods.price"></el-table-column>
        <el-table-column label="购买数量" prop="goodsQuantity.quantity"></el-table-column>
        <el-table-column label="当前库存量" prop="goodsQuantity.goods.nums"></el-table-column>
        <el-table-column label="库存阈值" prop="goodsQuantity.goods.minn"></el-table-column>
        <el-table-column label="发货状态" prop="issent" filter-placement="bottom-end" :filters="[{ text: '未发货', value: 0 }, { text: '发货完成', value: 1 }]" :filter-method="filterTag2">
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-tag  :type="goodstatuss[scope.row.issent]" plain disabled size="closable" hit="true">{{goodstatussstr[scope.row.issent]}}</el-tag >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="确认发货" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-check" size="mini" @click="confirmSent(scope.row)" round :disabled="scope.row.issent !=0" ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="查看物流" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-truck" size="mini"  @click="showLogistics(scope.row)" round :disabled="scope.row.issent !=1"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 物流状态显示烂 -->
    <el-dialog title="物流进度" :visible.sync="logisticsProgressstatus" width="40%">
      <el-timeline>
        <el-timeline-item v-for="(location, index) in logisticsProgresss" :key="index" :timestamp="location.timesStr" :color="(index+1) === logisticsProgresss.length? '#0bbd87':'#c1c1c1'">
          {{location.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取发货单
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      invoiceList: [],
      total: 0,
      // 0-未发货  1-发货完成
      goodstatuss: {
        '0': 'warning',
        '1': 'info'
      },
      goodstatussstr: {
        '0': '未发货',
        '1': '发货完成'
      },
      logisticsProgressstatus: false,
      logisticsProgresss: []
    }
  },
  created () {
    this.getInvoiceList()
  },
  methods: {
    filterTag2 (value, row) {
      return row.issent === value
    },
    async getInvoiceList () {
      const { data: res } = await this.$http.post('invoice/getInvoiceList', {
        query: this.queryInfo.query,
        pagenum: this.queryInfo.pagenum,
        pagesize: this.queryInfo.pagesize
      })
      if (res.code !== 200) {
        return this.$message.error('获取合同列表失败！')
      }
      this.invoiceList = res.data.invoiceList.list
      this.total = res.data.invoiceList.total
    },
    async confirmSent (row) {
      const sentGoodsResult = await this.$confirm(
        '确认货物已经发出?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (sentGoodsResult !== 'confirm') {
        return this.$message.info('取消确认！')
      }
      const { data: res } = await this.$http.post('invoice/confirmSent', row)
      if (res.code !== 200) {
        this.$message.error('确认发货失败！')
      }
      this.$message({
        type: 'success',
        message: '确认发货成功!'
      })
      this.getInvoiceList()
    },
    async showLogistics (row) {
      const { data: res } = await this.$http.post('logistics/showLogistics', this.$qs.stringify({
        id: row.id
      }))
      if (res.code !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.logisticsProgressstatus = true
      this.logisticsProgresss = res.data.logisticsList
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getInvoiceList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getInvoiceList()
    }
  }
}

</script>

<style lang="less" scoped>
</style>
