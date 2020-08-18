// pages/face/face.js
var util = require('../../utils/util.js'); 
Page({

  // 页面的初始数据，这里主要用来设置组件的初始状态
  data: {
    timeValue: '00:00',
    openid: null,
    modalPunch: true,
    modalSettime: true,
    position: "front",
    camera_hidden: false
  },

  // 监听页面加载，获取用户openid
  onLoad: function (options) {
    this.data.openid = getApp().globalData.openid
    var value = wx.getStorageSync('face_punch_time')
    if (value) {
      this.setData({
        timeValue : value
      })
    }
  },

  // 渲染页面后渲染camera组件
  onReady: function () {
    if (wx.createCameraContext()) {
      this.ctx = wx.createCameraContext('myCamera')
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示  
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  // 显示设置打卡时间的界面
  showTimeSetting() {
    this.setData({
      camera_hidden: true,
      modalSettime: false,
    })
  },

  timePickerBindchange(e) {
    this.setData({
      timeValue: e.detail.value
    });
    wx.setStorage({
      key: "face_punch_time",
      data: e.detail.value
    })
  },

  // 更改摄像头的前后置属性
  camera_reverse() {
    if (this.data.position === "front")
      this.setData({ position: "back" })
    else
      this.setData({ position: "front" })
  },

  // 初始化modal和camera的隐藏属性
  cancelModal() {
    this.setData({
      modalPunch: true,
      modalSettime: true,
      camera_hidden: false
    })
  },

  // 拍照并显示确定打卡界面
  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath,
          modalPunch: false,
          // 隐藏camera以防止覆盖modal组件
          camera_hidden: true
        })
      },
      error(e) {
        console.log(e.detail)
      }
    })
  },

  // 向后台传输数据然后判断是否可以打卡，成功则返回成功并记录打卡
  punch() {
    var that = this
    // 这里用于判断用户是否在规定时间内打卡，测试时可以设置为注释
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp); 
    // 系统当前的时间
    var h = date.getHours();
    var m = date.getMinutes();  
    
    var arr = that.data.timeValue.split(":");
    var h0 = parseInt(arr[0])
    var m0 = parseInt(arr[1])
    
    if(h > h0 || (h === h0 && m > m0)) {
      // 当前时间大于设定的时间
      wx.showModal({
        title: '提示',
        content: '你已经睡过啦！',
        showCancel: false,
        success: function (res) {
          that.cancelModal()
        }
      })
    } else {
      // 这里是用户上传图片进行打卡的部分
      wx.uploadFile({
        url: 'http://www.mayongcheng.cn/punch/faceVerfication',
        filePath: that.data.src,
        name: 'img',
        formData: {
          'openid': that.data.openid
        },
        success: function (res) {
          var json = JSON.parse(res.data);
          var status = json.statusCode;
          const sql = "select sum, current_continual from face_punch order by face_punchID desc limit 1;";
          console.log("{\"statement\": \"" + sql + "\"}");
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
              var json = JSON.parse(res.data.result);
              var sum = json[0][0];
              var current_continual = json[0][1];

              if (status === 0) {
                current_continual = current_continual + 1;
              }
              if (status === 1) {
                wx.showToast({
                  title: '验证人脸失败',
                  icon: 'loading',
                  duration: 1000
                })
                current_continual = 0;
              }
              sum = sum + 1;
              that.insert(sum, current_continual);
            }
          })
        }
      })
    }
  },

  addface() {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.uploadFile({
          url: 'http://www.mayongcheng.cn/punch/addFace',
          filePath: res.tempFilePaths[0],
          name: 'img',
          formData: {
            'openid': that.data.openid
          },
          success: function (res) {
            if (res.data.statusCode === 0) {
              console.log("add face success   " + res.data)
              wx.showToast({
                title: '添加成功',
                icon: 'success',
                duration: 1000
              })
            } else {
              console.log("add face fail   " + res.data)
              wx.showToast({
                title: '添加失败',
                icon: 'loading',
                duration: 1000
              })
            }
          }
        })
      }
    })
  },

  // 自动生成时间和日期，调用者传入总和和持续次数即可
  insert(sum, current_continual) {
    var that = this;
    var openid = that.data.openid;
    var time = util.getHMS(new Date());
    var date = util.getYMD(new Date());
    var insertSql = 'insert into face_punch(openid, time, date, sum, current_continual) values(\\\"' + openid + '\\\", \\\"' + time + '\\\",\\\"' + date + '\\\", ' + sum + ', ' + current_continual + ');';
    console.log('{"statement": "' + insertSql + '"}');
    wx.request({
      url: 'http://www.mayongcheng.cn/punch/insert',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        'sql': '{"statement": "' + insertSql + '"}'
      },
      success: function (res) {
        if (res.data.statusCode === 0) {
          console.log("punch success  " + res.data)
          wx.showToast({
            title: '打卡成功',
            icon: 'success',
            duration: 1000
          })
          that.cancelModal();
        } else {
          console.log("punch fail   " + res.data)
          wx.showToast({
            title: '打卡失败',
            icon: 'loading',
            duration: 1000
          })
          that.cancelModal();
        }
      }
    })
  }
})