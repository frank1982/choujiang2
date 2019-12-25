// pages/index/goodsApply.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    goodsInfo: {},
    goodsId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)
    
    //var goodsId = "BOWOksunQdvc4ir2hz4ntqLG5AwkoYCpaRAvGmUAujl7aWpe"
    var goodsId = options.goodsId
    this.setData({
      goodsId: goodsId
    })

    wx.cloud.callFunction({
      name: 'getNoBonusGoodsDetail',  // 对应云函数名
      data: {
       
        goodsId: goodsId,
       
      },
      success: res => {
        console.log(res.result)
        var data = res.result.result
        console.log(data)
        var goodsInfo = {}
        goodsInfo['bonusTxt'] = "抽中 " + data.myPrizeName
        goodsInfo['price'] = data.price
        goodsInfo['coverImg'] = data.coverImg
        goodsInfo['sponsor'] = data.sponsor
        //goodsInfo['lotteryTime'] = data.lotteryTime
        var lotteryTime = data.lotteryTime
        console.log(lotteryTime)
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
    var dt = new Date(dateStr);
    var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekDay[dt.getDay()];
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  clickEnsureBtn: function () {

    wx.redirectTo({
      url: '../index/home',
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