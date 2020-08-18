// pages/records.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curYear:1991,
    curMonth:4,
    curDay:12,
    
    //随便编的打卡记录信息
    //需从数据库查询，如果来不及可以乱编
    listData: [
      { "dateTime": "2018-4-2 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-2 18:00", "type": "学习打卡", "coin": "50" },
      { "dateTime": "2018-4-3 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-3 16:00", "type": "运动打卡", "coin": "50" },
      { "dateTime": "2018-4-6 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-6 16:00", "type": "运动打卡", "coin": "50" },
      { "dateTime": "2018-4-9 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-9 18:00", "type": "学习打卡", "coin": "50" },
      { "dateTime": "2018-4-12 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-12 9:00", "type": "学习打卡", "coin": "50" },
      { "dateTime": "2018-4-12 16:00", "type": "运动打卡", "coin": "50" },
      { "dateTime": "2018-4-12 18:00", "type": "学习打卡", "coin": "50"},
      { "dateTime": "2018-4-13 9:00", "type": "学习打卡", "coin": "50" },
      { "dateTime": "2018-4-13 18:00", "type": "学习打卡", "coin": "50" },
      { "dateTime": "2018-4-16 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-16 16:00", "type": "运动打卡", "coin": "50" },
      { "dateTime": "2018-4-23 8:00", "type": "人脸打卡", "coin": "30" },
      { "dateTime": "2018-4-23 18:00", "type": "学习打卡", "coin": "50" },
    ],
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    _getUserInfo();
    function _getUserInfo() {
      wx.getUserInfo({
        success: function (res) {
          that.setData({
            userInfo: res.userInfo
          })
          that.update()
        }
      })
    };

    var that = this;
    wx.getStorage({
      key: 'date',    
      success: function(res) {
          that.setData({
            curDay: res.data['day'],
            curMonth: res.data['month'],
            curYear: res.data['year'],
          })
      },
    });
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.calcRecords();
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
  
  },

  calcRecords(){
    var that = this;
    let curListData = []
    console.log(that.data.curYear + "年" + that.data.curMonth + "月" + that.data.curDay + "日");
    const recordsList = that.data.listData;

    var length = recordsList.length;
    for (let index = 0; index < length; index++) {
      var dateTime = recordsList[index].dateTime;
      var prev = 0,
        arr = [];
      for (var i = 0; i < dateTime.length; i++) {
        if (dateTime[i] == ' ') {
          var temp = dateTime.substring(prev, i);
          arr.push(temp);
          prev = i + 1;
        }
      }
      if (prev <= dateTime.length) {
        var temp = dateTime.substring(prev, dateTime.length);
        arr.push(temp);
      }

      var prev = 0,
        dateListTemp = [];
      for (var i = 0; i < arr[0].length; i++) {
        if (arr[0][i] == '-') {
          var temp = arr[0].substring(prev, i);
          dateListTemp.push(temp);
          prev = i + 1;
        }
      }

      if (prev <= arr[0].length) {
        var temp = arr[0].substring(prev, arr[0].length);
        dateListTemp.push(temp);
      }
      if (that.data.curYear == dateListTemp[0] && that.data.curMonth == dateListTemp[1] && that.data.curDay == dateListTemp[2]) {
        curListData.push(recordsList[index])
      }


    }
    that.setData({
      curListData,
    })
    console.log(curListData);
  }
})