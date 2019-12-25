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

  var openId = wxContext.OPENID
  //console.log("openId:"+openId)
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  var customerId = customers.data[0]._id
  //检查该用户是否有足够的票
  const ticketCheck = await db.collection("shopTickets")//await 必须要加
    .where({ 'customerId': customerId })
    .get()
  //抽奖，扣减粮票，增加个人商品，并返回结果
  if (ticketCheck.data.length <= 0){//没有该用户
    result["code"] = 8000 //没有该用户
    return result
  }else{
    result["code"] = 8888
    result['data']=ticketCheck.data[0]
    return result
  }
  
}

