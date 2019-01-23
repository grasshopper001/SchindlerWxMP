//index.js
//获取应用实例
const app = getApp()


Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    runInfo:{},
    hasRunInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')&&wx.canIUse("getWeRunData")
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var self = this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    if (this.data.hasUserInfo) {
      var self = this;
      wx.getWeRunData({
        success(res) {
          const encryptedData = res.encryptedData
          console.log(res.iv)
          console.log(encryptedData);
          //TODO: get SK and save for getWeRunData
          //TODO: test SK 2 times with the same code ==>err,SK===undefined
          //TODO: delete wx.request since it would call code2session 2 times together with wx.getWxRunData
          
          wx.request({
            url: 'http://127.0.0.1:3000/users/' + self.data.userInfo.nickName,
            method: "POST",
            data: {
              iv: res.iv,
              encryptedData: encryptedData,
              code: app.globalData.code,
              sk:app.globalData.session_key
            },
            header: {
              //设置参数内容类型为x-www-form-urlencoded==>query
              'content-type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json'
            },
            success: (res) => {
              console.log(res.data)
              self.setData({
                motto: res.data
              })
            }  
          })
        }
      })
    }  
  },
  onHide:function(){
    setInterval(() => {
      if (this.data.hasUserInfo) {
        var self = this;
        wx.getWeRunData({
          success(res) {
            const encryptedData = res.encryptedData
            console.log(res.iv)
            console.log(encryptedData);
            wx.request({
              url: 'http://127.0.0.1:3000/users/' + self.data.userInfo.nickName,
              method: "POST",
              data: {
                iv: res.iv,
                encryptedData: encryptedData,
                code: app.globalData.code
              },
              header: {
                //设置参数内容类型为x-www-form-urlencoded==>query
                'content-type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
              },
              success: (res) => {
                console.log(res.data);
                self.setData({
                  motto: res.data
                })
              }
            })
          }
        })

      }
    }, 900000);

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
