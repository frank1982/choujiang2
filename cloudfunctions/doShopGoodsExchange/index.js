// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  //env:'test-asni1'
  env: 'final-q8jvh'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  //获取openID
  var openId = wxContext.OPENID
  var goodsName = event.goodsName
  console.log("goodsName:"+goodsName)
  var result = {}
  //console.log("openId:"+openId)
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  console.log("customer:")
  //console.log(customers)
  //获取customerId
  
  if (customers.data.length == 0) {//没有找到，新用户

    //请求小程序补充授权手机号码
    result["code"] = 6001 //请求补充手机号码
    return result
  }
  var customerId = customers.data[0]._id
  
  //获取用户商品数量
 
  const ticketCheck = await db.collection("shopTickets")//await 必须要加
    .where({ 'customerId': customerId })
    .get()
  if (ticketCheck.data.length <= 0){//没有该用户
    
    result["code"] = 6002 //没有该用户
    return result
  }
  var goodsNum = 0
  goodsNum = ticketCheck.data[0][goodsName]
  //扣减商品
  console.log("goodsNum:"+goodsNum)
  if(goodsNum <= 0.1){
    result["code"] = 6007 //数量不足
    return result
  }
  //计算折算后的金额
  const baseInfo = await cloud.callFunction({
    // 要调用的云函数名称
    name: 'getShopGoodsBaseInfo',
    
  })
  console.log("baseInfo:"+baseInfo.result)
  var exchangeRate = 0
  if(goodsName == "rice"){
    exchangeRate= baseInfo.result[0].exchangPrice
  }else if(goodsName == "oil"){
    exchangeRate= baseInfo.result[1].exchangPrice
  }else if(goodsName == "egg"){
    exchangeRate= baseInfo.result[2].exchangPrice
  }
  console.log("兑换比例:"+exchangeRate)
  //计算出兑换金额
  var exchangeMoney = Math.round(exchangeRate*goodsNum*100)/100
  console.log("兑换金额:"+exchangeMoney)
  const _ = db.command
  //扣减商品
  if(goodsName == "rice"){
    const changeInfo0 = await db.collection('shopTickets')
    .where({ 'customerId': customerId })
    .update({
      data: {
        rice: 0,
      }
    })
    if (changeInfo0.stats.updated < 0 || changeInfo0.stats.updated > 1) {
      result['code'] = 6003 //更新用户信息失败
      return result
    }
  }else if(goodsName == "oil"){
    const changeInfo1 = await db.collection('shopTickets')
    .where({ 'customerId': customerId })
    .update({
      data: {
        oil:0,  
      }
    })
    if (changeInfo1.stats.updated < 0 || changeInfo1.stats.updated > 1) {
      result['code'] = 6003 //更新用户信息失败
      return result
    }
  }else if(goodsName == "egg"){
    const changeInfo2 = await db.collection('shopTickets')
    .where({ 'customerId': customerId })
    .update({
      data: {
        egg:0,
      }
    })
    if (changeInfo2.stats.updated < 0 || changeInfo2.stats.updated > 1) {
      result['code'] = 6003 //更新用户信息失败
      return result
    }
  }
  //创建变现订单
   //创建商品发货记录
   var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
   var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
   var month = myDate.getMonth() + 1;    //获取当前月份(0-11,0代表1月)
   if (month < 10) {
     month = "0" + month
   }
   var date = myDate.getDate();        //获取当前日(1-31)
   if (date < 10) {
     date = "0" + date
   }
   var dayStr = year + "" + month + "" + date
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
   var detailTime = hours + ":" + minutes + ":" + seconds
   //创建商品抽奖订单
   const createNewOrder = await db.collection('shopGoodsExchangeRecord').add({
     //CUSTOMERID, randomBonus, CASHLOTTERYID, dayStr, dayStr + ' ' + detailTime
     data: {
 
       goodsType: goodsName,
       goodsNum: goodsNum,
       customerId: customerId,
       exchangeRate:exchangeRate,
       exchangeMoney:exchangeMoney,
       exchangeTime: dayStr + ' ' + detailTime,
     }
   })
   console.log("createNewOrder:")
   console.log(createNewOrder)
   //{ _id: 'dbff9fc75df2402b02acdd2c1e6863ac',errMsg: 'collection.add:ok'}
   if (createNewOrder.errMsg != 'collection.add:ok'){
 
     result["code"] = 6005 //创建商品打包记录失败
     return result
   }
  //增加现金余额
  const addMoney = await db.collection('customer').doc(customerId)
    .update({
      data: {
        freeBalance:_.inc(exchangeMoney),  
      }
    }) 
    if (addMoney.stats.updated < 0 || addMoney.stats.updated > 1) {
      result['code'] = 6006 //更新用户信息失败
      return result
    }else{
      result['code'] = 6666 
      return result
    }
 
}