// 在页面中定义插屏广告
let interstitialAd = null
const screenWidth = wx.getSystemInfoSync().screenWidth //px
Page({

  data: {

    cashLotteryList:null,
    barBtnSelected:[
      0,0,0
    ],
    scrollLeft:0,
    goodsData:[],
    noticeTxt0:'',
    noticeTxt1:'',
    shopNoticeTxt:'',
  },
  clickGoShop:function(){

    console.log("click go shop")
    wx.navigateTo({
      url: 'shopDetail',
    })
    
  },
  onLoad: function (options) {

    console.log("发起邀请的客户Id:")
    console.log(options.customerId)
    //发送到服务端保存记录
    this.sendInvitedRecord(options.customerId)
    //console.log("onload")
    this.loadCashLottery();
    //console.log("windowWidth:" + windowWidth)
    //this.loadGoods();

    //小红包
    //this.loadSmallCoinBag();

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-8f3c500dae72d433'
      })
      interstitialAd.onLoad(() => { })
      interstitialAd.onError((err) => { })
      interstitialAd.onClose(() => { })
    }

  },
  sendInvitedRecord:function(customerId){
    console.log("customerId in func :"+customerId)
    wx.cloud.callFunction({
      name: 'saveInvitedRecord',  // 对应云函数名
      data: {
        customerId:customerId//发起邀请方的Id
      },
      success: res => {
        wx.hideLoading()
        // 成功拿到手机号，跳转首页
        console.log("成功:")
        console.log(res);
      },
      fail: err => {
        
        console.log("发送邀请记录失败")
        console.error(err);
       
      }
    })

  },
  clickMyShopGoods:function(){

    wx.navigateTo({
      url: '../index/myShopGoods',
    })
  },
  /*
  loadSmallCoinBag:function(){


  },
  */
  loadGoods:function(){

    //console.log("load goods")
    wx.cloud.callFunction({
      name: 'getGoods',
      complete: res => {
        console.log("load goods success")
        var data = res.result.result
        console.log(data)
        var goodsData = []
        if (data.length > 0){
          for(var i=0;i<data.length;i++){
            var tmp = {}
            var goods=data[i]
            tmp["_id"]=goods._id
            tmp["sponsor"] = goods.sponsor
            tmp['coverImg']=goods.coverImg
            tmp['showListNo']=goods.showListNo
            var lotteryTime = goods.lotteryTime
            var startTime = goods.startTime
            //console.log(lotteryTime)
            var year = lotteryTime.substr(0, 4)
            var month = lotteryTime.substr(5,2)
            if (month.indexOf("0") == 0) {
              month = month.substr(1,2)
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
  
            var weekday = this.weekDay(lotteryTime.substr(0,10))
            //status = 0区分一下
            if (goods.status == 1){//可以抽奖
              tmp['lotteryTime'] = month + "月" + day + "日" + ' (' + weekday + ') ' + hour + ':' + minutes + " 开奖"
            } else if (goods.status == 0){//未开始
              
              //var startTime = goods.startTime
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
              tmp['lotteryTime'] = "即将开始 " + ' (' + month2 + "月" + day2 + "日 " + hour2 + ':' + minutes2 +" "+ weekday2 + ') ' 
            }
          
            
            var price = []
            for (var j = 0; j < goods.price.length;j++){
              var priceStr = ""
              //console.log(goods.price[j])
              if (goods.price[j].priceLevel == 1){
                priceStr = "一等奖: " + goods.price[j].priceName + " *" + goods.price[j].amount
              } else if (goods.price[j].priceLevel == 2){
                priceStr = "二等奖: " + goods.price[j].priceName + " *" + goods.price[j].amount
              } else if (goods.price[j].priceLevel == 3) {
                priceStr = "三等奖: " + goods.price[j].priceName + " *" + goods.price[j].amount  
              }
              price.push(priceStr)
            }
            tmp['price'] = price
            goodsData.push(tmp)
            //console.log(goodsData)
          }
          this.setData({
            goodsData: goodsData,
          })
        }
       
        
      }
      ,fail: err => {
        //console.log(err)
      }
    })
  },
  weekDay:function weekDay(dateStr){
    //console.log(dateStr)
    var dt = new Date(dateStr)
    //var dt = new Date(dateStr.substr(0, 4), dateStr.substr(5, 2), dateStr.substr(8, 2));
    //var dt =  new Date(Date.now() + (8 * 60 * 60 * 1000))
    //console.log(dt)
    //console.log(dt.getDay())
    var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return weekDay[dt.getDay()];
  },
  clickGoodsLottery:function(e){
    
    //console.log('click goods lottery')
    //console.log(e.currentTarget.dataset.bean)
    var goodsId = e.currentTarget.dataset.bean
    wx.navigateTo({
      url: '../index/goodsDetail?goodsId=' + goodsId,
    })
  },
  clickMyLottery:function(){

    //console.log("clickMyLottery")
    wx.navigateTo({
      url: '../index/myLottery',
    })
  },
  onShareAppMessage:function(){

    //console.log("share")
    return{
      title:"金龙鱼优质米菜籽油草鸡蛋免费送",
      path:'/pages/index/home',
      imageUrl:'../../images/share.png',
      success(e){

      },
      fail(e){},
    }

  },
  autoScroll:function(){

    //自动横向滚动
    var cashLotteryList = this.data.cashLotteryList
    var oneItemDistance = 453 * screenWidth / 750;
    for (var i = 0; i < cashLotteryList.length; i++) {
      if (cashLotteryList[i].status > 1 && i < cashLotteryList.length - 1) {
        //设置左边滚动距离
        this.setData({
          scrollLeft: oneItemDistance * (i + 1)
        })
      } else if (cashLotteryList[i].status > 1 && i == cashLotteryList.length - 1) {
        this.setData({
          scrollLeft: oneItemDistance * i
        })
      }


  }

  },
  onShow:function(){

    // 在适合的场景显示插屏广告
    
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
    
    
    //console.log("onshow")
    this.setData({
      barBtnSelected: [
        1, 0, 0
      ],
    })
    wx.cloud.callFunction({
      name: 'getNotice',
      complete: res => {
        //console.log('callFunction test result: ', res)
        var data = res.result
        //console.log(data)
        this.setData({
          noticeTxt0:data.txt0,
          noticeTxt1: data.txt1,
        })
      }
      ,fail:err=>{
        //console.log(err)
      }
    })

    wx.cloud.callFunction({
      name: 'getTotalShopGoodsNum',
      complete: res => {
        //console.log('callFunction test result: ', res)
        var data = res.result
        console.log(data)
        //shopNoticeTxt
        //Math.floor(Math.random()*10);    // 可均衡获取 0 到 9 的随机整数。
       
        var info = []
        var count = 0
        for(var key in data){
          //console.log(key+'='+data[key]);
        
          info[count] = data[key]
          count ++
        }
        console.log(info)
        var idx = Math.floor(Math.random()*info.length);
        console.log(idx)
        console.log(info[idx])
        this.setData({
          shopNoticeTxt:info[idx]
        })
        console.log(this.data.shopNoticeTxt)
      }
      ,fail:err=>{
        console.log(err)
      }
    })
  },
  onHide:function(){
    //console.log("onHide")
  },
  onPullDownRefresh: function () {
    //console.log("下拉刷新")
    this.loadCashLottery()//刷新
    wx.stopPullDownRefresh()
  },
  loadCashLottery:function(){

    //调用云函数
    wx.cloud.callFunction({
      name: 'getCashLottery',
      complete: res => {
        //console.log('callFunction test result: ', res)
        var data = res.result
        //console.log(data)
        var cashLotteryList = []
        if (data.length > 0){
          
          for(var i =0;i<data.length;i++){
            
            //console.log(data[i])
            var tmp = {}
            tmp["cashLotteryId"] = data[i].cashLotteryId
            tmp["cashLotteryTitle"] = "../../images/cashLotteryTitle"+(i+1)+".png"
            var startTime = data[i].startTime
            var startHour = parseInt(startTime.substr(11,2))
            //console.log(startTime)
            //console.log(parseInt(startHour))
            var startHourStr = ""
            if (startHour <= 12){
              startHourStr = "上午" + startHour+":00准时开抢"
            } else if (startHour <= 17){
              startHourStr = "下午" + (startHour-12) + ":00准时开抢"
            }else{
              startHourStr = "晚上" + (startHour - 12) + ":00准时开抢"
            }
           
            tmp["cashLotteryTxtA"] = startHourStr
            tmp["status"] = data[i].status
            var cashLotteryBtnTxt = ""
            
            if (data[i].status == 0){
              
              var timestampNow = Date.parse(new Date()) / 1000; 
              //兼容iOS真机
              var dateTime = startTime.replace(/-/g, "/");
              var timestamp = Date.parse(new Date(dateTime)) / 1000;
              
              var intervalSeconds = timestamp - timestampNow
              if (intervalSeconds < 0){
                cashLotteryBtnTxt = "开抢倒计时00时00分"
              }else{
                var intervalHours = parseInt(intervalSeconds / 3600)
                var intervalMinutes = parseInt((intervalSeconds % 3600) / 60)
                var intervalHoursStr = parseInt(intervalSeconds / 3600) < 10 ? "0" + intervalHours : "" + intervalHours
                var intervalMinutesStr = parseInt((intervalSeconds % 3600) / 60) < 10 ? "0" + intervalMinutes : "" + intervalMinutes
                cashLotteryBtnTxt = "开抢倒计时" + intervalHoursStr + "时" + intervalMinutesStr+"分"
                
              }

            } else if (data[i].status == 1){
              cashLotteryBtnTxt = "进行中"
            }else{//status = 2,3
              cashLotteryBtnTxt = "已结束"
            }
            tmp["cashLotteryBtnTxt"] = cashLotteryBtnTxt
            cashLotteryList.push(tmp)
          }
          this.setData({
            cashLotteryList: cashLotteryList
          })
          this.autoScroll()
        }

      },
      fail: err => {
        // handle error
        //console.log(err)
      },
    })

    
  },
  listenScroll:function(e){

    //console.log(e.detail.scrollLeft)
    //console.log("向左滚动了:" + 750 / screenWidth * e.detail.scrollLeft)
  },
  clickCashLottery:function(e){

    //console.log("clickCashLottery")
    //console.log(e.currentTarget.dataset.bean)
    var cashLotteryId = e.currentTarget.dataset.bean
    //开始判断
    //先本地判断一下
    var cashLotteryList = this.data.cashLotteryList
    if (cashLotteryList.length > 0){
      for (var j = 0; j < cashLotteryList.length; j++) {
        if (cashLotteryList[j]["cashLotteryId"] == cashLotteryId){
          
          /*
          if (cashLotteryList[j]["status"]==0){
            console.log("还没有开始哦")
            wx.showToast({
              title: '还没有开始哦',
              icon: 'none',
              duration: 1000
            });
          } else if (cashLotteryList[j]["status"] > 1){
            console.log("已经结束啦")
            wx.showToast({
              title: '已经结束啦',
              icon: 'none',
              duration: 1000
            });
          }else{//status 本地数据 = 1，将请求服务端
            console.log("发起抽奖请求")
            wx.navigateTo({
              url: '../index/cashLotteryDetail?no=' + j + '&cashLotteryId=' + cashLotteryId,  //跳转页面的路径，可带参数 ？隔开， 
              success: function() { },        　　　//成功后的回调；
              fail:function() { },          　　　//失败后的回调；
              //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
            })
            
          }
          */
          console.log("发起抽奖请求")
          wx.navigateTo({
            url: '../index/cashLotteryDetail?no=' + j + '&cashLotteryId=' + cashLotteryId + "&status=" + cashLotteryList[j]["status"],  //跳转页面的路径，可带参数 ？隔开， 
            success: function () { },        　　　//成功后的回调；
            fail: function () { },          　　　//失败后的回调；
            //complete:function() { }     　　　 //结束后的回调(成功，失败都会执行)
          })
        }
      }
    }
    
  },
  clickTicket:function(){
    wx.navigateTo({
      url: '../index/myTicket',  //跳转页面的路径，可带参数 ？隔开， 
      success: function () { },        　　　//成功后的回调；
      fail: function () { },      
    })
  },
  clickMe:function(){

    console.log("click me")
    wx.navigateTo({
      url: '../index/me',  //跳转页面的路径，可带参数 ？隔开， 
      success: function () { },        　　　//成功后的回调；
      fail: function () { },      
    })
  },
})