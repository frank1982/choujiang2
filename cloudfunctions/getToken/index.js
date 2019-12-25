// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')
const requestpromise = require('request-promise')
var WXBizDataCrypt = require('./RdWXBizDataCrypt') // 用于手机号解密


// 初始化 cloud
cloud.init({ 
  //env: 'final-q8jvh' 
  env:'test-asni1'
  })
const db = cloud.database()
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  console.log(event)
  //console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()
  const AccessToken_options = {
 
    method: 'GET',
 
    url: 'https://api.weixin.qq.com/sns/jscode2session',
 
    qs: {
      appid:wxContext.APPID,
 
      secret:'2ce65bfde9f4197fdd173d087308c177',  // 微信开发后台可生成，唯有微信认证过的国内主体才可有
 
      grant_type: 'authorization_code',
 
      js_code: event.sessionCode // 小程序中获取过来的
    },
    json: true
  };
  var result = {}
  const resultValue = await requestpromise(AccessToken_options);
  const pc = new WXBizDataCrypt(wxContext.APPID, resultValue.session_key)  // -解密第一步
  const data = pc.decryptData(event.encryptedData, event.iv)   // 解密第二步
  console.log(data)
  var mobile = data.phoneNumber
  console.log("mobile:"+mobile)
  if (mobile.length == 11){

    console.log("获取到正确的手机号码")
    //先检查手机号码是否已被占用
    var mobileCount = await db.collection("customer")//await 必须要加
      .where({ 'mobile': mobile })
      .count()
    console.log("mobileCount:")
    console.log(mobileCount)
    if (mobileCount.total == 0) {//手机号码不存在

      //创建新用户
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
      //console.log(detailTime)

      const createCustomer = await db.collection('customer').add({
        data: {

          freeBalance:0,
          frozenBalance:0,
          freeCoin:0,
          frozenCoin:0,
          mobile:mobile,
          regTime:dayStr+" "+detailTime,
          openIdList:[
            {
              openId:wxContext.OPENID,
            source:"miniprogram_laichoujiang"}
          ]
        }
      })

      console.log("创建新用户:")
      console.log(createCustomer)
      if (createCustomer._id == '') {
        result["code"] = 2002 //创建新用户失败
        return result
      }
      result["code"] = 9999
      return result

    }else{
      result["code"] = 2001//手机号码已存在
      return result
    }
  }else{
    result["code"] = 2000//获取手机号码失败
    return result
  }

  //console.log(resultValue)
  /*
  return {
    //event,
    //openid: wxContext.OPENID,
    //appid: wxContext.APPID,
    //unionid: wxContext.UNIONID,
    //env: wxContext.ENV,
    //resultValue:resultValue
  }
  */
}

