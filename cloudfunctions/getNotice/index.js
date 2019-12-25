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
  //console.log(dayStr)

  var notice = await db.collection("xianjinLotteryRecord")//await 必须要加
    .aggregate()
    .match({
      lotteryDay: dayStr,
    })
    .sample({ size: 1 })
    .end()

  var result = {}
  if(notice.list.length > 0){
    var customerId = notice.list[0].customerId
    var bonus = notice.list[0].bonus
    //根据customerID 查手机号码或姓名
    try{  
      var customer = await db.collection("customer")//await 必须要加
        .doc(customerId)
        .get()
    } catch (e) {
      console.log(e)
      result["txt0"] = ''
      result['txt1'] = ''
      return result
    }  
    console.log("customer:")
    console.log(customer)
    var mobile = customer.data.mobile
    var trueName = customer.data.trueName
    console.log(trueName)
    if(trueName != "" && trueName != 'undefined' && trueName != null){
      console.log("000")
      result["txt0"] = '*' + trueName.substring(trueName.length - 1, trueName.length)+" 抽中"
      result['txt1']="现金红包"+bonus+"元"
      return result
    }else{

      result["txt0"] = '*' + mobile.substring(mobile.length - 4, mobile.length)+" 抽中"
      result['txt1'] = "现金红包" + bonus + "元"
      return result
    }
   
  }else{
    result["txt0"] = ''
    result['txt1'] = ''
    return result
  }
}