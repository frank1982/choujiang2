// 云函数入口文件
/*
{
  "goodsId": "BOWOksunQdvc4ir2hz4ntqLG5AwkoYCpaRAvGmUAujl7aWpe",
  "prizeInfo": [
    {"prizeLevel":1,"customerId":"user1","trueName":"张三1","mobile":"111"},
    {"prizeLevel":2,"customerId":"user2","trueName":"张三2","mobile":"222"},
    {"prizeLevel":2,"customerId":"user3","trueName":"张三3","mobile":"333"},
    {"prizeLevel":3,"customerId":"user4","trueName":"张三4","mobile":"444"},
    {"prizeLevel":3,"customerId":"user5","trueName":"张三5","mobile":"555"},
    {"prizeLevel":3,"customerId":"user6","trueName":"张三6","mobile":"666"}
  ]
}

*/
const cloud = require('wx-server-sdk')
const templateMessage = require('templateMessage.js')

cloud.init({
  env: 'final-q8jvh'
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, content) => {
  const wxContext = cloud.getWXContext()

  /*
  let tokenRes = await db.collection('publicField').doc('ACCESS_TOKEN').get();
  let token = tokenRes.data.token; // access_token
  //测试模版发送


  let page = '../index/home';
  let msgData = {
    "keyword1": {
      "value": "测试一下"
    },
    "keyword2": {
      "value": "你参与的抽奖活动正在开奖，点击查看中奖名单"
    },
  };

  let openid = "oaH_25aouVBOcbXVrPzVJsKXcDSc";
  let formid = "61fe5c7d51b24faab0a81a58096fdb62";

  await templateMessage.sendTemplateMsg(token, 'aJao-CchbWyyJt1pi9uvBirSCllsnOwQdpWqw9WOOyw', msgData, openid, formid, page);
  */

  
  // 通过 event 对象获取参数 name
  console.log(event.goodsId)
  console.log(event.prizeInfo)

  var _goodsId = event.goodsId
  var _prizeInfo = event.prizeInfo
  if (_prizeInfo.length > 0 && _goodsId.length > 2){

    //有效性检查
    //检查goodsID是否存在
    var check0 = await db.collection('shiwuGoods').where({
      _id: _goodsId,
      status:3
    }).count()
    console.log(check0)
    if(check0.total == 1){
      
      //核对用户信息是否一致有效
      var isRight = true
      for (var i = 0; i < _prizeInfo.length;i++){

        console.log(_prizeInfo[i])
        var check1 = await db.collection('customer').where({

          _id: _prizeInfo[i].customerId,
          //trueName: _prizeInfo[i].trueName,
          mobile: _prizeInfo[i].mobile

        }).count()
        //console.log(check1.total)
        if (check1.total  ==  0){
          isRight = false
          console.log("该用户信息错误:"+ _prizeInfo[i].trueName)
          break
        }
        //customerId 在 实物抽奖记录中是否存在？
        var check2 = await db.collection('shiwuLotteryRecord').where({

          customerId: _prizeInfo[i].customerId,
          goodsLotteryId: _goodsId,
          status: 'ok',
          prizeLevel:-1,
          isNoticed:false

        }).count()
        console.log(check2.total)
        if (check2.total == 0) {
          isRight = false
          console.log("该用户不在对应抽奖记录里:" + _prizeInfo[i].trueName)
          break
        }
      }
      console.log(isRight)
      if (isRight){
        //更新goods信息
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
        var dayStr = year + "-" + month + "-" + date
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
        var detailTime = dayStr+' '+hours + ":" + minutes + ":" + seconds

        var updateGoods = await db.collection('shiwuGoods').doc(_goodsId)
        .update({
          data:{
            status:4,
            actureLotteryTime: detailTime
          }
        })
        
        console.log(updateGoods)//{ stats: { updated: 1 }, errMsg: 'document.update:ok' }'
        if (updateGoods.stats.updated == 1){
          
          console.log("更新实物商品数据状态成功")
          //继续更新实物抽奖订单状态

          var isUpdatedAll = true
          for (var i = 0; i < _prizeInfo.length; i++) {
            var prize = _prizeInfo[i]
            //console.log(prize)
            var update0 = await db.collection('shiwuLotteryRecord')
              .where({
                goodsLotteryId:_goodsId,
                customerId:prize.customerId,
                status:'ok',
                prizeLevel:-1,
                isNoticed:false
              })
              .update({
                data: {
                  status: "winned",
                  prizeLevel: prize.prizeLevel
                }
              })
            if (update0.stats.updated == 1) {

              console.log("更新 " + prize.trueName+" 成功")
              

            }else{
              console.log("更新 " + prize.trueName + " 失败")
              isUpdatedAll = false
              break
            }
          }

          console.log("开始发送模版消息")
          //var _goodsId = event.goodsId
          let tokenRes = await db.collection('publicField').doc('ACCESS_TOKEN').get();
          let token = tokenRes.data.token; // access_token
          //找出该goodId的所有实物抽奖订单

          if(isUpdatedAll){
            var check3 = await db.collection('shiwuLotteryRecord').where({

              goodsLotteryId: _goodsId,
              isNoticed: false

            }).get()
            console.log("该goodId的所有实物抽奖订单:")
            console.log(check3)

            for (var idx = 0; idx < check3.data.length;idx++){
              var record = check3.data[idx]
              var customerId = record.customerId
              var isPrized = false
              var prizeName = ''
              var openid = record.openId
              var formid = record.formId
              var shiwuLotteryRecordId = record._id

              for (var z = 0; z < _prizeInfo.length;z++){
                if (_prizeInfo[z].customerId == customerId){
                  isPrized = true
                  prizeName = _prizeInfo[z].prizeName
                  break
                }
              }

              console.log("formid:"+formid)
              console.log("openid:" + openid)
              var path = ''
              var str = ''
              if (isPrized){//已中奖
                path = 'pages/index/goodsApply?customerId=' + customerId + "&goodsId=" + _goodsId + "&shiwuLotteryRecordId=" + shiwuLotteryRecordId
                str = "恭喜您获得 " + prizeName
              }else{//未中奖
                path = 'pages/index/noGoodsApply?goodsId=' + _goodsId
                str = "开奖结果公布"
              }
   
              try {

               
                //测试模版发送
                var page = path;
                var msgData = {
                  "keyword1": {
                    "value": "抽哆哆"
                  },
                  "keyword2": {
                    "value": str
                  },
                  "keyword3": {
                    value: "感谢参与" // 答复内容
                  }
                };

                await templateMessage.sendTemplateMsg(token, 'aJao-CchbWyyJt1pi9uvBirSCllsnOwQdpWqw9WOOyw', msgData, openid, formid, page);
                /*
                const check4 = await db.collection('shiwuLotteryRecord').where({
                  _id: shiwuLotteryRecordId,

                }).update({
                  data:{
                    isNoticed: true
                  }
                })
                console.log("更新通知状态")
                console.log(check4)
                */
              
              } catch (err) {
                // 错误处理
                // err.errCode !== 0
                console.log(err)
                throw err
              }
            }
          }
        }else{
          console.log("更新实物商品数据状态失败")
        }

      }else{
        console.log("用户信息有错误")
      }

    }else{
      console.log("goodsId错误 或状态不为 3")
    }
    
  }else{
    console.log("输入参数错误")
  }
  
}