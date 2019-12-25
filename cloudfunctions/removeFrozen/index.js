// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  
  //if (!event.env) return { errCode: -1, errMsg: '环境id为空' }
  const wxContext = cloud.getWXContext()
  /*
  cloud.init({

    env: event.env,
    traceUser: true
  })
  const db = cloud.database()
  */

  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  //Mon Nov 11 2019 14:16:20 GMT+0000 (UTC)
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

  return {
    dayStr: dayStr,
  }
}