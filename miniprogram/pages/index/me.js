// pages/index/me.js
// 在页面中定义插屏广告
let interstitialAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {

    headImgSrc:"../../images/head.png",
    freeBalance:0,
    freeCoin:0,
    isHide:false,
    mobile:'',
    trueName:'',
    customerId:'',
    nameShow:'',
    shiwuLotteryWinnedList:[],
    myShiwuLotteryInfo:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //进行校验
    /*
    //分析进入的路径
    var pages = getCurrentPages()
    var prevPage = pages[pages.length - 2].route;
    console.log(prevPage)
    //pages/index/cashLotteryDetail
    if (prevPage != "pages/index/cashLotteryResult"){
      //不是从中奖结果页面来的
    }
    */
    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-7ab0065eaba5ff49'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

    wx.cloud.callFunction({
      name: 'getAccountInfo',  // 对应云函数名
      success: res => {
        console.log(res.result);
        if (res.result.code == 7777){
          var nameShow = ''
          if (res.result.trueName != 'undefined' && res.result.trueName != null && res.result.trueName != ''){
            nameShow = res.result.trueName
          }else{
            nameShow = "*"+res.result.mobile.substring(7,11)
          }
          console.log("nameShow:"+nameShow)
          this.setData({
            freeBalance: res.result.freeBalance,
            freeCoin:res.result.freeCoin,
            customerId: res.result.customerId,
            mobile: res.result.mobile,
            trueName:res.result.trueName,
            nameShow: nameShow,
          })

          //获取实物中奖记录
          wx.cloud.callFunction({
            name: 'getMyShiwuRecord',  // 对应云函数名
            data:{
              customerId: res.result.customerId
            },
            success: res => {
              console.log(res.result)
             
            },
            fail: err => {
              console.error(err);
            }
          })
        } else if (res.result.code == 3000){//新用户
          console.log("新用户")
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
       
      },
      fail: err => {
        console.error(err);
      }
    })
    
  },
  clickContact:function(){
    wx.navigateTo({
      url: '../index/contact',
    })
  },
  clickMyGoods:function(e){

    var info = e.currentTarget.dataset.bean
    //console.log(e.currentTarget.dataset.bean)
    //判断状态
    if (info.status == 'wanted'){
      wx.showToast({
        title: '您中奖的物品已经在准备中啦，请耐心等候',
        icon: 'none'
      })
    } else if (info.status == 'gived'){
      wx.showToast({
        title: '您中奖的物品已经兑奖完毕啦',
        icon: 'none'
      })
    } else if (info.status == 'winned') {
      //跳转申请领奖页面
      var goodsId = info.goodsId
      wx.navigateTo({
        url: '../index/goodsApply?customerId=' + this.data.customerId + "&goodsId=" + goodsId + "&shiwuLotteryRecordId="+info.shiwuLotteryRecordId,
      })
    }
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
      isHide: false,
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  clickHelp:function(){
    console.log('help')
    wx.navigateTo({
      url: '../index/help',
    })
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
    
    wx.reLaunch({
       url: '../index/home'
    })
    
    /*
    wx.redirectTo({
      url: '../index/home'
    })
    */
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  clickCashBag: function () {

    console.log("click cashbag")
    wx.navigateTo({
      url: '../index/cashBag?freeBlance='+this.data.freeBalance+"&customerId="+this.data.customerId+'&mobile='+this.data.mobile+"&trueName="+this.data.trueName,  //跳转页面的路径，可带参数 ？隔开， 
      success: function () { },        　　　//成功后的回调；
      fail: function () { },          　　　//失败后的回调；
      //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
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
 
})