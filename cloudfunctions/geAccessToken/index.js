const cloud = require('wx-server-sdk')
const rq = require('request-promise')
const APPID = 'wx99e9fda6f3a6fa28';
const APPSECRET = '2ce65bfde9f4197fdd173d087308c177';
const COLLNAME = 'publicField';
const FIELDNAME = 'ACCESS_TOKEN'
//appid = "wx99e9fda6f3a6fa28"
//secret = "2ce65bfde9f4197fdd173d087308c177"
cloud.init({
  env: 'final-q8jvh' 
  //env: 'test-asni1'
})
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    let res = await rq({
      method: 'GET',
      uri: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET,
    });
    res = JSON.parse(res)

    let resUpdate = await db.collection(COLLNAME).doc(FIELDNAME).update({
      data: {
        token: res.access_token
      }
    })
  } catch (e) {
    console.error(e)
  }
}
