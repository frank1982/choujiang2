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
  var result = {}
  var openId = wxContext.OPENID
  //console.log("openId:"+openId)
  var customers = await db.collection("customer")//await 必须要加
      .where({ 'openIdList.openId': openId })
      .get()
  console.log("customer:")
  console.log(customers)
    
  var CUSTOMERID = customers.data[0]._id
  //console.log(customerId)
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

  var hours = myDate.getHours();
  if (hours < 10) {
    hours = "0" + hours
  }
  var minutes = myDate.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes
  }
  var seconds = myDate.getSeconds();
  if (seconds < 10) {
    seconds = "0" + seconds
  }
  var detailTime = hours+":"+minutes+":"+seconds
  console.log(detailTime)
      
  var todayTicketCount = await db.collection("shopTakeTicketRecord")//await 必须要加
    .where({ 
      'customerId': CUSTOMERID, 
       lotteryTime: db.RegExp({
        regexp: dayStr,
        options: 'i',
      })
    })
    .count()



      console.log("todayTicketCount")
      console.log(todayTicketCount)
      if(todayTicketCount.total >= 5){
        result['code']=9001
        return result
      }else{
        result['code']=9999
        return result
      }
      //{ total: 4, errMsg: 'collection.count:ok' }
  }