// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  //env: 'final-q8jvh'
  env: 'test-asni1'
})
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  //console.log("mydDate:" + myDate)
  const goods = await db.collection("shiwuGoods")//await 必须要加
    .where({
      usable: "on",
      status: _.in([0,1,2,3])//2 过期 3等待开奖
    })
    .get()
  //console.log("goods:")
  //console.log(goods.data)
  if (goods.data.length > 0){

    for (var i=0; i < goods.data.length;i++){//主循环

      var good = goods.data[i]
      var id = good._id
      var startTime = new Date(good.startTime)
      var closeTime = new Date(good.closeTime)
      var lotteryTime = new Date(good.lotteryTime)
      var status = good.status
      var name=good.lotteryName
      //var minOpenPeople=good.minOpenPeople
      var price = good.price
      if (status == 0 && myDate >= startTime){
        //status->1
        const any = await db.collection("shiwuGoods")
          .doc(id)
          .update({

            data: {
              status: 1,
            }
          })
        console.log(name + " status:0->1")
      }else if (status == 1 && myDate >= closeTime){
        //status->2
        const dosome = await db.collection("shiwuGoods")
          .doc(id)
          .update({

            data: {
              status: 2,
            }
          })
          console.log(name+" status:1->2")
      } else if (status == 2 && myDate >= lotteryTime){
        //status->3
        const dosome = await db.collection("shiwuGoods")
          .doc(id)
          .update({

            data: {
              status: 3,
            }
          })
        console.log(name + " status:2->3")
        
      } else if (status == 3){
        
        //去开奖

      }
    }
  }
}
        //去开奖
        /*
        var priceNum = 0
        for(var i=0;i<price.length;i++){
          priceNum += price[i].amount
        }
        console.log("将开奖的信息如下:")
        console.log(name)
        //console.log(price)
        console.log("总奖品数:" + priceNum)
        console.log("最低开奖人数:"+minOpenPeople)
        //判断有没有达到最低人数要求
        const recordsCount = await db.collection('shiwuLotteryRecord')
          .where({
            goodsLotteryId: id,
            status:'ok'
          })
          .count()
        //console.log(recordsCount)
        if (recordsCount.total >= minOpenPeople && recordsCount.total >= priceNum && priceNum <= 20){

          console.log("达到最低人数要求继续开奖")
          var price1num = price[0].amount
          var price2num = 0
          var price3num = 0
          if(price.length == 2){
            price2num = price[1].amount
          } else if (price.length == 3){
            price2num = price[1].amount
            price3num = price[2].amount
          }
          console.log("一等奖数量:" + price1num)
          console.log("二等奖数量:" + price2num)
          console.log("三等奖数量:" + price3num)

          //开奖
          try{
            const samples = await db.collection("shiwuLotteryRecord")//await 必须要加
              .aggregate()
              .match({
                goodsLotteryId: id,
                status: 'ok'
              })
              .sample({ size: priceNum })
              .end()
            console.log(samples)
            var winner = samples.list //[]
            var winnerLevel1 = winner.slice(0, price1num)
            var winnerLevel2 = winner.slice(price1num, price1num + price2num)
            var winnerLevel3 = winner.slice(price1num + price2num, priceNum)
            //console.log(winnerLevel1)
            //console.log(winnerLevel2)
            //console.log(winnerLevel3)
            
          }catch(e){
            console.log(e)
          }
          
          //核对开奖结果

          //status3->4
          const dosome = await db.collection("shiwuGoods")
            .doc(id)
            .update({

              data: {
                status: 4,
              }
            })
          console.log(name + " status:3->4")

        }else{
          console.log("没有达到最低人数或奖品总数要求放弃开奖")
          //status3->5
          const dosome = await db.collection("shiwuGoods")
            .doc(id)
            .update({

              data: {
                status: 5,
              }
            })
          console.log(name + " status:3->5")
        }
        
      */  
