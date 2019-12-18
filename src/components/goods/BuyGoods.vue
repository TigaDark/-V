<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>货物管理</el-breadcrumb-item>
      <el-breadcrumb-item>进货单处理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getBuyOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getBuyOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="buyorderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="清单id" prop="goodsquantityid"></el-table-column>
        <el-table-column label="商品名称" prop="goodsname"></el-table-column>
        <el-table-column label="最小进货数量" prop="minquantity"></el-table-column>
        <el-table-column label="实际进货量" prop="realquantity"></el-table-column>
        <el-table-column label="进货状态" prop="isbuy" filter-placement="bottom-end" :filters="[{ text: '未进货', value: 0 }, { text: '进货完成', value: 1 }]" :filter-method="filterTag2">
          <template slot-scope="scope">
            <!-- 显示发货图标 -->
            <el-tag  :type="goodstatuss[scope.row.isbuy]" plain disabled size="closable" hit="true">{{goodstatussstr[scope.row.isbuy]}}</el-tag >
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="确定进货" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-tickets" size="mini" :disabled="scope.row.isbuy !=0" @click="createBuyGoodsOreder(scope.row)" round></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 7, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 进货单 -->
    <el-dialog title="进货单" :visible.sync="buyGoods" width="50%" @close="buyGoodsClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addbuygoodsForm" :rules="addbuygoodsFormRules" ref="addbuygoodsFormRef" size="small" label-width="120px">
        <el-form-item label="清单id" prop="goodsquantityid">
          <el-input v-model="addbuygoodsForm.goodsquantityid" disabled ></el-input>
        </el-form-item>
        <el-form-item label="商品名称" prop="goodsname">
          <el-input v-model="addbuygoodsForm.goodsname" disabled ></el-input>
        </el-form-item>
        <el-form-item label="最小进货数量" prop="minquantity">
          <el-input v-model="addbuygoodsForm.minquantity" disabled></el-input>
        </el-form-item>
        <el-form-item label="实际进货量" prop="realquantity" required>
          <el-input v-model="addbuygoodsForm.realquantity" type="number"></el-input>
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
      const regMin = this.minquantity
      if (regMin + '' <= value) {
        return cb()
      }

      cb(new Error('数量不能少于默认最小值: ' + this.minquantity))
    }
    return {
      // 获取发货单
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      buyorderList: [],
      total: 0,
      // 0-未发货  1-发货完成
      goodstatuss: {
        '0': 'warning',
        '1': 'info'
      },
      goodstatussstr: {
        '0': '未进货',
        '1': '进货完成'
      },
      buyGoods: false,
      addbuygoodsForm: {
        id: '',
        goodsquantityid: '',
        goodsname: '',
        minquantity: '',
        realquantity: ''
      },
      addbuygoodsFormRules: {
        realquantity: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          { validator: Checkminbuygoods, trigger: 'blur' }
        ]
      },
      minquantity: ''
    }
  },
  created () {
    this.getBuyOrderList()
  },
  methods: {
    filterTag2 (value, row) {
      return row.isbuy === value
    },
    async getBuyOrderList () {
      const { data: res } = await this.$http.post('buyorder/getBuyOrderListList', {
        query: this.queryInfo.query,
        pagenum: this.queryInfo.pagenum,
        pagesize: this.queryInfo.pagesize
      })
      if (res.code !== 200) {
        return this.$message.error('获取进货单列表失败！')
      }
      this.buyorderList = res.data.buyorderList.list
      this.total = res.data.buyorderList.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getBuyOrderList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getBuyOrderList()
    },
    // 点击确认，生成订货单
    addbuyGoods () {
      this.$refs.addbuygoodsFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起请求
        // console.log(this.addbuygoodsForm)
        const { data: res } = await this.$http.post('buyorder/checkBuyOrder', {
          id: this.addbuygoodsForm.id,
          goodsquantityid: this.addbuygoodsForm.goodsquantityid,
          goodsname: this.addbuygoodsForm.goodsname,
          realquantity: this.addbuygoodsForm.realquantity
        })

        if (res.code !== 200) {
          this.$message.error('进货失败！')
        }
        this.buyGoods = false
        this.$message.success('进货成功！')
        // 隐藏
        // 重新获表数据
        this.getBuyOrderList()
      })
    },
    // 显示订货单
    async createBuyGoodsOreder (row) {
      this.addbuygoodsForm.id = row.id
      this.addbuygoodsForm.goodsquantityid = row.goodsquantityid
      this.addbuygoodsForm.goodsname = row.goodsname
      this.addbuygoodsForm.minquantity = row.minquantity
      this.addbuygoodsForm.realquantity = row.minquantity
      this.minquantity = row.minquantity
      this.buyGoods = true
    },
    // 监听对话框的关闭事件
    buyGoodsClosed () {
      this.$refs.addbuygoodsFormRef.resetFields()
      this.minquantity = ''
    }
  }
}

</script>

<style lang="less" scoped>
</style>
