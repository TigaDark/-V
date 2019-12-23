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
        <el-table-column label="商品名称" prop="ordersGood.goods.name"></el-table-column>
        <el-table-column label="客户名称" prop="customer.name"></el-table-column>
        <el-table-column label="客户发货地址" prop="customer.address"></el-table-column>
        <el-table-column label="单价" prop="ordersGood.goods.price"></el-table-column>
        <el-table-column label="发货数量" prop="ordersGood.quantity"></el-table-column>
        <el-table-column label="当前库存量" prop="ordersGood.goods.nums"></el-table-column>
        <el-table-column label="库存阈值" prop="ordersGood.goods.minn"></el-table-column>
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
    <el-dialog :title="'物流单号: '+logisticsid" :visible.sync="logisticsProgressstatus" width="40%">
      <el-timeline>
        <el-timeline-item v-for="(location, index) in logisticsProgresss" :key="index" :timestamp="location.timesStr" :color="(index+1) === logisticsProgresss.length? '#0bbd87':'#c1c1c1'">
          {{location.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
    <el-dialog title="确认发货信息" :visible.sync="confirmSentStatus" width="40%" @close="buyGoodsClosed">
      <el-form :model="logistics" :rules="logisticsFormRules" ref="logisticsFormRef" size="small" label-width="120px">
        <el-form-item label="客户姓名" prop="customer.name">
          <el-input v-model="logistics.name" disabled ></el-input>
        </el-form-item>
        <el-form-item label="客户地址" prop="customer.address">
          <el-input  v-model="logistics.address" disabled ></el-input>
        </el-form-item>
        <el-form-item label="发货仓库地址" prop="customer.address">
        <el-select v-model="addLogistics.start_place" clearable placeholder="请选择">
          <el-option
            v-for="item in start_place"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="发货快递" prop="customer.address">
        <el-select v-model="addLogistics.company" clearable placeholder="请选择">
          <el-option
            v-for="item in company"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        </el-form-item>
        </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="buyGoodsClosed2">取 消</el-button>
        <el-button type="primary" @click="addsentGoods">确 定</el-button>
      </span>
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
      logisticsProgresss: [],
      confirmSentStatus: false,
      logistics: {},
      addLogistics: {
        start_place: '',
        company: ''
      },
      invoiceid: '',
      company: [{
        value: '顺丰快递',
        label: '顺丰快递'
      }, {
        value: '圆通快递',
        label: '圆通快递'
      }, {
        value: '韵达快递',
        label: '韵达快递'
      }, {
        value: '中通快递',
        label: '中通快递'
      }, {
        value: '申通快递',
        label: '申通快递'
      }],
      start_place: [{
        value: '广东东莞松山湖仓库',
        label: '广东东莞松山湖仓库'
      }, {
        value: '广东深圳龙华仓库',
        label: '广东深圳龙华仓库'
      }, {
        value: '广东广州越秀仓库',
        label: '广东广州越秀仓库'
      }],
      logisticsid: ''
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
    async addsentGoods () {
      // 不能直接确认
      const { data: res } = await this.$http.post('invoice/confirmSent/' + this.invoiceid, this.addLogistics)
      if (res.code !== 200) {
        this.$message.error('确认发货失败！')
      }
      this.$message({
        type: 'success',
        message: '确认发货成功!'
      })
      this.confirmSentStatus = false
      this.getInvoiceList()
    },
    async confirmSent (row) {
      this.invoiceid = row.id
      this.logistics = row.customer
      this.confirmSentStatus = true
    },
    async showLogistics (row) {
      const { data: res } = await this.$http.post('logistics/showLogistics', this.$qs.stringify({
        id: row.id
      }))
      if (res.code !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.logisticsProgressstatus = true
      this.logisticsid = row.logisticsid
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
    },
    // 监听对话框的关闭事件
    buyGoodsClosed () {
      this.addLogistics.company = ''
      this.addLogistics.start_place = ''
    },
    buyGoodsClosed2 () {
      this.addLogistics.company = ''
      this.addLogistics.start_place = ''
      this.confirmSentStatus = false
    }
  }
}

</script>

<style lang="less" scoped>
</style>
