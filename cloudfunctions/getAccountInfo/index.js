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

  var openId = wxContext.OPENID
  //根据openID尝试获取客户信息
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  //console.log("customer:")
  //console.log(customers)
  var result = {}
  if (customers.data.length == 0) {//没有找到，新用户

   
    result["code"] = 3000 //新用户
    return result

  } else if (customers.data.length == 1){//找到，老用户,获取customerId

    console.log(customers)
    result["trueName"] = customers.data[0].trueName;
    result["mobile"] = customers.data[0].mobile;
    result["freeBalance"] = customers.data[0].freeBalance.toFixed(2);
    result["freeCoin"] = customers.data[0].freeCoin;
    result["customerId"] = customers.data[0]._id;
    if (customers.data[0].address){
      result["address"] = customers.data[0].address
    }
    result["code"] = 7777 //老用户
    return result
  }

}