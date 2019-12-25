// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'final-q8jvh' 
  //env: 'test-asni1'
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  var result = {}

  //检查是否新用户
  var openId = wxContext.OPENID
  //console.log("openId:"+openId)
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  console.log("customer:")
  console.log(customers)
  //获取customerId

  if (customers.data.length == 0) {//没有找到，新用户

    //请求小程序补充授权手机号码
    result["code"] = 5001 //请求补充手机号码
    return result
  }else{
    result["code"] = 5555
    return result
  }
  
}
  /*
  //是否有可用的抽奖物资
  const checkShopGoods = await db.collection("shopGoods")//await 必须要加
    .where({ 'usable': 'on' })//['data.' + i + '.status']: 2,
    .get()
  console.log("checkShopGoods:")
  //console.log(checkShopGoods)
  if (checkShopGoods.length == 0) {

    result['code'] = 7000//无可用商品
    return result
  }
  //检查是否新用户
  //查找该用户手机号码是否已具备，是否是新用户？customer table
  var openId = wxContext.OPENID
  //console.log("openId:"+openId)
  var customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  console.log("customer:")
  //console.log(customers)
  //获取customerId

  if (customers.data.length == 0) {//没有找到，新用户

    //请求小程序补充授权手机号码
    result["code"] = 7001 //请求补充手机号码
    return result
  }
  var customerId = customers.data[0]._id
  //检查该用户是否有足够的票
  const ticketCheck = await db.collection("shopTickets")//await 必须要加
    .where({ 'customerId': customerId })
    .get()
  console.log("ticketCheck:")
  console.log(ticketCheck)
  //抽奖，扣减粮票，增加个人商品，并返回结果
  if (ticketCheck.data.length <= 0) {//没有该用户
    result["code"] = 7002 //没有该用户
    return result
  }
  if (ticketCheck.data[0].ticket <= 0) {//没有票
    result["code"] = 7003 //没有票
    return result
  }

  //下面开始抽奖
  //先看有没有中鸡蛋special
  var goodsType = ""
  var goodsNum = 0
  var r0 = Math.random() //0-1随机小数
  console.log("随机数:" + r0)
  if (r0 < 0.02) {
    console.log("中了鸡蛋")
    goodsType = "egg"
    goodsNum = 1
    const shopUpdate = await db.collection("shopTickets")//await 必须要加
      .where({ 'customerId': customerId })
      .update({
        data: {
          ticket: _.inc(-1),
          egg: _.inc(1),
        }
      })
    console.log(shopUpdate)
    if (shopUpdate.stats.updated != 1) {
      result["code"] = 7004 //更新物资数据失败
      return result
    }
    //{ stats: { updated: 1 }, errMsg: 'collection.update:ok' }
  } else {
    var r1 = Math.random() //0-1随机小数
    if (r1 <= 0.5) {//米

      var riceNum = parseFloat((5 + Math.random() * (15 - 5)).toFixed(2))
      riceNum = Math.floor(riceNum)
      goodsType = "rice"
      goodsNum = riceNum
      const shopUpdate1 = await db.collection("shopTickets")//await 必须要加
        .where({ 'customerId': customerId })
        .update({
          data: {
            ticket: _.inc(-1),
            rice: _.inc(riceNum),
          }
        })
      console.log(shopUpdate1)
      if (shopUpdate1.stats.updated != 1) {
        result["code"] = 7004 //更新物资数据失败
        return result
      }

    } else {//油

      var oilNum = parseFloat((10 + Math.random() * (20 - 10)).toFixed(2))
      oilNum = Math.floor(oilNum)
      goodsType = "oil"
      goodsNum = oilNum
      const shopUpdate2 = await db.collection("shopTickets")//await 必须要加
        .where({ 'customerId': customerId })
        .update({
          data: {
            ticket: _.inc(-1),
            oil: _.inc(oilNum),
          }
        })
      console.log(shopUpdate2)
      if (shopUpdate2.stats.updated != 1) {
        result["code"] = 7004 //更新物资数据失败
        return result
      }
    }
  }

  //创建商品抽奖记录
  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
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
  //创建商品抽奖订单
  const createNewOrder = await db.collection('shopLotteryRecord').add({
    //CUSTOMERID, randomBonus, CASHLOTTERYID, dayStr, dayStr + ' ' + detailTime
    data: {

      goodsType: goodsType,
      goodsNum: goodsNum,
      customerId: customerId,
      lotteryTime: dayStr + ' ' + detailTime,
    }
  })
  console.log("createNewOrder:")
  console.log(createNewOrder)
  //{ _id: 'dbff9fc75df2402b02acdd2c1e6863ac',errMsg: 'collection.add:ok'}
  if (createNewOrder.errMsg != 'collection.add:ok') {

    result["code"] = 7005 //创建商品抽奖记录失败
    return result
  } else {
    result["code"] = 7777 //成功
    result['goodsType'] = goodsType
    result['goodsNum'] = goodsNum
    return result
  }

  /*
  //查找该现金奖池的信息并进行检查
  var cashLotteryList = await db.collection("xianjinLotteryList")//await 必须要加
    .where({ 'data.cashLotteryId': CASHLOTTERYID })//['data.' + i + '.status']: 2,
    .get()
  //console.log("cashLotteryList:")
  //console.log(cashLotteryList)
  if (cashLotteryList.data.length > 0) {

    //result["code"] = 1001 //该奖池存在
    var list = cashLotteryList.data[0].data
    var cashLottery = {}
    var INDEX = -1
    for (var i = 0; i < list.length; i++) {
      if (list[i].cashLotteryId == CASHLOTTERYID) {
        cashLottery = list[i]
        INDEX = i
        break
      }
    }
    var MAXBONUS = cashLottery.maxBonus
    var MINBONUS = cashLottery.minBonus
    var LEFTMONEY = cashLottery.leftMoney
    var LEFTTICKET = cashLottery.leftTicket
    var STATUS = cashLottery.status

    if (cashLottery.usable != "on") {
      result["code"] = 1001 //该奖池不可用
      return result
    }
    if (cashLottery.status != 1) {
      result["code"] = 1002 //该奖池不在可抽奖状态
      return result
    }
    if (cashLottery.leftTicket < 1) {
      result["code"] = 1003 //该奖池人数达到限制
      return result
    }
    if (cashLottery.leftMoney <= cashLottery.maxBonus) {
      result["code"] = 1004 //该奖池剩余金额不足
      return result
    }

    //查找该用户手机号码是否已具备，是否是新用户？customer table
    var openId = wxContext.OPENID
    //console.log("openId:"+openId)
    var customers = await db.collection("customer")//await 必须要加
      .where({ 'openIdList.openId': openId })
      .get()
    //console.log("customer:")
    //console.log(customers)

    if (customers.data.length == 0) {//没有找到，新用户

      //请求小程序补充授权手机号码
      result["code"] = 1005 //请求补充手机号码
      return result

    } else {//找到，老用户,获取customerId

      //抽奖
      //判断该用户当天是否已经抽过现金红包
      //读取现金抽奖记录
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
      var detailTime = hours + ":" + minutes + ":" + seconds
      console.log(detailTime)

      var cashLotteryCount = await db.collection("xianjinLotteryRecord")//await 必须要加
        .where({ 'customerId': CUSTOMERID, 'lotteryDay': dayStr })
        .count()
      console.log("cashLotteryCount")
      console.log(cashLotteryCount)
      if (cashLotteryCount.total == 0) {

        var randomBonus = 0
        //进入抽奖程序
        var r0 = Math.random() * 100 //0-100随机小数
        console.log("r0:")
        console.log(r0)
        if (r0 >= 70) {
          randomBonus = (MAXBONUS + MINBONUS) / 2 + Math.random() * (MAXBONUS - (MAXBONUS + MINBONUS) / 2)
        } else {
          randomBonus = MINBONUS + Math.random() * ((MAXBONUS + MINBONUS) / 2 - MINBONUS)
        }
        //randomBonus = MINBONUS + Math.random() * (MAXBONUS - MINBONUS)
        //先扣减奖池金额!
        //舍弃多余的小数
        if (LEFTMONEY - randomBonus <= MAXBONUS || LEFTTICKET <= 1) {
          //奖池状态变更为 3
          STATUS = 3
        }
        console.log("随机金额:")
        console.log(randomBonus)
        randomBonus = Math.floor(randomBonus * 100) / 100

        console.log(typeof randomBonus);
        const _ = db.command

        const removeCashLottery = await db.collection("xianjinLotteryList")//await 必须要加
          .where({ 'data.cashLotteryId': CASHLOTTERYID })
          .update({
            data: {
              ['data.' + INDEX + '.leftMoney']: LEFTMONEY - randomBonus,
              ['data.' + INDEX + '.leftTicket']: _.inc(-1),
              ['data.' + INDEX + '.status']: STATUS
            }
          })
        console.log("扣减奖池余额:")
        console.log(removeCashLottery)
        //{ stats: { updated: 1 }, errMsg: 'collection.update:ok' }
        if (removeCashLottery.stats.updated != 1) {
          result["code"] = 1007 //扣减奖池余额错误
          return result
        }

        //创建现金抽奖订单
        const createCashLotteryOrder = await db.collection('xianjinLotteryRecord').add({
          //CUSTOMERID, randomBonus, CASHLOTTERYID, dayStr, dayStr + ' ' + detailTime
          data: {

            bonus: randomBonus,
            cashLotteryId: CASHLOTTERYID,
            customerId: CUSTOMERID,
            lotteryDay: dayStr,
            lotteryTime: dayStr + ' ' + detailTime,
          }
        })

        console.log("创建现金抽奖订单:")
        console.log(createCashLotteryOrder)
        //{ _id: '23db0a155dc94ecd05270090107d452f',errMsg: 'collection.add:ok'
        if (createCashLotteryOrder._id == '') {
          result["code"] = 1008 //创建现金抽奖订单错误
          return result
        }

        //增加用户账户余额
        const addCustomerBalance = await db.collection("customer")//await 必须要加
          .doc(CUSTOMERID)
          .update({
            data: {
              freeBalance: _.inc(randomBonus)
            }
          })

        console.log("增加用户账户余额:")
        console.log(addCustomerBalance)

        //{ stats: { updated: 1 }, errMsg: 'document.update:ok' }
        if (addCustomerBalance.stats.updated == 1) {

          result["code"] = 8888
          result["bonus"] = randomBonus
          return result
        } else {
          result["code"] = 1009//增加用户账户余额失败
          return result
        }

      } else {

        result["code"] = 1006 //该用户今天已抽过现金红包
        return result
      }


    }


  } else {
    result["code"] = 1000 //该奖池不存在
    return result
  }
  */


