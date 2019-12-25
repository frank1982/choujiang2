// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  //env: 'final-q8jvh'
  env: 'test-asni1'
})
const db=cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  const goods = await db.collection("shiwuGoods")//await 必须要加
    .where({
      usable:"on",
      status: _.in([0, 1])//2 过期 3等待开奖 4 已开奖
      //status:1
    })
    .orderBy('showListNo', 'asc')
    .get()
  console.log("goods:")
  console.log(goods.data)
  var results = []
  if(goods.data.length > 0){

    for(var i=0;i<goods.data.length;i++){
      var tmp = {}
      var item = goods.data[i]
      tmp['_id'] = item._id
      tmp['sponsor'] = item.sponsor
      tmp['coverImg'] = item.coverImg
      tmp['price'] = item.price
      var lotteryTime = item.lotteryTime
      tmp['lotteryTime'] = lotteryTime
      tmp['showListNo'] = item.showListNo
      tmp['startTime'] = item.startTime
      tmp['status']=item.status
      results.push(tmp)
    }
    //console.log("results:")
    //console.log(results)
  }

  return {
    result:results
  }
}