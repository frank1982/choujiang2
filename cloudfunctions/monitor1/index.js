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

  //发了多少张粮票
  const ticketSum = await db.collection('shopTakeTicketRecord').count()
  var ticketSended = ticketSum.total
  console.log("累计发放粮票:"+ticketSended+"张")

  //剩余多少张票
  const ticketLeftSum = await db.collection('shopTickets')
  .aggregate()
  .group({
    _id: null,
    total: $.sum('$ticket'),
  })
  .end()
  var ticketLeft = 0
  if(ticketLeftSum.list.length > 0){
    console.log("剩余粮票总数:"+ticketLeftSum.list[0].total+"张")  
    ticketLeft = ticketLeftSum.list[0].total
  }
  
 
  //发了多少实物商品
  const riceSum = await db.collection('shopLotteryRecord')
  .aggregate()
  .match({
    goodsType: 'rice'
  })
  .group({
    _id: null,
    total: $.sum('$goodsNum'),
  })
  .end()

  var totalRice = 0
  if(riceSum.list.length > 0){
    console.log("大米累计发放:"+riceSum.list[0].total+"克")  
    totalRice = riceSum.list[0].total
  }
 

  const oilSum = await db.collection('shopLotteryRecord')
  .aggregate()
  .match({
    goodsType: 'oil'
  })
  .group({
    _id: null,
    total: $.sum('$goodsNum'),
  })
  .end()

  var totalOil = 0
  if(oilSum.list.length > 0){
    console.log("油累计发放:"+oilSum.list[0].total+"毫升")  
    totalOil = oilSum.list[0].total
  }
  

  const eggSum = await db.collection('shopLotteryRecord')
  .aggregate()
  .match({
    goodsType: 'egg'
  })
  .group({
    _id: null,
    total: $.sum('$goodsNum'),
  })
  .end()

  var totalEgg = 0
  if(eggSum.list.length > 0){
    console.log("鸡蛋累计发放:"+eggSum.list[0].total+"个")  
    totalEgg = eggSum.list[0].total
  }
 

  //获取兑换比例
  const baseInfo = await cloud.callFunction({
    // 要调用的云函数名称
    name: 'getShopGoodsBaseInfo',
    
  })
  console.log("baseInfo:"+baseInfo.result)
  var exchangeRate_rice = 0
  var exchangeRate_oil = 0
  var exchangeRate_egg = 0
  exchangeRate_rice= baseInfo.result[0].exchangPrice
  exchangeRate_oil = baseInfo.result[1].exchangPrice
  exchangeRate_egg = baseInfo.result[2].exchangPrice

  //成本价
  var cost_rice = 0.01//每克
  var cost_oil = 0.0167//每毫升
  var cost_egg = 1.2//每个

  //已发放商品总成本
  var cost = cost_rice*totalRice + cost_oil*totalOil + cost_egg*totalEgg

  //现有商品总数
  const riceNowSum = await db.collection('shopTickets')
  .aggregate()
  .group({
    _id: null,
    total: $.sum('$rice'),
  })
  .end()

  var riceNow = 0
  if(riceNowSum.list.length > 0){
    riceNow = riceNowSum.list[0].total
  }
  

  const oilNowSum = await db.collection('shopTickets')
  .aggregate()
  .group({
    _id: null,
    total: $.sum('$oil'),
  })
  .end()

  var oilNow = 0
  if(oilNowSum.list.length > 0){
    oilNow = oilNowSum.list[0].total
  }
 
  const eggNowSum = await db.collection('shopTickets')
  .aggregate()
  .group({
    _id: null,
    total: $.sum('$egg'),
  })
  .end()

  var eggNow = 0
  if(eggNowSum.list.length > 0){
    eggNow = eggNowSum.list[0].total
  }
 

  //累计折现商品总数
  const riceExSum = await db.collection('shopGoodsExchangeRecord')
  .aggregate()
  .match({
    goodsType: 'rice'
  })
  .group({
    _id: null,
    total: $.sum('$goodsNum'),
  })
  .end()

  var totalRiceExchanged = 0
  if(riceExSum.list.length > 0){
    console.log("大米累计折现数:"+riceExSum.list[0].total+"克")  
    totalRiceExchanged = riceExSum.list[0].total
  }
  

  const oilExSum = await db.collection('shopGoodsExchangeRecord')
  .aggregate()
  .match({
    goodsType: 'oil'
  })
  .group({
    _id: null,
    total: $.sum('$goodsNum'),
  })
  .end()

  var totalOilExchanged = 0
  if(oilExSum.list.length > 0){

    console.log("油累计折现数:"+oilExSum.list[0].total+"毫升")  
    totalOilExchanged = oilExSum.list[0].total
  }
  

  const eggExSum = await db.collection('shopGoodsExchangeRecord')
  .aggregate()
  .match({
    goodsType: 'egg'
  })
  .group({
    _id: null,
    total: $.sum('$goodsNum'),
  })
  .end()

  var totalEggExchanged = 0
  if(eggExSum.list.length > 0){
    console.log("鸡蛋累计折现数:"+eggExSum.list[0].total+"个")  
    totalEggExchanged = eggExSum.list[0].total
  }
 


  //累计发货总数
  const ricePakSum = await db.collection('shopPackOrderRecord')
  .aggregate()
  .match({
    goodsType: 'rice'
  })
  .group({
    _id: null,
    total: $.sum('$packNum'),//单位袋 5公斤
  })
  .end()

  var totalRicePaked = 0
  if(ricePakSum.list.length > 0){
    console.log("大米累计发货数:"+ricePakSum.list[0].total*5000+"克")  
    totalRicePaked = ricePakSum.list[0].total*5000
  }
  

  const oilPakSum = await db.collection('shopPackOrderRecord')
  .aggregate()
  .match({
    goodsType: 'oil'
  })
  .group({
    _id: null,
    total: $.sum('$packNum'),//单位 1800毫升
  })
  .end()

  var totalOilPaked = 0
  if(oilPakSum.list.length > 0){
    console.log("油累计发货数:"+oilPakSum.list[0].total*1800+"毫升")  
    totalOilPaked = oilPakSum.list[0].total*1800
  }
 

  const eggPakSum = await db.collection('shopPackOrderRecord')
  .aggregate()
  .match({
    goodsType: 'egg'
  })
  .group({
    _id: null,
    total: $.sum('$packNum'),//单位 1800毫升
  })
  .end()

  var totalEggPaked = 0
  if(eggPakSum.list.length > 0){
    console.log("鸡蛋累计发货数:"+eggPakSum.list[0].total*10+"个")  
    totalEggPaked = eggPakSum.list[0].total*10
  }
 

  //总发放-总库存-总发货-总折现
  var riceResult = totalRice - riceNow-totalRicePaked-totalRiceExchanged
  var oilResult = totalOil - oilNow-totalOilPaked-totalOilExchanged
  var eggResult = totalEgg - eggNow-totalEggPaked-totalEggExchanged


  //总折现的商品价值
  var exchangeGoodsMoney = totalRiceExchanged*exchangeRate_rice+totalOilExchanged*exchangeRate_oil+totalEggExchanged*exchangeRate_egg
  //计算出所有商品折现订单的总金额
  console.log("商品折现价格:"+exchangeGoodsMoney)
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

  var exchangeResult = exchangeGoodsMoney - totalExchange
  //商品折现价值-实际折现金额

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



  const createMonitor0 = await db.collection('monitor1').add({

    data: {
      ticketSended:ticketSended,
      ticketLeft:ticketLeft,
      ticketUsed:ticketSended-ticketLeft,//消耗粮票数
      totalCost:cost,//实际发放商品总价值 预期=消耗粮票数*单位粮票带来的广告收益
      riceResult: riceResult,//某个商品总发放-总库存-总折现-总发货 预期=0
      oilResult:oilResult,
      eggResult:eggResult,
      exchangeResult:exchangeResult,//折现商品价值-实际折现金额 预期=0
      createTime: new Date(Date.now())
    }
  })

  //if (createMonitor0._id == '') {}
}