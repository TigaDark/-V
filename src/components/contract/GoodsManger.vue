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
        <el-table-column label="发货状态" prop="goodstatus" filter-placement="bottom-end" :filters="[{ text: '未发货', value: 0 }, { text: '发货中', value: 1 }, { text: '发货完成', value: 2 }, { text: '进货中',value: 3 }]" :filter-method="filterTag2">
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-tag :type="goodstatuss[scope.row.goodstatus]" plain disabled size="closable" hit="true">{{goodstatussstr[scope.row.goodstatus]}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="生成发货单" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-s-claim" size="mini" :disabled="scope.row.goodstatus !=0" @click="createSentGoodsOreder(scope.row)" round ></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="生成订货单" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-tickets" size="mini" :disabled="scope.row.goodstatus !=0" @click="createBuyGoodsOreder(scope.row)" round></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 发货单 -->
    <el-dialog title="发货单" :visible.sync="buyGoods" width="50%" @close="buyGoodsClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addbuygoodsForm" :rules="addbuygoodsFormRules" ref="addbuygoodsFormRef" size="small" label-width="120px">
        <el-form-item label="商品名称" prop="goodsname">
          <el-input v-model="addbuygoodsForm.goodsname" disabled ></el-input>
        </el-form-item>
        <el-form-item label="当前库存量" prop="goodsnums">
          <el-input v-model="addbuygoodsForm.goodsnums" disabled></el-input>
        </el-form-item>
        <el-form-item label="阈值" prop="goodsmin">
          <el-input v-model="addbuygoodsForm.goodsmin" disabled></el-input>
        </el-form-item>
        <el-form-item label="最少进货数量" prop="minbuygoods" required>
          <el-input v-model="addbuygoodsForm.minbuygoods" type="number"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="buyGoods = false">取 消</el-button>
        <el-button type="primary" @click="addbuyGoods">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    // 进货单的输入最小值
    var Checkminbuygoods = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regMin = this.minbuygoods
      if (regMin + '' < value) {
        return cb()
      }

      cb(new Error('数量不能少于默认最小值: ' + this.minbuygoods))
    }

    return {
      purchase: '',
      // 0-未发货 1-发货中 2-发货完成
      goodstatuss: {
        '0': 'warning',
        '1': 'primary',
        '2': 'info',
        '3': 'warning'
      },
      goodstatussstr: {
        '0': '未发货',
        '1': '发货中',
        '2': '发货完成',
        '3': '进货中'
      },
      buyGoods: false,
      addbuygoodsForm: {
        goodsquantityid: '',
        goodsname: '',
        goodsnums: '',
        goodsmin: '',
        minbuygoods: ''
      },
      addbuygoodsFormRules: {
        minbuygoods: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          { validator: Checkminbuygoods, trigger: 'blur' }
        ]
      },
      minbuygoods: ''
    }
  },
  created () {
    this.getGoodsList(this.$route.query.purchaseid)
  },
  methods: {
    filterTag2 (value, row) {
      return row.goodstatus === value
    },
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
        '是否需要生成发货单?',
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
    },
    // 点击确认，生成订货单
    addbuyGoods () {
      this.$refs.addbuygoodsFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起请求
        // console.log(this.addbuygoodsForm)
        const { data: res } = await this.$http.post('buyorder/addBuyOrder', this.addbuygoodsForm)

        if (res.code !== 200) {
          this.$message.error('生成订货单失败！')
        }
        this.buyGoods = false
        this.$message.success('生成进货单成功！')
        // 隐藏
        // 重新获表数据
        this.getGoodsList(this.$route.query.purchaseid)
      })
    },
    // 显示订货单
    async createBuyGoodsOreder (row) {
      this.addbuygoodsForm.goodsquantityid = row.id
      this.addbuygoodsForm.goodsname = row.goods.name
      this.addbuygoodsForm.goodsnums = row.goods.nums
      this.addbuygoodsForm.goodsmin = row.goods.minn
      this.addbuygoodsForm.minbuygoods = (row.goods.minn + row.quantity - row.goods.nums + 1) > 0 ? (row.goods.minn + row.quantity - row.goods.nums + 1) : 1
      this.minbuygoods = (row.goods.minn + row.quantity - row.goods.nums + 1) > 0 ? (row.goods.minn + row.quantity - row.goods.nums + 1) : 0
      this.buyGoods = true
    },
    // 监听对话框的关闭事件
    buyGoodsClosed () {
      this.$refs.addbuygoodsFormRef.resetFields()
      this.minbuygoods = ''
    }
  }
}

</script>

<style lang="less" scoped>
</style>
