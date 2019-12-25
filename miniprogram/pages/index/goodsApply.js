// pages/index/goodsApply.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    goodsInfo:{},
    customerId:'',
    shiwuLotteryRecordId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)
    //{customerId: "fe42f4e05dcfab8e00c33df60f6bd611", goodsId: "BOWOksunQdvc4ir2hz4ntqLG5AwkoYCpaRAvGmUAujl7aWpe"}
    //shiwuLotteryRecordId: "7d44a38205dd3c9fc017208a832cdd4bd"
    var customerId = options.customerId
    //var customerId = "fe42f4e05dcfab8e00c33df60f6bd611"
    //var goodsId = "BOWOksunQdvc4ir2hz4ntqLG5AwkoYCpaRAvGmUAujl7aWpe"
    //var shiwuLotteryRecordId = "7d44a38205dd3c9fc017208a832cdd4bd"
    var goodsId = options.goodsId
    var shiwuLotteryRecordId = options.shiwuLotteryRecordId
    this.setData({
      customerId: customerId,
      shiwuLotteryRecordId: shiwuLotteryRecordId
    })

    wx.cloud.callFunction({
      name: 'getMyOneShiwuRecord',  // 对应云函数名
      data: {
        customerId: customerId,
        goodsId: goodsId,
        shiwuLotteryRecordId: shiwuLotteryRecordId
      },
      success: res => {
        console.log(res.result)
        var data = res.result
        var goodsInfo = {}
        goodsInfo['bonusTxt'] = "抽中 "+data.myPrizeName
        goodsInfo['price'] = data.price
        goodsInfo['coverImg'] = data.coverImg
        goodsInfo['sponsor'] = data.sponsor
        //goodsInfo['lotteryTime'] = data.lotteryTime
        var lotteryTime = data.lotteryTime
        var month = lotteryTime.substr(5, 2)
        if (month.indexOf("0") == 0) {
          month = month.substr(1, 2)
        }
        var day = lotteryTime.substr(8, 2)
        if (day.indexOf("0") == 0) {
          day = day.substr(1, 2)
        }
        var hour = lotteryTime.substr(11, 2)
        if (hour.indexOf("0") == 0) {
          hour = hour.substr(1, 2)
        }
        var minutes = lotteryTime.substr(14, 2)
        console.log("lotteryTime:" + lotteryTime)
        var weekday = this.weekDay(lotteryTime.substr(0, 10))
        goodsInfo['lotteryTime'] = month + "月" + day + "日" + ' (' + weekday + ') ' + hour + ':' + minutes + " 开奖"
        this.setData({
          goodsInfo: goodsInfo
        })
 
      },
      fail: err => {
        console.error(err);
      }
    })
  },
  weekDay: function weekDay(dateStr) {
    //var dt = new Date(dateStr.substr(0, 4), dateStr.substr(4, 2), dateStr.substr(6, 2));
    var dt = new Date(dateStr)
    var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekDay[dt.getDay()];
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  clickEnsureBtn:function(){

    console.log('click ensure btn')
    wx.navigateTo({
      url: '../index/ensureGoodsLotteryInfo?customerId=' + this.data.customerId + "&shiwuLotteryRecordId="+this.data.shiwuLotteryRecordId
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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