// pages/index/myTicket.js
Page({

  /**
   * table shopGiftTicketRecord
   * targetCustomerID: targetCustomerId,
          targetOpenId: targetOpenId,
          sourceCustomerId: sourceCustomerId,
          giftTicketNum:1,
          createTime: dayStr + ' ' + detailTime,
   */
  data: {
    isAuthShow:false,
    isResultShow:false,
    sessionCode:'',
    customerId:'',
    targetRecords:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //检查是否新用户
    wx.cloud.callFunction({
      name: 'doCheckNewCustomer',  // 对应云函数名
      
      success: res => {
        console.log(res);
        
        if(res.result.code == 5555){
          //老用户
          //获取customerId
          wx.cloud.callFunction({
            name: 'getAccountInfo',  // 对应云函数名  
            success: res => {
              console.log(res);
              this.setData({
                customerId:res.result.customerId,
              })
              var that = this
              wx.cloud.callFunction({
                name: 'getMyGiftTicketRecord',  // 对应云函数名  
                data:{
                  customerId:that.data.customerId
                },
                success: res => {
                  console.log(res.result);
                  if(res.result.code = 9999){

                    var info = []
                    for(var i=0;i<res.result.records.length;i++){
                      var tmp = {}
                      if(res.result.records[i].targetCustomers[0].trueName == '' ||res.result.records[i].targetCustomers[0].trueName == null ){
                        tmp['name'] ="您成功邀请了 " + "*"+res.result.records[i].targetCustomers[0].mobile.substr(7,4)
                      }else{
                        tmp['name'] = "您成功邀请了 " +res.result.records[i].targetCustomers[0].trueName
                      }
                      tmp['ticketNum'] = res.result.records[i].giftTicketNum
                      info.push(tmp)
                    }
                    that.setData({
                      targetRecords:info
                    })
                    console.log(this.data.targetRecords)
                    
                  }
                },
                fail: err => {
                  console.log("获取客户信息失败")
                  console.error(err);
                }
              })
            },
            fail: err => {
              console.log("获取客户信息失败")
              console.error(err);
            }
          })
        }else{
          //新用户
          var that = this
          wx.login({//调用获取用户openId
            success: function (res) {
              console.log('login success！')
              console.log(res.code)
              that.setData({
                isAuthShow: true,
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
  go0:function(){
    wx.redirectTo({
      url:'shopDetail'
    })
  },
  go1:function(){

  },
  getPhoneNumber: function (e) {//这个事件同样需要拿到e
    console.log("sessionCode:")
    console.log(this.data.sessionCode)
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
      isAuthShow: false,
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
    return {
      title: "抽哆哆送金龙鱼大米菜籽油草鸡蛋现金红包",
      path:'/pages/index/invitedHome?customerId='+this.data.customerId,
      imageUrl:'../../images/share.png',
    }
  }
})