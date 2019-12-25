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
  var customerId = event.customerId
  var trueName = event.trueName
  var address = event.address
  var goodsName = event.goodsName
  var result = {}
  console.log("customerId:")
  console.log(customerId)
  console.log("goodsName:"+goodsName)
  //先更新客户信息
  const _ = db.command
  const changeInfo = await db.collection('customer').doc(customerId)
    .update({
      data: {
        trueName: trueName,
        address: address     
      }
    })

  console.log(changeInfo)  
  if (changeInfo.stats.updated < 0 || changeInfo.stats.updated > 1) {
    result['code'] = 6001 //更新用户信息失败
    return result
  }
  //确定要发货的包装数量
  const ticketCheck = await db.collection("shopTickets")//await 必须要加
    .where({ 'customerId': customerId })
    .get()
  //抽奖，扣减粮票，增加个人商品，并返回结果
  if (ticketCheck.data.length <= 0){//没有该用户
    result["code"] = 6002 //没有该用户
    return result
  }
  console.log("ticketCheck")
  console.log(ticketCheck)
  var packNum = 0
  if(goodsName == "rice"){
    packNum = Math.floor(ticketCheck.data[0].rice/5000)
    if(packNum <= 0){
      result["code"] = 6003 //不满1个单位
      return result
    }
    //扣减
  const shopUpdate0 = await db.collection("shopTickets")//await 必须要加
  .where({ 'customerId': customerId })
  .update({
    data: {
      rice: _.inc(-5000*packNum),
    }
  })
  console.log(shopUpdate0)
  if (shopUpdate0.stats.updated != 1) {
    result["code"] = 6004 //更新物资数据失败
    return result
    } 
  }else if(goodsName == "oil"){
    packNum = Math.floor(ticketCheck.data[0].oil/1800)
    if(packNum <= 0){
      result["code"] = 6003 //不满1个单位
      return result
    }
    //扣减
  const shopUpdate1 = await db.collection("shopTickets")//await 必须要加
  .where({ 'customerId': customerId })
  .update({
    data: {
      oil: _.inc(-1800*packNum),
    }
  })
  console.log(shopUpdate1)
  if (shopUpdate1.stats.updated != 1) {
    result["code"] = 6004 //更新物资数据失败
    return result
    } 
  }else if(goodsName == 'egg'){
    packNum = Math.floor(ticketCheck.data[0].egg/10)
    if(packNum <= 0){
      result["code"] = 6003 //不满1个单位
      return result
    } 
     //扣减
  const shopUpdate2 = await db.collection("shopTickets")//await 必须要加
  .where({ 'customerId': customerId })
  .update({
    data: {
      egg: _.inc(-10*packNum),
    }
  })
    console.log(shopUpdate2)
    if (shopUpdate2.stats.updated != 1) {
    result["code"] = 6004 //更新物资数据失败
    return result
    } 
  }


  
  
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
   const createNewOrder = await db.collection('shopPackOrderRecord').add({
     //CUSTOMERID, randomBonus, CASHLOTTERYID, dayStr, dayStr + ' ' + detailTime
     data: {
 
       goodsType: goodsName,
       packNum: packNum,
       customerId: customerId,
       lotteryTime: dayStr + ' ' + detailTime,
     }
   })
   console.log("createNewOrder:")
   console.log(createNewOrder)
   //{ _id: 'dbff9fc75df2402b02acdd2c1e6863ac',errMsg: 'collection.add:ok'}
   if (createNewOrder.errMsg != 'collection.add:ok'){
 
     result["code"] = 6005 //创建商品打包记录失败
     return result
   }else{
     result["code"] =6666 //成功

     return result
   }
  
  

  
}