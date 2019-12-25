// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {
  //env: 'final-q8jvh'
  env: 'test-asni1'
  }
)
const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  
  const wxContext = cloud.getWXContext()

  const goods = await db.collection("shiwuGoods")//await 必须要加
    //.doc(event.goodsId)
    .where({
      _id: event.goodsId,
      usable: "on",
      status: _.in([0, 1])
    })
    .get()
  console.log("goods:")
  console.log(goods)
  
  var results = {}
  if (goods.data.length > 0) {

    results = goods.data[0]
  
  }

  return {
    result: results
  }
  
}