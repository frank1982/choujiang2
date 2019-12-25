// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'final-q8jvh' 
  //env: 'test-asni1'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  var result = {}

  //检查是否新用户
  //查找该用户手机号码是否已具备，是否是新用户？customer table
  var openId = wxContext.OPENID
  console.log("openId:")
  console.log(openId)
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  console.log("customer:")
  console.log(customers)
  //获取customerId

  if (customers.data.length == 0) {//没有找到，新用户

    //请求小程序补充授权手机号码
    result["ticketNum"] = 0
    return result
  }
  var customerId = customers.data[0]._id
  //检查该用户是否有足够的票
  const ticketCheck = await db.collection("shopTickets")//await 必须要加
    .where({ 'customerId': customerId })
    .get()
  console.log("ticketCheck:")
  console.log(ticketCheck)
  //抽奖，扣减粮票，增加个人商品，并返回结果
  if (ticketCheck.data.length <= 0) {//没有该用户
    result["ticketNum"] = 0 //ticket表里没有该用户，没有拿票记录
    return result
  }else{
    result["ticketNum"] = ticketCheck.data[0].ticket//ticket表里没有该用户，没有拿票记录
    return result
  }
  
  
}

