// pages/index/cashLotteryDetail.js
// 在页面中定义激励视频广告
//let videoAd = null
// 在页面中定义插屏广告
let interstitialAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleTxt:"",
    boxAniTxtList:[
      "?", "?", "?", "?","?"
    ],
    boxBtnSrc:"../../images/boxBtn0.png",
    boxBtnTxt:"试试运气，马上抽奖",
    boxAnimationTimer:'',
    cashLotteryId:'',
    status:1,
    isHide:false,
    isJoinedLottery:false,//是否已经中奖
    //canIUse: wx.canIUse('button.open-type.getUserInfo'),
    sessionCode:'',
    isLookedAd:false,
    isDoing:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)
    this.setData({
      titleTxt: "第" + (parseInt(options.no)+1)+"波",
      cashLotteryId:options.cashLotteryId,
      status: parseInt(options.status),
    })
    /*
    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-9ee36950d39bbab5'
      })
      videoAd.onLoad(() => {
        console.log("视频加载完毕")
       })
      videoAd.onError((err) => {
        console.log("视频加载错误")
        console.log(err)
       })
      videoAd.onClose((res) => { 
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发游戏奖励
          this.setData({
            isLookedAd: true,
          })
        } else {
          // 播放中途退出，不下发游戏奖励
          wx.showToast({
            title: '视频没有播放完哦',
            icon:'none',
            duration:2000
          })
        }
        
      })
    }
    */
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-bdbbec40c791f668'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

  },
  clickRule:function(){
    wx.navigateTo({
      url:'../index/cashLotteryRule'
    })
  },
  playAni:function(){

    var that = this;
    this.setData({
      boxAnimationTimer: setInterval(
        function () {
          for (var i = 0; i < 5; i++) {
            var random = Math.floor(Math.random() * 10);
            var l = that.data.boxAniTxtList
            l[i] = random
            that.setData({
              boxAniTxtList: l
            })
          }
        }
        , 50),
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
      isHide:false,
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
 
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  clickBoxBtn:function(e){

    console.log("clickBoxBtn") 
    if (this.data.isJoinedLottery){
      console.log("跳转中奖结果弹窗")
      this.setData({
        isJoinedLottery:false,
      })
      wx.navigateTo({
        url: '../index/cashLotteryResult?bonus=' + this.data.bonus,  //跳转页面的路径，可带参数 ？隔开， 
        success: function () { },        　　　//成功后的回调；
        fail: function () { },          　　　//失败后的回调；
        //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
      })
    }else{
      
      if(this.data.isDoing == false){

        this.setData({
          isDoing:true
        })
      wx.cloud.callFunction({
        name: 'doCashLottery',
        data: {
          cashLotteryId: this.data.cashLotteryId
        },
        complete: res => {

          var data = res.result
          console.log(data)

          if (data.code == 8888) {//抽奖完成

            this.playAni();
            var that = this
            var bonus = data.bonus + ""
            var bonusStr = "00" + data.bonus + ""
            bonusStr = bonusStr.replace(/\./g, '')
            if (bonusStr.length == 5) {
              bonusStr = bonusStr
            } else if (bonusStr.length == 4) {
              bonusStr = bonusStr + "0"
            } else if (bonusStr.length == 3) {
              bonusStr = bonusStr + "00"
            }

            setTimeout(function () {

              clearInterval(that.data.boxAnimationTimer)
              //显示奖金
              that.setData({
                boxAniTxtList: [
                  bonusStr[0], bonusStr[1], bonusStr[2], bonusStr[3], bonusStr[4]
                ],
                boxBtnSrc: "../../images/boxBtn1.png",
                boxBtnTxt: "恭喜您，中奖啦",
                isJoinedLottery: true,
                bonus: bonus,
              
              })
            }
              , 1000)


          } else if (data.code == 1005) {//该openID找不到，判断为新用户

            //准备获取手机号码
            var that = this
            wx.login({//调用获取用户openId
              success: function (res) {
                console.log('login success！')
                console.log(res.code)
                that.setData({
                  isHide: true,
                  sessionCode: res.code,
                  
                })
              },
              fail: function (res) {
                console.log('login失败！' + res.errMsg)
              }
            })
          }
          else {
            var title = ""
            switch (data.code) {
              case 1000:
                title = "本次抽奖已下架"
                break;
              case 1001:
                title = "本次抽奖已下架"
                break;
              case 1002:
                title = "本次抽奖未开放"
                break;
              case 1003:
                title = "本次抽奖已结束"
                break;
              case 1004:
                title = "本次抽奖已结束"
                break;
              case 1006:
                title = "今天已经抽过红包啦，明天再来吧"
                break;
              case 1007:
                title = "系统出了一点小问题，请稍后重试"
                break;
              case 1008:
                title = "系统出了一点小问题，请稍后重试"
                break;
              case 1009:
                title = "系统出了一点小问题，请稍后重试"
                break;
            }
            wx.showToast({
              title: title,
              icon: 'none',
              duration: 1500
            });
          }
          this.setData({
            isDoing:false,          
          })
        },
        fail: err => {

          console.log(err)
          this.setData({
            isDoing:false,          
          })
        },
      })
    }
         
    }
  }
  
})