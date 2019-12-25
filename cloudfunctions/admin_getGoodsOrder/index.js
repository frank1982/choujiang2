// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'final-q8jvh'
  //env: 'test-asni1'
})
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  var $ = db.command.aggregate
  console.log(event)
  /*
  { goodsName: '',
  orderStatus: 'all',
  pageHeight: 10,
  pageNum: 0,
  userInfo: { appId: 'wx99e9fda6f3a6fa28' } }
  */
  var pageNum = event.pageNum
  var pageHeight = event.pageHeight
  var goodsName = event.goodsName
  var orderStatus = event.orderStatus

  if (goodsName == '' && orderStatus=='all'){

    console.log("goodsName == '' && orderStatus=='all'")
    const result = await db.collection('shiwuLotteryRecord')

      .aggregate()
      .sort({

        createTime: -1

      })
      .lookup({
        from: "shiwuGoods",
        localField: "goodsLotteryId",
        foreignField: "_id",
        as: "goodsList"
      })
      /*
      .replaceRoot({
        newRoot: $.mergeObjects([$.arrayElemAt(['$goodsList', 0]), '$$ROOT'])
      })
      .project({
        goodsList: 0
      })
      */
      .lookup({
        from: "customer",
        localField: "customerId",
        foreignField: "_id",
        as: "customersList"
      })
      /*
      .replaceRoot({
        newRoot: $.mergeObjects([$.arrayElemAt(['$customersList', 0]), '$$ROOT'])
      })
      .project({
        customersList: 0
      })
      */
      .skip(10*pageNum)
      .limit(10)
 
    .end()

    return result.list
  } else if (goodsName == ''){

    console.log("goodsName == '' && orderStatus!='all'")
    const result = await db.collection('shiwuLotteryRecord')

      .aggregate()
      .match({
        status: orderStatus
      })
      .sort({

        createTime: -1

      })
      .lookup({
        from: "shiwuGoods",
        localField: "goodsLotteryId",
        foreignField: "_id",
        as: "goodsList"
      })
      .lookup({
        from: "customer",
        localField: "customerId",
        foreignField: "_id",
        as: "customersList"
      })
      .skip(10 * pageNum)
      .limit(10)

      .end()
    return result.list

  } else if (orderStatus == 'all'){
    console.log("goodsName != '' && orderStatus=='all'")
    const result = await db.collection('shiwuLotteryRecord')

      .aggregate()
      /*
      .match({
        status: orderStatus
      })
      */
      .sort({

        createTime: -1

      })
      .lookup({
        from: "shiwuGoods",
        localField: "goodsLotteryId",
        foreignField: "_id",
        as: "goodsList"
      })
      .match({
        "goodsList.lotteryName": goodsName
      })
      .lookup({
        from: "customer",
        localField: "customerId",
        foreignField: "_id",
        as: "customersList"
      })
      .skip(10 * pageNum)
      .limit(10)

      .end()
    return result.list
  }else{
    const result = await db.collection('shiwuLotteryRecord')

      .aggregate()
      .match({
        status: orderStatus
      })
      .sort({

        createTime: -1

      })
      .lookup({
        from: "shiwuGoods",
        localField: "goodsLotteryId",
        foreignField: "_id",
        as: "goodsList"
      })
      .match({
        "goodsList.lotteryName": goodsName
      })
      .lookup({
        from: "customer",
        localField: "customerId",
        foreignField: "_id",
        as: "customersList"
      })
      .skip(10 * pageNum)
      .limit(10)

      .end()
    return result.list
  }
  /*
  
  const result= await db.collection('shiwuLotteryRecord')
  
    .aggregate()
    .lookup({
      from: "shiwuGoods",
      localField: "goodsLotteryId",
      foreignField: "_id",
      as: "goodsList"
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$goodsList', 0]), '$$ROOT'])
    })
    .project({
      goodsList: 0
    })
    
    .lookup({
      from: "customer",
      localField: "customerId",
      foreignField: "_id",
      as: "customersList"
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$customersList', 0]), '$$ROOT'])
    })
    .project({
      customersList: 0
    })
    .skip(10).limit(10)
    /*
    .sort({

      createTime: -1

    })
    */
    //.end()
    
    
  
}