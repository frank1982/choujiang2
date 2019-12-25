// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ 
  env: 'final-q8jvh'
  //env: 'test-asni1'  
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  const $ = db.command.aggregate
  //统计所有奖池的总额度
  const endTotalMoney = await db.collection('xianjinLotteryList')
    .aggregate()
    /*
    .match({

      customerId: customerId,
      status: 'apply'

    })
    */
    .group({
      _id: null,
      totalAmount: $.sum(
        $.sum(['$data.money']))
    })

    .end()
  console.log(endTotalMoney)
  //{ list: [ { _id: null, totalAmount: 720 } ],errMsg: 'collection.aggregate:ok'}
  var totalMoney = endTotalMoney.list[0].totalAmount
  console.log("奖池总额度:"+totalMoney)

  //统计所有奖池的总额度
  const endTotalLeftMoney = await db.collection('xianjinLotteryList')
    .aggregate()
    /*
    .match({

      customerId: customerId,
      status: 'apply'

    })
    */
    .group({
      _id: null,
      totalAmount: $.sum(
        $.sum(['$data.leftMoney']))
    })

    .end()
  console.log(endTotalLeftMoney)
  var totalLeftMoney = endTotalLeftMoney.list[0].totalAmount
  console.log("奖池总剩余额度:" + totalLeftMoney)
  var totalExpense = totalMoney - totalLeftMoney
  console.log("奖池总支出:" + totalExpense)  

  //计算用户可用余额总额
  const endBalance = await db.collection('customer')
    .aggregate()
    .group({
      _id: null,
      totalFreeBalance: $.sum('$freeBalance'),
      totalFrozenBalance: $.sum('$frozenBalance')
    })

    .end()
  console.log("endBalance:")  
  console.log(endBalance)  
  var totalFreeBalance = endBalance.list[0].totalFreeBalance
  var totalFrozenBalance = endBalance.list[0].totalFrozenBalance

  //获取提现订单总金额
  const endTx = await db.collection('tixian')
    .aggregate()
    .group({
      _id: null,
      total: $.sum('$amount'),
    })

    .end()
  console.log("tixian:")
  console.log(endTx) 
  var totalTx = 0
  if (endTx.list.length > 0){
    totalTx = endTx.list[0].total
  }

  //计算出所有商品折现订单的总金额
  const exchangeTx = await db.collection('shopGoodsExchangeRecord')
    .aggregate()
    .group({
      _id: null,
      total: $.sum('$exchangeMoney'),
    })

    .end()
  console.log("商品折现金额:")
  console.log(exchangeTx) 
  var totalExchange = 0
  if (exchangeTx.list.length > 0){
    totalExchange = exchangeTx.list[0].total
  }

  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  //Mon Nov 11 2019 14:16:20 GMT+0000 (UTC)
  var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
  var month = myDate.getMonth() + 1;    //获取当前月份(0-11,0代表1月)
  if (month < 10) {
    month = "0" + month
  }
  var date = myDate.getDate();        //获取当前日(1-31)
  if (date < 10) {
    date = "0" + date
  }
  var dayStr = year + "-" + month + "-" + date
  //console.log(dayStr)

  var hours = myDate.getHours();
  if (hours < 10) {
    hours = "0" + hours
  }
  var minutes = myDate.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes
  }
  var seconds = myDate.getSeconds();
  if (seconds < 10) {
    seconds = "0" + seconds
  }
  var detailTime = dayStr+" "+hours + ":" + minutes + ":" + seconds
      //console.log(detailTime)

  var result = totalExpense+totalExchange - totalFreeBalance - totalTx
  //来源：奖池支出+商品折现
  //流向：余额+提现
  var result2 = totalTx - totalFrozenBalance

  const createMonitor0 = await db.collection('monitor0').add({

    data: {

      totalMoney: totalMoney,
      totalLeftMoney: totalLeftMoney,
      totalExpense: totalExpense,
      totalFreeBalance: totalFreeBalance,
      totalFrozenBalance: totalFrozenBalance,
      totalExchange:totalExchange,
      detaiTime: detailTime,
      totalTx: totalTx,
      result: result,
      result2: result2,
      createTime: new Date(Date.now())
    }
  })

  //if (createMonitor0._id == '') {}
}