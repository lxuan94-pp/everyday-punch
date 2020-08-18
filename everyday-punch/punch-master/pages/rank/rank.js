// pages/rank/rank.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // currentTab: 0,
    result: null,
    result2: null,
    currentUser: {},
    dataList: [],
    personalPunchData: null,
    openid: app.globalData.openid,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData
    console.log(app.globalData.openid);
    this.get_rank_list();
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
    wx.stopPullDownRefresh();
    this.get_rank_list();
    console.log("Try to refresh");
  },

  get_rank_list: function () {
    var that = this;
    var insertSql = '';
    wx.showNavigationBarLoading();
    wx.showToast({
      title: '努力加载中',
      icon: 'loading',
      duration: 10000,
    })
    wx.request({
      url: 'http://www.mayongcheng.cn/punch/query',
      method: 'POST',
      data: {
        sql: '{"statement": "select avatar_url,nickname,punch_num,rank from user where rank<=10 ORDER BY rank;"}',
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        if (res.data.result == null) {
          wx.showToast({
            icon: 'none',
            title: '加载失败',
          })
        }
        else {
          wx.showToast({
            title: '数据加载完成',
          })
          that.setData({
            result: JSON.parse(res.data.result),
          });
          var dataListTmp = []
          for (var i = 0; i < that.data.result.length; i++) {
            dataListTmp.push({ avatar_url: that.data.result[i][0], nickname: that.data.result[i][1], punch_num: that.data.result[i][2], rank: that.data.result[i][3] });
          }
          if (that.data.result.length < 10) {
            for (var i = that.data.result.length + 1; i <= 10; i++) {
              dataListTmp.push({ avatar_url: "/image/noneUser.jpg", nickname: "虚位以待", punch_num: 0, rank: i });
            }
          }
          that.setData({
            dataList: dataListTmp,
          });

        }
        wx.hideNavigationBarLoading();
      },
      fail: function (res) {
        wx.showToast({
          icon: 'cancel',
          title: '数据加载失败',
        })
      }
    }),

      insertSql = 'select avatar_url,nickname,punch_num,rank from user where openid = \\\"' + app.globalData.openid + '\\\"'
    wx.request({
      url: 'http://www.mayongcheng.cn/punch/query',
      method: 'POST',
      data: {
        'sql': '{"statement": "' + insertSql + '"}',
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        if (res.data.result == null) {
        }
        else {
          that.setData({
            result2: JSON.parse(res.data.result),
          });
          var dataListTmp = []
          for (var i = 0; i < that.data.result2.length; i++) {
            dataListTmp.push({ avatar_url: that.data.result2[i][0], nickname: that.data.result2[i][1], punch_num: that.data.result2[i][2], rank: that.data.result2[i][3] });
          }
          if (that.data.result2.length < 1) {
            dataListTmp.push({ avatar_url: "/image/noneUser.jpg", nickname: "暂无数据", punch_num: 0, rank: "∞" });
          }
          that.setData({
            personalPunchData: dataListTmp,
          });

        }
      },
      fail: function (res) {
        wx.showToast({
          icon: 'cancel',
          title: '尚未登陆',
        })
      }
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

  },

  // swichNav: function (e) {
  //   console.log(e);
  //   var that = this;
  //   if (this.data.currentTab === e.target.dataset.current) {
  //     return false;
  //   } else {
  //     that.setData({
  //       currentTab: e.target.dataset.current,
  //     })
  //   }
  // },

  updateData: function (result1) {
    this.setData({
      result: result1,
    });
    var dataListTmp = []
    for (var i = 0; i < this.data.result.length; i++) {
      dataListTmp.push({ avatar_url: this.data.result[i][0], nickname: this.data.result[i][1], punch_num: this.data.result[i][2], rank: this.data.result[i][3] });
    }
    this.setData({
      dataList: dataListTmp,
    });
  },
  onShareAppMessage: function (res) {
    console.log("Tap");
    return {
      title: '快来看看我的排名！',
      path: '/pages/rank/rank?id=123',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})