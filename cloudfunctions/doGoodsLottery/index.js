// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {
    //env: 'final-q8jvh'
    env: 'test-asni1'
  }
)
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

  /*
  const wxContext = cloud.getWXContext()
  var FORMID = event.formId
  var GOODSLOTTERYID = event.goodsLottertId
  console.log("GOODSLOTTERYID:" + GOODSLOTTERYID)
  const goodsLotteryList = await db.collection("shiwuGoods")//await 必须要加
    .where({
      _id: GOODSLOTTERYID,
      usable:'on',
      status:1
    })
    .get()
  console.log("goodsLotteryList:")
  console.log(goodsLotteryList)
  */

  
  var myDate = new Date(Date.now() + (8 * 60 * 60 * 1000))
  console.log("mydDate:" + myDate)
  const wxContext = cloud.getWXContext()
  var FORMID=event.formId
  var GOODSLOTTERYID=event.goodsLottertId
  console.log("GOODSLOTTERYID:" + GOODSLOTTERYID)
  var result = {}
  //查找该现金奖池的信息并进行检查
  const goodsLotteryList = await db.collection("shiwuGoods")//await 必须要加
    .where({ 
      _id: GOODSLOTTERYID,
      //usable:'on',
      //status:1

    })//['data.' + i + '.status']: 2,
    .get()
  console.log("goodsLotteryList:")
  console.log(goodsLotteryList)
  if (goodsLotteryList.data.length == 0){
    result['code']=5000//状态不为1 或 usable != on
    return result
  }
  //status 判断 5005
  var status = goodsLotteryList.data[0].status
  if (status == 0){//未开始
    result['code'] = 5005
    return result
  }

  //检查是否已到期
  var closeTime = new Date(goodsLotteryList.data[0].closeTime)
  //console.log("startTime:" + startTime)

  if (myDate >= closeTime) {//已过期
    console.log("myDate >= closeTime")
    result['code'] = 5002//已过期
    return result
  }


  //查找该用户手机号码是否已具备，是否是新用户？customer table
  var openId = wxContext.OPENID
  console.log("openId:"+openId)
  const customers = await db.collection("customer")//await 必须要加
    .where({ 'openIdList.openId': openId })
    .get()
  console.log("customer:")
  console.log(customers)
  if (customers.data.length == 0){
    result['code'] = 5001//用户不存在，需要创建
    return result
  }
  var CUSTOMERID = customers.data[0]._id
  //判断该用户是否已经抽过该奖
  const lotteryCount = await db.collection("shiwuLotteryRecord")//await 必须要加
    .where({ 'customerId': CUSTOMERID, 'goodsLotteryId': GOODSLOTTERYID})
    .count()
  console.log("lotteryCount")
  console.log(lotteryCount)
  if (lotteryCount.total == 0) {

    var nowDate = new Date(Date.now())
    console.log("nowDate:" + nowDate)
    //创建实物抽奖订单
    const createGoodsLotteryOrder = await db.collection('shiwuLotteryRecord').add({
      //CUSTOMERID, randomBonus, CASHLOTTERYID, dayStr, dayStr + ' ' + detailTime
      data: {

        formId: FORMID,
        goodsLotteryId: GOODSLOTTERYID,
        customerId: CUSTOMERID,
        createTime: nowDate,
        openId: openId,
        status:'ok',   //winned -> apply ->gived
        prizeLevel:-1, //if status = winned 1,2,3
        isNoticed:false,
      }
    })

    console.log("createGoodsLotteryOrder:")
    console.log(createGoodsLotteryOrder)
    if (createGoodsLotteryOrder._id == ''){
      result['code'] = 5004//创建失败
      return result
    }else{
      result['code'] = 5555
      return result
    }

  }else{
    //已经抽过该奖品
    result['code'] = 5003//已抽过该奖品
    return result
  }
  
}