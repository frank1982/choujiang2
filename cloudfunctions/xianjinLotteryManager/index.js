// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({  
  //env: 'final-q8jvh'
  env: 'test-asni1'
  })
const db = cloud.database()


// 云函数入口函数
//每两分钟检查当天奖池，根据时间变更状态
//还有一个逻辑是用户抽奖时触发
//0 即将开始 1 进行中 2 过期 3抽完/售罄

exports.main = async (event, context) => {

  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  console.log("mydDate:"+myDate)
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
  var result = await db.collection("xianjinLotteryList").doc(dayStr).get()
  for (var i = 0; i < result.data.data.length; i++) {

    var item = result.data.data[i]
    //console.log(item)
    var startTime = new Date(item.startTime)
    var endTime = new Date(item.endTime)
    //console.log("startTime:" + startTime)

    if (myDate < startTime) {

      console.log("第" + i + "个抽奖应该未开始");

    } else if (myDate < endTime && item.usable == "on") {

      console.log("第" + i + "个抽奖应该进行中");
      if (item.status == 0) {
        //修改成 1进行中
        await db.collection("xianjinLotteryList")
          .where({ '_id': dayStr })
          .update({

            data: {
              ['data.' + i + '.status']: 1,
            }
          })
          .then(res => {
            console.log("第" + i + "个抽奖由0->1");
          })
          .catch(console.error)
      }

    } else if (myDate >= endTime){

      console.log("第" + i + "个抽奖应该过期");
      if (item.status == 1 || item.status == 0) {
        //修改成 2过期
        await db.collection("xianjinLotteryList")
          .where({ '_id': dayStr })
          .update({
            data: {
              ['data.' + i + '.status']: 2,
            }
          })
          .then(res => {
            console.log("第" + i + "个抽奖由0/1->2");
          })
          .catch(console.error)
      }
    }
  }
}
