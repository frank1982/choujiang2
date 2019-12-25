// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'final-q8jvh'
  //env: 'test-asni1'
})
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var customerId = event.customerId
  var goodsId = event.goodsId
  var shiwuLotteryRecordId = event.shiwuLotteryRecordId
  console.log("customerId:" + customerId)
  console.log("goodsId:" + goodsId)
  //在实物抽奖记录中寻找我中的实物奖品

  var result = {}
  const goodsLotteryRecord = await db.collection('shiwuLotteryRecord')
    .doc(shiwuLotteryRecordId)
    .get()
  var prizeLevel = goodsLotteryRecord.data.prizeLevel

  const goodInfo = await db.collection('shiwuGoods')
    .doc(goodsId)
    .get()
  
  for (var j = 0; j < goodInfo.data.price.length; j++) {

   
    if (goodInfo.data.price[j].priceLevel == prizeLevel) {
      
      result['myPrizeName'] = goodInfo.data.price[j].priceName
      break
    }
  }
  result['price'] = goodInfo.data.price
  result['sponsor'] = goodInfo.data.sponsor
  result['coverImg'] = goodInfo.data.coverImg
  result['lotteryTime'] = goodInfo.data.lotteryTime
  return result
}