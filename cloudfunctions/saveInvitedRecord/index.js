// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ 
  //env: 'final-q8jvh' 
  env: 'test-asni1' 
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  var sourceCustomerId = event.customerId
  var targetOpenId = wxContext.OPENID
  var result = {}

  var invitedRecords = await db.collection("invitedRecord")//await 必须要加
    .where({ 
      //'sourceCustomerId': sourceCustomerId,
      'targetOpenId':targetOpenId,
    })
    .get()
 

  if (invitedRecords.data.length > 0) {//找到，重复不操作
    result['code'] = 2000
    return result
  }

  //判断是不是新用户
  //新用户在customer表中应该不存在
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': targetOpenId })
    .get()
  console.log("customer:")
  console.log(customers)
  //获取customerId
  
  if (customers.data.length > 0) {//找到记录，被邀请的不是新客户

    result["code"] = 2002 //被邀请的不是新客户
    return result
  }

  //没有相同的邀请记录
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
  //创建邀请
  const create = await db.collection('invitedRecord').add({
    //CUSTOMERID, randomBonus, CASHLOTTERYID, dayStr, dayStr + ' ' + detailTime
    data: {

      sourceCustomerId: sourceCustomerId,
      targetOpenId:targetOpenId,
      status:0,
      createTime: dayStr + ' ' + detailTime,
    }
  })
  console.log("createNewOrder:")
  console.log(create)
  //{ _id: 'dbff9fc75df2402b02acdd2c1e6863ac',errMsg: 'collection.add:ok'}
  if (create.errMsg != 'collection.add:ok'){

    result["code"] = 2001 //创建邀请记录失败
    return result
  }else{
    result["code"] = 2222 //创建成功
    return result
  }
}