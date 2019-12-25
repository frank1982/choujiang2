// 在页面中定义激励视频广告
let videoAd = null
let interstitialAd = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:false,
    isLoadingShow:false,
    myTicket:0,
    isTicketAlertShow:false,
    ticketTitle:"",
    isResultShow:false,
    resultInfo: {},
    isDoing:false,
    /*
    resultInfo:{
      "resultImg":"../../images/riceIcon.png",
      "resultTxt":"恭喜拿到大米",
      "resultTxt1":"50 克",
    }
    */

  },
  clickLook:function(){

    console.log("click look video")
     
    // 用户触发广告后，显示激励视频广告
    //检查是否超过次数要求
    wx.cloud.callFunction({
      name: 'doCheckTicketToday',  // 对应云函数名
      success: res => {
        console.log(res);
        if(res.result.code  == 9001){//超过限制了
          this.setData({
            ticketTitle:"观看次数用完了 明天再来哦"
          })
        }else{//没有超过
          if (videoAd) {
            videoAd.show().catch(() => {
              // 失败重试
              videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败')
                  console.log(err)
                })
            })
          }
        }

      },
      fail: err => {
        console.error(err);
      }
    })

    /*
    
    */
    //this.addTicket()
  },
  clickGetTicket:function(){
    console.log("点击拿粮票")
    //检查是否新用户?
    wx.cloud.callFunction({
      name: 'doCheckNewCustomer',  // 对应云函数名
      success: res => {
        console.log(res);
        if(res.result.code == 5555){
          //老用户
          this.setData({
            isTicketAlertShow: true,
            ticketTitle: "免费拿粮票",
          })
        }else{
          //新用户
          var that = this
          wx.login({//调用获取用户openId
            success: function (res) {
              console.log('login success！')
              console.log(res.code)
              that.setData({
                isShow: true,
                sessionCode: res.code,
              })
            },
            fail: function (res) {
              console.log('login失败！' + res.errMsg)
            }
          })
        }
      },
      fail: err => {
        console.error(err);
      }
    })

  },
  clickResultBtn:function(){
    wx.cloud.callFunction({
      name: 'getMyTicket',  // 对应云函数名
      success: res => {
        console.log(res);
        this.setData({
          myTicket: res.result.ticketNum
        })
      },
      fail: err => {
        console.error(err);
      }
    })
    this.setData({
      isResultShow: false,
    })
    
  },
  clickBtn:function(){

    console.log("click btn")
    
  },
  closeTicketAlert:function(){
    this.setData({
      isTicketAlertShow:false,
      ticketTitle:"",
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  getPhoneNumber: function (e) {//这个事件同样需要拿到e

    console.log("get phone number")
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        content: '必须要使用手机号发奖哦',
        showCancel: false
      })
      return;
    }
    this.setData({
      isShow: false,
    })
    wx.showLoading({
      title: '请稍候...',
    })
    wx.cloud.callFunction({
      name: 'getToken',  // 对应云函数名
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        sessionCode: this.data.sessionCode    // 这个通过wx.login获取，去了解一下就知道。这不多描述
      },
      success: res => {
        wx.hideLoading()
        // 成功拿到手机号，跳转首页
        console.log("成功:")
        console.log(res.result.code);
      },
      fail: err => {
        console.error(err);
        wx.showToast({
          title: '获取手机号失败',
          icon: 'none'
        })
      }
    })
  },
  addTicket:function(){
    console.log("add ticket function")
    wx.cloud.callFunction({
      name: 'doTakeTicket',  // 对应云函数名
      success: res => {
        console.log(res);
        if(res.result.code == 6666){
          this.setData({
            ticketTitle:"成功抢到1张新粮票",
          })
          /*
             // 在适合的场景显示插屏广告
if (interstitialAd) {
  interstitialAd.show().catch((err) => {
    console.error(err)
  })
}
*/
          //更新粮票数量
          var that = this
          wx.cloud.callFunction({
            name: 'getMyTicket',  // 对应云函数名
            success: res => {
              console.log(res);
              that.setData({
                myTicket: res.result.ticketNum
              })
            },
            fail: err => {
              console.error(err);
            }
          })
        }
        wx.hideLoading();
      },
      fail: err => {
        console.error(err);
      }
    })
  },
  onLoad: function (options) {

    // 在页面onLoad回调事件中创建插屏广告实例
if (wx.createInterstitialAd) {
  interstitialAd = wx.createInterstitialAd({
    adUnitId: 'adunit-d17afa265f4ec847'
  })
  interstitialAd.onLoad(() => {})
  interstitialAd.onError((err) => {})
  interstitialAd.onClose(() => {})
}


    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-edcb6bdec223c538'
      })
      videoAd.onLoad(() => { 
        console.log("激励视频拉取成功")
      })
      videoAd.onError((err) => {
        console.log("激励视频拉取失败")
        console.log(err)
       })
      videoAd.onClose((res) => {
        console.log("激励视频关闭")
        // 用户点击了【关闭广告】按钮

        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          wx.showLoading({
            title: '请稍候...',
          })
          console.log("播放完毕可以领取奖励")
          //增加粮票
          this.addTicket()
          
        } else {
          // 播放中途退出，不下发游戏奖励
        }
       })
    }
    
  },
  clickBtn:function(){
    console.log("click btn")
    // 在适合的场景显示插屏广告
if (interstitialAd) {
  interstitialAd.show().catch((err) => {
    console.error(err)
  })
}
    if(this.data.isDoing == false){
      //获取实物中奖记录
      this.setData({
        isDoing:true,
      })
    wx.showLoading({
      title: '抽奖进行中',
    })
   
    wx.cloud.callFunction({
      name: 'doShopLottery',  // 对应云函数名
      success: res => {
        console.log(res)
        wx.hideLoading()
        
        if(res.result.code == 7001){//请求手机号码
          var that = this
            wx.login ({//调用获取用户openId
              success: function (res) {
                console.log('login success！')
                console.log(res.code)
                that.setData({
                  isShow: true,
                  sessionCode: res.code,
                })
              },
              fail: function (res) {
                console.log('login失败！' + res.errMsg)
              }
            })
         
        } else if (res.result.code == 7002 || res.result.code == 7003){

          //票不足
          this.setData({
            isTicketAlertShow:true,
            ticketTitle:'粮票不够啦'
          })

        } else if (res.result.code == 7777){//成功

          var info = {}
          //{code: 7777, goodsType: "oil", goodsNum: 14.27}
          if (res.result.goodsType == "rice"){

            info["resultTxt"] = "恭喜拿到大米"
            info["resultTxt1"] = res.result.goodsNum + " 克"
          } else if (res.result.goodsType == "oil"){
            info["resultTxt"] = "恭喜拿到食用油"
            info["resultTxt1"] = res.result.goodsNum + " 毫升"

          } else if (res.result.goodsType == "egg"){
            info["resultTxt"] = "恭喜拿到鸡蛋"
            info["resultTxt1"] = "1 个"

          }
          info['resultImg'] = "../../images/" + res.result.goodsType +"Icon.png"
          
          this.setData({
            isResultShow:true,
            resultInfo:info,
          })
        }else{
          
        }
        this.setData({
          isDoing:false,
        })
      },
      fail: err => {
        console.error(err);
      }
    })
    }
    
  },
  clickMyShopBtn:function(){
    /*
    wx.navigateTo({
      url:'myShopGoods',
    })
    */
   wx.redirectTo({
    url: 'myShopGoods',  //跳转页面的路径，可带参数 ？隔开， 
    success: function () { },        　　　//成功后的回调；
    fail: function () { },          　　　//失败后的回调；
    //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
  })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    wx.cloud.callFunction({
      name: 'getMyTicket',  // 对应云函数名
      success: res => {
        console.log(res);
        this.setData({
          myTicket:res.result.ticketNum
        })
      },
      fail: err => {
        console.error(err);
      }
    })

    // 在适合的场景显示插屏广告
if (interstitialAd) {
  interstitialAd.show().catch((err) => {
    console.error(err)
  })
}
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})