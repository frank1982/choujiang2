// pages/index/myShopGoods.js
// 在页面中定义插屏广告
let interstitialAd = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myGoodsInfo:{},
    baseGoodsInfo:[],
    fullGoodsNums:[0,0,0],
    isShow:false,
    sessionCode:'',
    isResultShow:false,
    resultInfo:{},
    selectedGoodsName:"",
    selectedAction:'',//exchange pack exchangeEnd
    isDoing:false,
  },
  clickPack:function(e){
    console.log(e.target.dataset.bean)
    this.setData({
      selectedAction:'pack'
    })
    //检查是否足额
    var name = e.target.dataset.bean
    if(name == "rice"){
      if(this.data.fullGoodsNums[0]<1){
        wx.showToast({
          title:'大米不满1袋哦',
          icon:'none',
          duration:2000,
        })
      }else{//足够1袋
        wx.pageScrollTo({
          scrollTop: 0
        })
        this.setData({
          
          resultInfo:{
            "resultImg":"../../images/riceIcon.png",
            "resultTxt":this.data.baseGoodsInfo[0].chname,
            "resultTxt1":"每袋5公斤 X "+ this.data.fullGoodsNums[0],
            "resultTxt2":"免费发货",
          },
          isResultShow:true,
          selectedGoodsName:'rice',
        })

      }
    }else if(name == "oil"){

      if(this.data.fullGoodsNums[1]<1){
        wx.showToast({
          title:'食用油不满1瓶哦',
          icon:'none',
          duration:2000,
        })
      }else{//足够1袋
        wx.pageScrollTo({
          scrollTop: 0
        })
        this.setData({
          
          resultInfo:{
            "resultImg":"../../images/oilIcon.png",
            "resultTxt":this.data.baseGoodsInfo[1].chname,
            "resultTxt1":"每瓶1.8升 X "+ this.data.fullGoodsNums[1],
            "resultTxt2":"免费发货",
          },
          isResultShow:true,
          selectedGoodsName:'oil',
        })

      }

    }else if(name == "egg"){
      if(this.data.fullGoodsNums[2]<10){
        wx.showToast({
          title:'鸡蛋不满10个哦',
          icon:'none',
          duration:2000,
        })
      }else{//足够1袋
        wx.pageScrollTo({
          scrollTop: 0
        })
        this.setData({
          
          resultInfo:{
            "resultImg":"../../images/eggIcon.png",
            "resultTxt":this.data.baseGoodsInfo[2].chname,
            "resultTxt1":"每盒10个 X "+ Math.floor(this.data.fullGoodsNums[2]/10),
            "resultTxt2":"免费发货",
          },
          isResultShow:true,
          selectedGoodsName:'egg',
        })

      }
    }
  },
  clickResultBtn:function(){

   
    //selectedGoodsName:""
    /* this.setData({
      selectedAction:'pack'
    })
    */
   console.log("selectedGoodsName:"+this.data.selectedGoodsName)
    if(this.data.selectedAction == 'pack'){
      console.log("打包发货")
      wx.navigateTo({
        url:"myShopGoodsPackingEnsure?selectedGoodsName="+this.data.selectedGoodsName,
      })
    }else if(this.data.selectedAction == 'exchange'){

      
      console.log("变现")
      if(this.data.isDoing == false){

        this.setData({
          isDoing:true,
        })
        //兑换现金
        wx.cloud.callFunction({
          name: 'doShopGoodsExchange',  // 对应云函数名
          data:{
            goodsName:this.data.selectedGoodsName
          },
          success: res => {
            console.log(res)
            if(res.result.code == 6666){
              this.setData({
                resultInfo:{
                  "resultImg":"../../images/gift.png",
                  //"resultTxt":this.data.baseGoodsInfo[2].chname,
                  "resultTxt1":"兑换成功",
                  "resultTxt2":"去钱包看看",
                },
                selectedAction:"exchangeEnd",
  
              })
            }else{

            }
            this.setData({
              isDoing:false,
              
            })
          },
          fail: err => {
          
            console.error(err);
            this.setData({
              isDoing:false,
            })

          }
        })
      }else{
        console.log("拦截")
      }
    }else if(this.data.selectedAction=="exchangeEnd"){
      wx.navigateTo({
        url:'me'
      })
    }
   
  },
  clickExchange:function(e){
   
    console.log(e.target.dataset.bean)
    console.log("变现")
    var goodsName = e.target.dataset.bean
    if(this.data.myGoodsInfo[goodsName] <= 0.1){
     wx.showToast({
       title:'数量不够哦',
       icon:"none",
       duration:2000
     })
     return
    }
    wx.pageScrollTo({
      scrollTop: 0
    })
    var str = ""
    str = this.data.myGoodsInfo[goodsName]
    if(goodsName == 'rice'){
      str += "克大米 换 "+(this.data.myGoodsInfo[goodsName]*this.data.baseGoodsInfo[0].exchangPrice).toFixed(2)+"元"
    }else if(goodsName == 'oil'){
      console.log(this.data.myGoodsInfo[goodsName])
      console.log(this.data.baseGoodsInfo[1].exchangPrice)
      str += "毫升油 换 "+(this.data.myGoodsInfo[goodsName]*this.data.baseGoodsInfo[1].exchangPrice).toFixed(2)+"元"
    }else if(goodsName == 'egg'){
      str += "个鸡蛋 换 "+(this.data.myGoodsInfo[goodsName]*this.data.baseGoodsInfo[2].exchangPrice).toFixed(2)+"元"
    }
    this.setData({
      selectedAction:'exchange',
      selectedGoodsName:goodsName,
      isResultShow:true,
      resultInfo:{
        "resultImg":"../../images/"+goodsName+"Icon.png",
        //"resultTxt":this.data.baseGoodsInfo[2].chname,
        "resultTxt1":str,
        "resultTxt2":"换现金",
      },
    })
    

  },
  closeBtn:function(){
    this.setData({
      isResultShow:false,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //判断是否新客户?
    // 在页面onLoad回调事件中创建插屏广告实例
if (wx.createInterstitialAd) {
  interstitialAd = wx.createInterstitialAd({
    adUnitId: 'adunit-bf100b26f30ee366'
  })
  interstitialAd.onLoad(() => {})
  interstitialAd.onError((err) => {})
  interstitialAd.onClose(() => {})
}
    
    wx.cloud.callFunction({
      name: 'doCheckNewCustomer',  // 对应云函数名
      
      success: res => {
        console.log(res);
        
        if(res.result.code == 5555){
          //老用户
          this.getShopGoodsBaseInfo();
          this.getMyShopGoodsInfo();
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
  clickGetTicket:function(){

    wx.navigateTo({
      url:'shopDetail'
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
  getShopGoodsBaseInfo:function(){

    wx.cloud.callFunction({
      name: 'getShopGoodsBaseInfo',  // 对应云函数名
      success: res => {
        console.log(res);
        this.setData({
          baseGoodsInfo:res.result
        })
      },
      fail: err => {
        console.error(err);
      }
    })
  },
  getMyShopGoodsInfo:function(){

    wx.cloud.callFunction({
      name: 'getMyShopGoodsInfo',  // 对应云函数名
      success: res => {
        console.log(res);
        var fullNums = []
        if(res.result.code == 8000){
          fullNums[0]= 0
          fullNums[1]=0
          fullNums[2]=0
          this.setData({
            myGoodsInfo:{rice:0,egg:0,ticket:0,oil:0},
            fullGoodsNums:fullNums,
          })
        }else if(res.result.code == 8888){
          fullNums[0]= Math.floor(res.result.data.rice/5000)
          fullNums[1]= Math.floor(res.result.data.oil/1800)
          fullNums[2]=res.result.data.egg
          this.setData({
            myGoodsInfo:res.result.data,
            fullGoodsNums:fullNums,
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
    console.log("onshow")
    // 在适合的场景显示插屏广告
if (interstitialAd) {
  interstitialAd.show().catch((err) => {
    console.error(err)
  })
}
    this.setData({
      isResultShow:false
    })
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