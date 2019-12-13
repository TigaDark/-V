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
        <el-table-column label="发货状态" prop="goodstatus"></el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
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
      purchase: ''
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
    }
  }
}
</script>

<style lang="less" scoped>
</style>
