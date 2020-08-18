//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      that.login()
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        that.login()
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
          that.login()
        }
      })
    }
  },

  login() {
    var that = this
    wx.login({
      success: function (res) {
        wx.request({
          //获取openid接口  
          url: 'https://api.weixin.qq.com/sns/jscode2session',
          data: {
            appid: 'wxac573e570b190a9a',
            secret: 'ce9caf58f0c25caf0bcc7022e0364fb2',
            js_code: res.code,
            grant_type: 'authorization_code'
          },
          method: 'GET',
          success: function (res) {
            var openid = res.data.openid
            app.globalData.openid = openid
            var value = wx.getStorageSync('registered')
            if (value != true) {
              const sql = "select * from user where openid = \\\"" + openid + "\\\";"
              wx.request({
                url: 'http://www.mayongcheng.cn/punch/query',
                method: 'POST',
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },// 设置请求的 header
                data: {
                  "sql": "{\"statement\": \"" + sql + "\"}"
                },
                success: function (res) {
                  if (res.data.result === null) {
                    that.insertUserFunction()
                    console.log(res.data.result)
                  }
                }
              })
            }
          }
        })
      }
    })  
  },
  
  getUserInfo: function(e) {
    var that = this
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    that.login()
  },
  navi_face: function() {
    wx.navigateTo({
      url: '../face/face'
    })
  },
  navi_study: function () {
    wx.navigateTo({
      url: '../study/study'
    })
  },
  navi_sport: function () {
    wx.navigateTo({
      url: '../sport/sport'
    })
  },
  navi_record: function () {
    wx.navigateTo({
      url: '../personalPunchRecord/personalPunchRecord'
    })
  },
  navi_rank: function () {
    wx.navigateTo({
      url: '../rank/rank'
    })
  },

  //像数据库中插入用户信息的函数
  insertUserFunction() {
    var user = getApp().globalData.userInfo;
    var avatar_url = user.avatarUrl;
    var nickName = user.nickName;
    var gender = user.gender;
    var province = user.province;
    var city = user.city;
    var insertSql = '';
    var OPENID = getApp().globalData.openid;
    insertSql = 'insert into user(openid, avatar_url, nickname, gender, province, city) values(\\\"' + OPENID + '\\\",\\\"' + avatar_url + '\\\",\\\"' + nickName + '\\\", \\\"' + gender + '\\\",\\\"' + province + '\\\",\\\"' + city + '\\\");';
    wx.request({
      url: 'http://www.mayongcheng.cn/punch/insert',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },// 设置请求的 header
      data: {
        'sql': '{"statement": "' + insertSql + '"}'
      },
      success: function (res) {
        console.log(res);
        wx.setStorage({
          key: 'registered',
          data: true,
        })
      }
    })
  }
})
