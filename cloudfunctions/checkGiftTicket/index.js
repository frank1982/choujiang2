// 云函数入口文件
/*
table invitedRecord
sourceCustomerId: sourceCustomerId,
targetOpenId:targetOpenId,
createTime: dayStr + ' ' + detailTime,
*/
const cloud = require('wx-server-sdk')

cloud.init({ 
  //env: 'final-q8jvh' 
  env: 'test-asni1' 
})
const db = cloud.database()
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  
  //检查邀请表，得到每个targetOpenId
  const $ = db.command.aggregate
  const _ = db.command
  const count = await db.collection('invitedRecord')
  .where({
    'status':0,
  })
  .count()
  const total = count.total
  console.log("累计没有发过粮票的邀请记录:"+total)
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('invitedRecord')
    .where({
      'status':0,
    })
    .skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  
  const dosome = await Promise.all(tasks)
  console.log(dosome)
  var invitedRecords = dosome[0].data
  for(var i=0;i<invitedRecords.length;i++){

      var result = {}
      var targetOpenId = invitedRecords[i].targetOpenId
      var sourceCustomerId = invitedRecords[i].sourceCustomerId
      var status = invitedRecords[i].status
      if(status == 1){
        console.log(invitedRecords[i]._id + "状态为1")
        continue
      }
      //根据targetOpenId 找到 targetCustomerId
      var customers = await db.collection("customer")//await 必须要加
      .where({ 'openIdList.openId': targetOpenId})
      .get()
      //console.log("customer:")
      //console.log(customers)
    
      if (customers.data.length == 0){//没有找到，该用户没有使用

        result["code"] = 1000 //该用户不存在
        return result

      }
      //找到，老用户,获取customerId
      var targetCustomerId = customers.data[0]._id

      //看该客户有没有拿过粮票
      const ticketCheck = await db.collection("shopTickets")
        .where({ 'customerId': targetCustomerId})
        .get()
      console.log("ticketCheck:")
      console.log(ticketCheck)

      if (ticketCheck.data.length <= 0) {//没有该用户
        result["code"] = 1001 //ticket表里没有该用户，没有拿票记录
        return result
      }
      //被邀请的客户拿过票，需要发放奖励
      //shopGiftTickRecord
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
      //创建赠送粮票记录
      const createNewOrder = await db.collection('shopGiftTicketRecord').add({
    
        data: {

          targetCustomerId: targetCustomerId,
          targetOpenId: targetOpenId,
          sourceCustomerId: sourceCustomerId,
          giftTicketNum:1,
          createTime: dayStr + ' ' + detailTime,
        }
      })
    console.log("createNewOrder:")
    console.log(createNewOrder)
    //{ _id: 'dbff9fc75df2402b02acdd2c1e6863ac',errMsg: 'collection.add:ok'}
    if (createNewOrder.errMsg != 'collection.add:ok'){

      result["code"] = 1002 //创建赠票记录失败
      return result
    }

    //更新邀请记录
    const update = await db.collection("invitedRecord")//await 必须要加
      .where({ 
        
        sourceCustomerId: sourceCustomerId,
        targetOpenId:targetOpenId,
        status:0,
      })
      .update({
        data: {
          status: 1,
        }
      })
    console.log(update)
    if (update.stats.updated != 1) {
      result["code"] = 1004 //更新邀请记录失败
      return result
    } 


    //发起邀请方ticket +1
    const shopUpdate = await db.collection("shopTickets")//await 必须要加
      .where({ 'customerId': sourceCustomerId})
      .update({
        data: {
          ticket: _.inc(1),
        }
      })
    console.log(shopUpdate)
    if (shopUpdate.stats.updated != 1) {
      result["code"] = 1003 //更新赠票数据
      return result
    } else {
      result["code"] = 1111//成功
      return result
    }
  }
}