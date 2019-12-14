<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>合同管理</el-breadcrumb-item>
      <el-breadcrumb-item>合同查看</el-breadcrumb-item>
      <el-breadcrumb-item>发货管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 用户列表区域 -->
      <p>采购清单顾客： {{purchase.customer.name}}</p>
      <el-table :data="purchase.goodsQuantityList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods.name"></el-table-column>
        <el-table-column label="单价" prop="goods.price"></el-table-column>
        <el-table-column label="购买数量" prop="quantity"></el-table-column>
        <el-table-column label="库存量" prop="goods.nums"></el-table-column>
        <el-table-column label="库存阈值" prop="goods.minn"></el-table-column>
        <el-table-column label="发货状态">
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-button :type="goodstatuss[scope.row.goodstatus]" plain disabled size="small">{{goodstatussstr[scope.row.goodstatus]}}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="生成发货单" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-tickets" size="mini" :disabled="scope.row.goodstatus !=0" @click="createSentGoodsOreder(scope.row)" round ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="生成订货单" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-tickets" size="mini" :disabled="scope.row.goodstatus !=0" @click="createBuyGoodsOreder(scope.row)" round></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      purchase: '',
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
      }
    }
  },
  created () {
    this.getGoodsList(this.$route.query.purchaseid)
  },
  methods: {
    async getGoodsList (id) {
      const { data: res } = await this.$http.post('purchase/getGoodsListByPurchaseId', this.$qs.stringify({
        id: id
      }))
      if (res.code !== 200) {
        return this.$message.error('获取货物列表失败！')
      }
      this.purchase = res.data.purchases
    },
    async createSentGoodsOreder (row) {
      // 购买数量大于库存量 不能发货 要先生成订货单
      if (row.quantity > row.goods.nums) {
        this.$confirm('抱歉，库存不足不能发货，请先生成订货单订货', '提示', {
          confirmButtonText: '确定'
        })
        return
      }
      const goodsResult = await this.$confirm(
        '执行合同后将不能修改合同, 是否执行?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (goodsResult !== 'confirm') {
        return this.$message.info('已取消生成发货单！')
      }
      const { data: res } = await this.$http.post('purchase/createSentGoodsOreder', row)
      if (res.code !== 200) {
        this.$message.error('生成发货单失败！')
      }
      this.$message({
        type: 'success',
        message: '发货单已生成!'
      })
      this.getGoodsList(this.$route.query.purchaseid)
    }
  }
}

</script>

<style lang="less" scoped>
</style>
