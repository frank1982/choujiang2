// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'final-q8jvh'
  //env: 'test-asni1'
})
const db=cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  const goods = await db.collection("shopGoods")//await 必须要加
    .get()
  return goods.data

}