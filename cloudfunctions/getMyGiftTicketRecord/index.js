// 云函数入口文件
const cloud = require('wx-server-sdk')
/**
   * table shopGiftTicketRecord
   * targetCustomerId: targetCustomerId,
          targetOpenId: targetOpenId,
          sourceCustomerId: sourceCustomerId,
          giftTicketNum:1,
          createTime: dayStr + ' ' + detailTime,
   */
cloud.init({
  //env: 'final-q8jvh' 
  env: 'test-asni1'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var customerId = event.customerId
  var result = {}
 console.log("my customerId:"+customerId)
 /*
  const my = await db.collection('shopGiftTicketRecord')
  .where({
    sourceCustomerId:customerId,
  })
  .get()
  console.log(my.data)
  */
    const my = await db.collection('shopGiftTicketRecord')
      .aggregate()
      .match({
        sourceCustomerId:customerId,
      })
      .sort({

        createTime: -1

      })
      .lookup({
        from: "customer",
        localField: "targetCustomerId",
        foreignField: "_id",
        as: "targetCustomers"
      })
      .end()
  
      console.log(my)
  if (my.list.length > 0){
    result['code']=9999
    result['records']=my.list
    return result
  }else{
    result['code']=9000//没有赠票记录
    return result
  }
  
}