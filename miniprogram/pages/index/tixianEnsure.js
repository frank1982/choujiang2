// pages/index/tixianEnsure.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trueName:'',
    mobileStr:'',
    customerId:'',
    inputName:'',
    pname:'',
    isShow:false,
    isInTixian:false,
  },
  okBtn:function(){
    wx.redirectTo({
      url: '../index/me',  //跳转页面的路径，可带参数 ？隔开， 
      success: function () { },        　　　//成功后的回调；
      fail: function () { },          　　　//失败后的回调；
      //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var trueName = options.trueName;
    var pname = trueName
    if (trueName == null || trueName == '' || trueName == 'undefined'){
      pname="请输入您的真实姓名"
    }
    var mobile = options.mobile
    var mobileStr = mobile.substring(0, 3) + ' ' + mobile.substring(3, 7) + ' ' + mobile.substring(7, 12)+'(不可改)'
 
    this.setData({
      trueName: trueName,
      mobileStr: mobileStr,
      customerId: options.customerId,
      pname: pname
    })
  },
  formName: function (e) {
    this.setData({
      inputName: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  clickEnsureBtn:function(){

    console.log('确认')
    console.log("输入的名字是:"+this.data.inputName)
    var inputName = this.data.inputName
    var newName = this.data.trueName
    if ((this.data.trueName.length == 0 || this.data.trueName == 'undefined')&& inputName.length == 0){
      wx.showToast({
        title: '为保证提现成功，请正确输入姓名',
        icon:'none',
      })
      return
      
    } else if (this.data.trueName.length > 0 && inputName.length == 0){
      console.log("名字未修改")
    } else if (this.data.trueName != inputName && inputName.length > 0){
      newName = inputName
    }
    console.log("上传的新名字是:"+newName)
    if (this.isChinese(newName)){
      console.log("全中文")
      wx.showLoading({
        title: '处理中...',
      })
      if(this.data.isInTixian == false){
        this.setData({
          isInTixian : true
        })
        wx.cloud.callFunction({
          name: 'doTixian',  // 对应云函数名
          data: {
            customerId: this.data.customerId,
            newName: newName
          },
          success: res => {
            wx.hideLoading()
            console.log("提现成功:")
            console.log(res.result);
            if (res.result.code == 8888){//成功
              console.log("成功:")
              this.setData({
                isShow:true,
                isInTixian:false,
              })
            }
          },
          fail: err => {
            console.error(err);
          }
        })
      }
      
    }else{
      console.log("不全是中文哦")
      wx.showToast({
        title: '为保证提现成功，请正确输入姓名',
        icon: 'none',
      })

    }
    /*else if (this.isChinese(truename)){
      
      console.log("全中文")
      
    console.log('微信提现')
    wx.showLoading({
      title: '处理中...',
    })
    }
    */
    /*
    wx.cloud.callFunction({
      name: 'doTixian',  // 对应云函数名
      data: {
        customerId:this.data.customerId,
        trueName: truename
      },
      success: res => {
        wx.hideLoading()
       
        console.log("成功:")
        console.log(res.result);
      },
      fail: err => {
        console.error(err);
      }
    })
    */
    
      
    

  },
  isChinese:function(temp) 
{
    var re = /[^\u4e00-\u9fa5]/;
    if(re.test(temp)) return false;
return true; 
},
  containsNumber:function(str) {
     var p = /[0-9a-z]/i;
     return p.test(str);
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