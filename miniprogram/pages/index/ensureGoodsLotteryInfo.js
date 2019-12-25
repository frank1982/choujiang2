// pages/index/ensureGoodsLotteryInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:false,
    pname:'',
    paddress:'',
    mobileStr:'',
    trueName:'',
    mobile:'',
    address:'',
    inputName:'',
    inputAddress:'',
    customerId:'',
    shiwuLotteryRecordId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //customerId + "&shiwuLotteryRecordId
    var customerId = options.customerId
    console.log("传进来的customerId:" + customerId)
    var shiwuLotteryRecordId = options.shiwuLotteryRecordId
    this.setData({
      customerId: customerId,
      shiwuLotteryRecordId: shiwuLotteryRecordId
    })
    wx.cloud.callFunction({
      name: 'getAccountInfo',  // 对应云函数名
      success: res => {
        console.log(res.result);
        if (res.result.code == 7777) {

          console.log(res.result)
          var trueName = res.result.trueName
          var mobile = res.result.mobile
          var address = res.result.address
          this.setData({
            trueName : trueName,
            mobile : mobile,
            address : address
          })

          if (trueName == '' || trueName == 'undefined' || trueName==null){
            trueName = "请输入您的真实姓名"
          }
          var mobileStr = mobile.substring(0, 3) + ' ' + mobile.substring(3, 7) + ' ' + mobile.substring(7, 12) + '(不可改)'
          if (address == '' || address == 'undefined' || address == null) {
            address = "请输入您的收货地址，我们将免费寄出"
          }

          this.setData({
            pname: trueName,
            paddress: address,
            mobileStr: mobileStr
          })
        }
      },
      fail: err => {
        console.error(err);
      }
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
  inputName:function(e){
    this.setData({
      inputName:e.detail.value
    })
  },
  inputAddress: function (e) {
    this.setData({
      inputAddress: e.detail.value
    })
  },
  clickEnsureBtn:function(){

   
    
    console.log("clickEnsureBtn")
    //检查内容
    var inputName = this.data.inputName
    var inputAddress = this.data.inputAddress
    console.log("输入的名字是:"+inputName)
    console.log("输入的地址是:" + inputAddress)
    if (inputName == ''){
      if (this.data.trueName == "" || this.data.trueName == "undefined" || this.data.trueName==null){
        wx.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        })
        return
      }
      
      
    } 
    if (inputAddress == '' || inputAddress.length<=6){
      if (this.data.address == "" || this.data.address == "undefined" || this.data.address == null) {
        wx.showToast({
          title: '请输入完整的收货地址',
          icon: 'none'
        })
        return
      }
    } 
    if (this.isAllChinese(inputName)==false){
      wx.showToast({
        title: '请输入正确的姓名',
        icon: 'none'
      })
      return
    }  
  
    //修改个人信息
    //修改订单状态
    var sname = ""
    var sAddress = ''
    if(inputName == ''){
      sname = this.data.trueName
    }else{
      sname = inputName
    }
    if(inputAddress == ''){
      sAddress = this.data.address
    }else{
      sAddress = inputAddress
    }
    wx.showLoading({
      title: '请稍候',
    })
      var that = this
      wx.cloud.callFunction({
    name: 'doGoodsWanted',  // 对应云函数名
    data: {
      customerId: this.data.customerId,
      shiwuLotteryRecordId: this.data.shiwuLotteryRecordId,
      trueName: sname,
      address: sAddress
    },
    success: res => {
      console.log(res.result);
      wx.hideLoading()
      if (res.result.code = 6666){
        that.setData({
          isShow: true,
        })
      }
      
    },
    fail: err => {
      console.error(err);
    }
  })
  
  },
  isAllChinese: function (temp) {
    var re = /[^\u4e00-\u9fa5]/;
    if (re.test(temp)) return false;
    return true;
  },
  okBtn:function(){
    wx.redirectTo({
      url:'../index/me'
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

  }
})