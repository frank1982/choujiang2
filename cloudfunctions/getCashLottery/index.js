// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'final-q8jvh' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  console.log("mydate:" + myDate)
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
  console.log(dayStr)

  //读取奖池配置信息
  const result = await db.collection("xianjinLotteryList")//await 必须要加
  .doc(dayStr)
  .get()
  
  var cashLotterys = result.data.data
  console.log("获取到本日现金奖池:")
  //console.log(cashLotterys)

  var end = []
  for (var i = 0; i < cashLotterys.length;i++){

    var tmp = {}
    var item = cashLotterys[i]
   
    if (item.usable == "on"){//只获取正常可用的现金奖池
      console.log(item)
      tmp["cashLotteryId"] = item.cashLotteryId
      tmp["startTime"] = item.startTime
      tmp["status"] = item.status
      end.push(tmp)
    }
  }

  /*
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
  */
  return end
}