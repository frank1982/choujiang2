// pages/index/cashBag.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    freeBalance:"",
    totalInTixianAmount:"0",
    customerId:"",
    trueName:'',
    mobile:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)

    //查询提现中的提现金额
    this.setData({
      freeBalance:options.freeBlance,
      customerId:options.customerId,
      trueName:options.trueName,
      mobile:options.mobile,
    })
    
    wx.cloud.callFunction({
      name: 'getInTixianAmount',
      data:{
        customerId:this.data.customerId,
      },
      complete: res => {
        //console.log('callFunction test result: ', res)
        var data = res.result
        console.log(data)
        if (data.amount > 0 && data.customerId == this.data.customerId){
          this.setData({
            totalInTixianAmount: data.amount.toFixed(2)
          })
        }
        

      },
      fail: err => {
        // handle error
        console.log(err)
      },
    })

  },
  clickWxtixian:function(){

    console.log('微信提现')
    if (parseFloat(this.data.freeBalance) < 5) {
      wx.showToast({
        title: '需要满5元提现,每天坚持哦',
        icon: 'none'
      })
    } else if (parseFloat(this.data.totalInTixianAmount) > 0){
      wx.showToast({
        title: '当前有提现未处理完成',
        icon: 'none'
      })
    }else{

        wx.navigateTo({
          url: '../index/tixianEnsure?mobile=' + this.data.mobile + '&trueName=' + this.data.trueName + '&customerId=' + this.data.customerId,
        })
      
      
    }
    
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