// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'final-q8jvh' })
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  var customerId = event.customerId
  const wxContext = cloud.getWXContext()
  const $ = db.command.aggregate

  const end = await db.collection('tixian')
    .aggregate()
    .match({

      customerId: customerId,
      status:'apply'

    })
    .group({
      _id: null,
      totalAmount: $.sum('$amount')
    })
    
    .end()
  console.log(end)
  // { list: [ { _id: null, totalAmount: 6.69 } ],errMsg: 'collection.aggregate:ok'}
  var total = 0
  if(end.list.length > 0){
    total = end.list[0].totalAmount
  }
  
  return {
    customerId: customerId,
    amount: total
  }
}