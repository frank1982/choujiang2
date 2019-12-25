// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'final-q8jvh'
  //env: 'test-asni1'
})
const db = cloud.database();
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const $ = db.command.aggregate
  const countResult = await db.collection('customer').count()
  const total = countResult.total
  console.log("total:"+total)
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('customer').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  
  const dosome = await Promise.all(tasks)
  //console.log(dosome[0].data)
  var customers = dosome[0].data
  for(var i=0;i<customers.length;i++){

      var c = customers[i]
      var customerId = c._id
      var freeBalance = c.freeBalance
      var frozenBalance = c.frozenBalance
      var trueName = c.trueName
      //console.log("customerId:" + customerId)
      //查找现金抽奖记录
      const cashs = await db.collection("xianjinLotteryRecord")//await 必须要加
        .aggregate()
        .match({

          customerId: customerId,

        })
        .group({
          _id: null,
          totalAmount: $.sum('$bonus')
        })
        .end()
      var lotterySum = 0
      if (cashs.list.length > 0) {
        lotterySum = cashs.list[0].totalAmount
      }
    const tixianAmount = await db.collection("tixian")//await 必须要加
      .aggregate()
      .match({

        customerId: customerId,

      })
      .group({
        _id: null,
        totalAmount: $.sum('$amount')
      })
      .end()
    var tixianSum = 0
    if (tixianAmount.list.length > 0) {
      tixianSum = tixianAmount.list[0].totalAmount
    }
   
    var end = lotterySum - freeBalance - tixianSum
    var end1 = frozenBalance - tixianSum
    if (Math.abs(end)>0.001){
      console.log("******可用余额不等:" + customerId + "/" + trueName + ":" + Math.abs(end)+"******")
      
    }
    if (Math.abs(end1) > 0.001){
      console.log("******冻结金额不等:" + customerId + "/" + trueName + ":" + Math.abs(end1) + "******")
    }
      
    
  }
}