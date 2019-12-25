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
  console.log("customerId:"+customerId)

  //在实物抽奖记录中寻找我中的实物奖品
  const goodsLotteryList = await db.collection('shiwuLotteryRecord')
  .where({
    customerId:customerId,
    status: _.in(['winned', 'wanted', 'gived']),
    prizeLevel: _.in([1, 2, 3])
  })
  .get()
  console.log(goodsLotteryList.data)
  var results = []
  if (goodsLotteryList.data.length > 0){
    for (var i = 0; i < goodsLotteryList.data.length;i++){
      tmp = {}
      tmp['shiwuLotteryRecordId'] = goodsLotteryList.data[i]._id
      tmp['status'] = goodsLotteryList.data[i].status
      var goodId = goodsLotteryList.data[i].goodsLotteryId
      var prizeLevel = goodsLotteryList.data[i].prizeLevel
      //tmp['myPrizeLevel'] = prizeLevel
      tmp['goodsId'] = goodId
      //具体具体的奖励名称，注意奖品有多个等级
      const goodInfo = await db.collection('shiwuGoods')
        .doc(goodId)
        .get()
      //console.log("goodInfo")
      //console.log(goodInfo)
      //console.log("goodInfo.data.price.length:"+goodInfo.data.price.length)
      for(var j=0;j<goodInfo.data.price.length;j++){
        //console.log("goodInfo.data.price[j].priceLevel:")
        //console.log(goodInfo.data.price[j].priceLevel)
        if (goodInfo.data.price[j].priceLevel == prizeLevel){
          console.log(j)
          tmp['myPrizeName'] = goodInfo.data.price[j].priceName
          console.log("priceName:")
          console.log(goodInfo.data.price[j].priceName)
          break
        }
      }
      
      
      //tmp['sponsor'] = goodInfo.data.sponsor
      //tmp['coverImg'] = goodInfo.data.coverImg
      //tmp['price'] = goodInfo.data.price
      //var lotteryTime = item.lotteryTime
      //tmp['lotteryTime'] = goodInfo.data.lotteryTime
      //tmp['showListNo'] = item.showListNo
      
      results.push(tmp)  
      
    }
  }
  return results
}