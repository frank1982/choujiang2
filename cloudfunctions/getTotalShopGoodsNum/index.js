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
  const $ = db.command.aggregate

  const riceSum = await db.collection('shopLotteryRecord')
    .aggregate()
    .match({

      goodsType: 'rice',

    })
    .group({
      _id: null,
      totalAmount: $.sum('$goodsNum')
    })
    
    .end()
    console.log("riceSumNum:")
    console.log(riceSum)//{ list: [], errMsg: 'collection.aggregate:ok' }
    
    var riceSumNum = riceSum.list[0].totalAmount
    console.log(riceSumNum)
    // { list: [ { _id: null, totalAmount: 6.69 } ],errMsg: 'collection.aggregate:ok'}


    const oilSum = await db.collection('shopLotteryRecord')
    .aggregate()
    .match({

      goodsType: 'oil',

    })
    .group({
      _id: null,
      totalAmount: $.sum('$goodsNum')
    })
    
    .end()
    console.log("oilSumNum:")
    var oilSumNum = oilSum.list[0].totalAmount
    console.log(oilSumNum)

    const eggSum = await db.collection('shopLotteryRecord')
    .aggregate()
    .match({

      goodsType: 'egg',

    })
    .group({
      _id: null,
      totalAmount: $.sum('$goodsNum')
    })
    
    .end()
    console.log("eggSumNum:")
    var eggSumNum = eggSum.list[0].totalAmount
    console.log(eggSumNum)

    var result = {}
    if(riceSumNum >= 1){
      result['rice'] = "已送出大米 "+(riceSumNum/1000).toFixed(2)+" 公斤"
    }
    if(oilSumNum >= 1){
      result['oil'] = "已送出食用油 "+(oilSumNum/1000).toFixed(2)+" 升"
    }
    if(eggSumNum >= 1){
      result['egg'] = "已送出鸡蛋 "+eggSumNum+" 个"
    }
    return result
}