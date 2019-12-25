// 云函数入口文件
//提现下单
const cloud = require('wx-server-sdk')

cloud.init({ 
  //env:'test-asni1'
  env: 'final-q8jvh' 
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  var customerId = event.customerId
  var newName = event.newName
  //先扣减用户当前全部可用余额，增加冻结金额
  const getBalanceResult = await db.collection('customer').doc(customerId).get()
  console.log(getBalanceResult)
  var freeBalance = getBalanceResult.data.freeBalance
  var mobile = getBalanceResult.data.mobile
  //var trueName = getBalanceResult.data.trueName

  var result = {}
  if (newName == null || newName == '' || newName == 'undefined'){
    result['code']=4002//需要填写真实姓名
    return result
  }
  console.log("freeBalance:"+freeBalance)
  //创建提现订单

  if (freeBalance < 5 && freeBalance >= 0){

    result['code']=4000//余额不足
    return result
  } else if (freeBalance >= 5){

    const _ = db.command
    const changeBalance = await db.collection('customer').doc(customerId)
    .update({
      data:{
        freeBalance:0,
        frozenBalance: _.inc(freeBalance),
        trueName:newName
      }
    })
    if (changeBalance.stats.updated != 1){
      result['code'] = 4001 //扣减余额错误
      return result
    }
    //创建提现订单
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
    var detailTime = hours + ":" + minutes + ":" + seconds

    const createTixianOrder = await db.collection('tixian').add({

      data: {

        amount: freeBalance,
        applyTime:dayStr+" "+detailTime,
        customerId:customerId,
        mobile:mobile,
        truename:newName,
        type:'wx',
        status:'apply',
        createTime: new Date(Date.now())
      }
    })
    console.log("createTixianOrder:")
    console.log(createTixianOrder)
    if (createTixianOrder._id == '') {
      result["code"] = 4003 //创建提现订单错误
      return result
    }else{
      result['code'] = 8888
      return result
    }
    
  }
  
}