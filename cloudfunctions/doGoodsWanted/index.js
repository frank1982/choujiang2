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
  var shiwuLotteryRecordId = event.shiwuLotteryRecordId
  var trueName = event.trueName
  var address = event.address
  var result = {}
  console.log("customerId:")
  console.log(customerId)
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
  }else{

    const changeOrder = await db.collection('shiwuLotteryRecord')
      .where({
        _id: shiwuLotteryRecordId,
        isNoticed:false,
        status:'winned',
        customerId:customerId,
        prizeLevel: _.in([1, 2, 3]),
        
      })
      .update({
        data: {
          status: 'wanted',
        }
      })
    if (changeOrder.stats.updated == 1){
      //更新实物抽奖订单状态 winned->wanted
      result['code'] = 6666
      return result
    }else{
      result['code'] = 6002
      return result
    }  
    
  }

  
}