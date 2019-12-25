// pages/index/goodsDetail.js
// 在页面中定义插屏广告

//let videoAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:{},
    detailImgList:[],
    isHide: false,
    sessionCode: '',
    isShow:false,
    isLookedAd:false,
  },
  okBtn: function () {
    wx.redirectTo({
      url: '../index/home',  //跳转页面的路径，可带参数 ？隔开， 
      success: function () { },        　　　//成功后的回调；
      fail: function () { },          　　　//失败后的回调；
      //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
    })
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)
    console.log("load goods detail")
    wx.cloud.callFunction({
      name: 'getGoodsDetail',
      data:{
        goodsId: options.goodsId,
      },
      complete: res => {
        console.log(res.result.result)
        var data = res.result.result
        wx.setNavigationBarTitle({
          title: res.result.result.lotteryName
        })
        var detail = {}
        detail["_id"] = data._id
        detail["sponsor"] = data.sponsor
        detail["coverImg"] = data.coverImg
        detail["detailSummary"] = data.detailSummary
        detail["status"] = data.status
        //detail['detailImgList'] = data.detailImgList
        var lotteryTime = data.lotteryTime
        var startTime = data.startTime
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
        //var weekday = this.weekDay(lotteryTime.substr(0, 4))
        console.log("lotteryTime:" + lotteryTime)
        //var weekday = this.weekDay(lotteryTime)
        var weekday = this.weekDay(lotteryTime.substr(0, 10))
        //status 0,1
        if (data.status == 0){

          console.log("startTime:" + startTime)
          var year2 = startTime.substr(0, 4)
          var month2 = startTime.substr(5, 2)
          if (month2.indexOf("0") == 0) {
            month2 = month.substr(1, 2)
          }
          var day2 = startTime.substr(8, 2)
          if (day2.indexOf("0") == 0) {
            day2 = day2.substr(1, 2)
          }
          var hour2 = startTime.substr(11, 2)
          if (hour2.indexOf("0") == 0) {
            hour2 = hour2.substr(1, 2)
          }
          var minutes2 = startTime.substr(14, 2)
          var weekday2 = this.weekDay(startTime.substr(0, 10))
          detail['lotteryTime'] = "即将开始 " + ' (' + month2 + "月" + day2 + "日 " + hour2 + ':' + minutes2 + " " + weekday2 + ') ' 

          
        }else if(data.status == 1){
          detail['lotteryTime'] = month + "月" + day + "日" + ' (' + weekday + ') ' + hour + ':' + minutes + " 开奖"
        }
       
        var price = []
        for (var j = 0; j < data.price.length; j++) {
          var priceStr = ""
          
          if (data.price[j].priceLevel == 1) {
            priceStr = "一等奖: " + data.price[j].priceName + " *" + data.price[j].amount
          } else if (data.price[j].priceLevel == 2) {
            priceStr = "二等奖: " + data.price[j].priceName + " *" + data.price[j].amount
          } else if (data.price[j].priceLevel == 3) {
            priceStr = "三等奖: " + data.price[j].priceName + " *" + data.price[j].amount
          }
          price.push(priceStr)
        }
        detail['price'] = price
 
        this.setData({
          detail:detail,
          detailImgList: data.detailImgList
        })
      }
      , fail: err => {
        console.log(err)
      }
    })
    /*
    // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-390d97d41a0a2589'
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
            icon: 'none',
            duration: 2000
          })
        }

      })
    }
    */
  },
  handleCollect:function(e){

    

    /*
    //判断有没有看过视频
    if(this.data.isLookedAd){

      let formId = e.detail.formId;
      console.log(" formId:" + formId)
      // formId 就是我们要获取的
      // todo 将收集到的 formId 提交给后台，保存下来供做推送使用
      console.log("开始实物抽奖")

      wx.cloud.callFunction({
        name: 'doGoodsLottery',
        data: {

          goodsLottertId: this.data.detail._id,
          formId: formId
        },
        complete: res => {
          //console.log('callFunction test result: ', res)
          var data = res.result
          console.log(data)
          if (data.code == 5001) {
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
          } else if (data.code == 5555) {
            console.log("抽奖成功")
            //滑动条归位
            wx.pageScrollTo({
              scrollTop: 0
            })
            this.setData({
              isShow: true,
            })
          } else if (data.code == 5003) {
            wx.showToast({
              title: '这个奖品您已经参加过啦，换一个把',
              icon: 'none'
            })
          } else if (data.code == 5005) {
            wx.showToast({
              title: '该奖品还没有到抽奖时间哦',
              icon: 'none',
              duration: 2000
            })
          }

        },
        fail: err => {
          // handle error
          console.log(err)
        },
      })

    }else if(this.data.detail.status == 0){//没开始

      //播放广告
      if (videoAd) {
        videoAd.show().catch(() => {
          // 失败重试
          videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败')
            })
        })
      }
      
    }else{//没有看过视频 status = 1
    //播放广告
    if(videoAd) {
      videoAd.show().catch(() => {
        // 失败重试
        videoAd.load()
          .then(() => videoAd.show())
          .catch(err => {
            console.log('激励视频 广告显示失败')
          })
        })
      }
    }
    */

    if (this.data.detail.status == 1) {

      let formId = e.detail.formId;
      console.log(" formId:" + formId)
      // formId 就是我们要获取的
      // todo 将收集到的 formId 提交给后台，保存下来供做推送使用
      console.log("开始实物抽奖")

      wx.cloud.callFunction({
        name: 'doGoodsLottery',
        data: {

          goodsLottertId: this.data.detail._id,
          formId: formId
        },
        complete: res => {
          //console.log('callFunction test result: ', res)
          var data = res.result
          console.log(data)
          if (data.code == 5001) {
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
          } else if (data.code == 5555) {
            console.log("抽奖成功")
            //滑动条归位
            wx.pageScrollTo({
              scrollTop: 0
            })
            this.setData({
              isShow: true,
            })
          } else if (data.code == 5003) {
            wx.showToast({
              title: '这个奖品您已经参加过啦，换一个把',
              icon: 'none'
            })
          } else if (data.code == 5005) {
            wx.showToast({
              title: '该奖品还没有到抽奖时间哦',
              icon: 'none',
              duration: 2000
            })
          }

        },
        fail: err => {
          // handle error
          console.log(err)
        },
      })

    } else if (this.data.detail.status == 0) {//没开始

      wx.showToast({
        title: '该奖品还没有到抽奖时间哦',
        icon: 'none',
        duration: 2000
      })
      /*
      //播放广告
      if (videoAd) {
        videoAd.show().catch(() => {
          // 失败重试
          videoAd.load()
            .then(() => videoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败')
            })
        })
      }
      */

    }
    
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
  clickGoodsLottery:function(){

    console.log("clickGoodsLottery")
    
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