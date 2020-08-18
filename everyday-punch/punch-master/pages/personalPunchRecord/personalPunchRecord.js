// pages/personalPunchRecord.js

let chooseYear = null;//选择年
let chooseMonth = null;//选择月
let date = new Date();
const conf = {
  data: {
    hasEmptyGrid: false,//是否绘制了日历分割线
    showPicker: false,//是否选择了某一天
    showRecord:false,//是否显示查看具体记录按钮
    curDay:date.getDate(),//今天
  },
  onLoad() {
    
    const curYear = date.getFullYear();//当前年
    const curMonth = date.getMonth() + 1;//当前月
    //const curDay = date.getDate();

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

   
    const weeksCh = ['日', '一', '二', '三', '四', '五', '六'];
    this.calculateEmptyGrids(curYear, curMonth);//计算绘制分割线
    this.calculateDays(curYear, curMonth);//计算当前月有多少天，并初始化
    this.setData({
      curYear,
      curMonth,
      weeksCh
    });
  },
  //获取当前月有多少天
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  //计算当前第一天是周几
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  //绘制分割线
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },

  //从数据库查询打卡记录，该函数未完善
  queryDateFromDB(){
    const sql = "";
    wx.request({
      url: 'http://www.uncle-raine.site/punch/query',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },// 设置请求的 header
      data: {
        "sql": "{\"statement\": \"" + sql + "\"}"
      },
      success: function (res) {
        console.log(res.data.result);
      }
    });
    return 0;
  },

  //计算当前月的天数，并初始化
  calculateDays(year, month) {
    //天数数组
    let days = [];

    const thisMonthDays = this.getThisMonthDays(year, month);
    
    //得到当前月有多少天以后，循环初始化天数数组
    for (let i = 1; i <= thisMonthDays; i++) {
      //这部分是有打卡记录的天数。这里我是随便写的判断条件，应该是由数据库读取出以后再判断
      if(i == 2|| i == 3|| i == 6 || i == 9||i == 12 || i == 13 || i == 16 || i== 23){
        days.push({
          day: i,//几号，压入
          choosed: false,//未被选中
          today: false,//不是今天
          hasRecord: true,//有打卡记录
        });
      }else{
        //这一部分是没有打卡记录的
        days.push({
          day: i,
          choosed: false,
          today: false,
          hasRecord: false,//没有打卡记录
        });
      }
      
    }
    //存储数据
    this.setData({
      days
    });
  },
  //月份上左右按钮的handle，计算上、下一个月的天数信息，绘制日历
  handleCalendar(e) {
    const handle = e.currentTarget.dataset.handle;
    const curYear = this.data.curYear;
    const curMonth = this.data.curMonth;
    if (handle === 'prev') {
      let newMonth = curMonth - 1;
      let newYear = curYear;
      if (newMonth < 1) {
        newYear = curYear - 1;
        newMonth = 12;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        curYear: newYear,
        curMonth: newMonth
      });
    } else {
      let newMonth = curMonth + 1;
      let newYear = curYear;
      if (newMonth > 12) {
        newYear = curYear + 1;
        newMonth = 1;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        curYear: newYear,
        curMonth: newMonth
      });
    }
  },
  //选择某一天时触发的函数
  tapDayItem(e) {
    const idx = e.currentTarget.dataset.idx;
    const days = this.data.days;
    //每次只能选择一天
    for (let i = 0; i < days.length; i++) {
      days[i].choosed = false;
      
    }

    this.data.showRecord = false;
    //将选中的这一天置为与之前相反的选择状态
    days[idx].choosed = !days[idx].choosed;
    
    //这个部分用来将当前选择的年月日存入缓存，在下一个页面读取
    var dateStore = {
      year:this.data.curYear,
      month: this.data.curMonth,
      day:days[idx].day,
    };

    wx.setStorage({
      key: 'date',
      data: dateStore,
    })
    this.setData({
      days,
      showRecord : true,
    });
  },
  
  //日历月份展示区中间选择年、月时触发的函数
  //无需数据库绑定
  chooseYearAndMonth() {
    this.data.showRecord = false;
    const curYear = this.data.curYear;
    const curMonth = this.data.curMonth;
    let pickerYear = [];
    let pickerMonth = [];
    for (let i = 1900; i <= 2100; i++) {
      pickerYear.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      pickerMonth.push(i);
    }
    const idxYear = pickerYear.indexOf(curYear);
    const idxMonth = pickerMonth.indexOf(curMonth);
    this.setData({
      pickerValue: [idxYear, idxMonth],
      pickerYear,
      pickerMonth,
      showPicker: true,
    });
  },
  pickerChange(e) {
    const val = e.detail.value;
    chooseYear = this.data.pickerYear[val[0]];
    chooseMonth = this.data.pickerMonth[val[1]];
  },
  tapPickerBtn(e) {
    const type = e.currentTarget.dataset.type;
    const o = {
      showPicker: false,
    };
    if (type === 'confirm') {
      o.curYear = chooseYear;
      o.curMonth = chooseMonth;
      this.calculateEmptyGrids(chooseYear, chooseMonth);
      this.calculateDays(chooseYear, chooseMonth);
    }

    this.setData(o);
  },
  //当选择某一天后出现查看记录按钮，按下查看记录按钮时触发的函数
  jumpToRecord(){
    wx.navigateTo({
      url: '../records/records',
    })
  },
  //分享按钮触发的函数
  onShareAppMessage() {
    return {
      title: '个人打卡记录',
      desc: '还是新鲜的记录哟',
      path: 'pages/index/index'
    };
  }
};

Page(conf);