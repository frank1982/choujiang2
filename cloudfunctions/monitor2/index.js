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
  const $ = db.command.aggregate

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
  console.log("今天的日期是:"+dayStr)

      
  var todayTicketCount = await db.collection("shopTakeTicketRecord")//await 必须要加
    .where({ 
       lotteryTime: db.RegExp({
        regexp: dayStr,
        options: 'i',
      })
    })
    .count()

  console.log("今天累计发放粮票:"+todayTicketCount.total)


  var todayTicketTotal = await db.collection("shopTakeTicketRecord")//await 必须要加
  .count()

console.log("累计发放粮票:"+todayTicketTotal.total)

  //消耗多少张粮票
  const usedTicket = await db.collection('shopLotteryRecord')
  .where({ 
    lotteryTime: db.RegExp({
     regexp: dayStr,
     options: 'i',
   })
 })
 .count()

 console.log("今天累计消耗粮票:"+usedTicket.total)

 const usedTicketTotal = await db.collection('shopLotteryRecord')
.count()

console.log("累计消耗粮票:"+usedTicketTotal.total)

 const peopleNums = await db.collection('shopLotteryRecord')
  .aggregate()
  .match({
    lotteryTime: db.RegExp({
      regexp: dayStr,
      options: 'i',
    })
  })
  .group({
    _id: null,
    people: $.addToSet('$customerId')
  })
  .end()

  console.log("使用粮票的人数去重:")
  console.log(peopleNums.list[0].people.length)

  const peopleNums4 = await db.collection('shopLotteryRecord')
  .aggregate()
  .group({
    _id: null,
    people: $.addToSet('$customerId')
  })
  .end()

  console.log("累计使用粮票的人数去重:")
  console.log(peopleNums4.list[0].people.length)

  const peopleNums2 = await db.collection('shopTakeTicketRecord')
  .aggregate()
  .match({
    lotteryTime: db.RegExp({
      regexp: dayStr,
      options: 'i',
    })
  })
  .group({
    _id: null,
    people: $.addToSet('$customerId')
  })
  .end()

  console.log("获取粮票的人数去重:")
  console.log(peopleNums2.list[0].people.length)

  const peopleNums3 = await db.collection('shopTakeTicketRecord')
  .aggregate()
  .group({
    _id: null,
    people: $.addToSet('$customerId')
  })
  .end()

  console.log("累计获取粮票的人数去重:")
  console.log(peopleNums3.list[0].people.length)

  
  const createMonitor0 = await db.collection('monitor2').add({

    data: {
  
      today:dayStr,
      todayTicketSended:todayTicketCount.total,
      todayTicketUsed:usedTicket.total,
      todayPeopleGetTicket:peopleNums2.list[0].people.length,
      todayPeopleUseTicket:peopleNums.list[0].people.length,
      totalPeopleGetTicket:peopleNums3.list[0].people.length,
      totalPeopleUseTicket:peopleNums4.list[0].people.length,
      totalSendTicket:todayTicketTotal.total,
      totalUseTicket:usedTicketTotal.total,
      createTime: new Date(Date.now())
    }
  })
  
}