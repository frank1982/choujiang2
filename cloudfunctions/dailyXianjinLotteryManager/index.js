// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'final-q8jvh'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {

  //var myDate = new Date();
  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  console.log("mydate:"+myDate)
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

  //首先避免先做查询，避免重复创建奖池
  //catch (err => {}) 中不会继续异步执行???

  const count = await db.collection("xianjinLotteryList").where({
    _id: dayStr // 填入当前用户 openid
  }).count();
  //console.log("count:"+count.total)
  if (count.total == 0) {

    console.log("当日奖池数据不存在，可以创建");
    //读取奖池配置信息
    const searchResult = await db.collection('xianjinLotteryBase')//await 必须要加
      .doc('setting')
      .get()

    console.log("searchResult:" + searchResult.data);
    var myResult = searchResult.data
    var maxBonus = myResult.maxBonus
    var minBonus = myResult.minBonus
    var lotteryMoney = myResult.lotteryMoney
    var lotteryTicket = myResult.lotteryTicket
    var usable = myResult.usable


    //判断配置信息是否有效
    if (usable == "on"){

      var startTimeStr0 = year + "-" + month + "-" + date + " 09:00:00"
      var endTimeStr0 = year + "-" + month + "-" + date + " 11:00:00"
      var startTimeStr1 = year + "-" + month + "-" + date + " 14:00:00"
      var endTimeStr1 = year + "-" + month + "-" + date + " 16:00:00"
      var startTimeStr2 = year + "-" + month + "-" + date + " 19:00:00"
      var endTimeStr2 = year + "-" + month + "-" + date + " 21:00:00"

      await db.collection('xianjinLotteryList').add({
        data: {

          _id: dayStr,
          data: [
            {
              cashLotteryId: dayStr+"0",
              status: 0,
              startTime: startTimeStr0,
              endTime: endTimeStr0,
              maxBonus: maxBonus,
              minBonus: minBonus,
              money: lotteryMoney,
              ticket: lotteryTicket,
              leftMoney: lotteryMoney,
              leftTicket: lotteryTicket,
              usable:"on"
            },
            {
              cashLotteryId: dayStr + "1",
              status: 0,
              startTime: startTimeStr1,
              endTime: endTimeStr1,
              maxBonus: maxBonus,
              minBonus: minBonus,
              money: lotteryMoney,
              ticket: lotteryTicket,
              leftMoney: lotteryMoney,
              leftTicket: lotteryTicket,
              usable: "on"
            },
            
            {
              cashLotteryId: dayStr + "2",
              status: 0,
              startTime: startTimeStr2,
              endTime: endTimeStr2,
              maxBonus: maxBonus,
              minBonus: minBonus,
              money: lotteryMoney,
              ticket: lotteryTicket,
              leftMoney: lotteryMoney,
              leftTicket: lotteryTicket,
              usable: "on"
            }
            
          ]
        }
      })
      .then(res => {
        console.log("新增当日现金奖池成功!")
        
      })
      .catch(console.error)

    }else{
      console.log("现金奖池配置信息失效")
    }
  } else {
    console.log("当日奖池数据已存在!");
  }
}

