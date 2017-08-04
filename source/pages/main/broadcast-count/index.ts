import {Page, IPageParams, page} from "../../../common/page";
import * as echarts from '../../../libs/echarts/echarts.min.js';
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IBroadcastCountPageParams extends IPageParams {
    page: string;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    // params: ['page'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    title: '直播统计',
    name: 'main.broadcast-count'
})
    /**
     * 页面类
     *
     * 1 会根据类名自动完成配置路由等功能。
     *      比如MainOrgPage就会生成一个状态名为“main.validate_sucessful”，url为“/main/page”的路由。(Page会被忽略)
     *      注意，如果输入的是MainOrg_ManPage的话，状态名会是"main.validate_sucessful-man"，url会是“/main/validate_sucessful-man”。
     *      也就是类名中的下划线“_”会被解析成连接符“-”。
     *      Page<IOrgPageParams>里面的IOrgPageParams用来指定这个页面所需要的路由参数，见上方的interface接口定义。
     *
     *  2 Page的对象会自带几个字段，分别是：
     *      1 scope $scope，作用域
     *      2 uiState $state，ui-router的路由服务
     *      3 params $stateParams，路由参数
     *      4 session SessionService，会话服务（项目位置common/session.ts），存储了这次会话的一些全局数据，比如token。
     *      5 remote RemoteService，远程接口服务（项目位置common/remote/*），存储了一些网络访问的函数，服务器数据在这里获取。
     *
     *   3 页面类的对象在模板上用vm表示。用   {{vm.**}}   这种方式做绑定就可以了。
     */
class MainBroadcast_CountPage extends Page<IBroadcastCountPageParams> {
    currentBtn = 1;
    $calendarStart = $('#J-calendar-start');
    $calendarEnd = $('#J-calendar-end');
    meetingTime = null;
    meetingConcurrent = null;
    meetingDurationTime = null;
    meetingRoomDuration = null;
    participantTotalDuration = null;
    liveConcurrentChart = null;
    liveUserZoneChart = null;
    liveUserDeviceChart = null;
    liveBrowserVersionChart = null;
    liveFlowChart = null;
    timeReg: null;
    liveList: null;
    isShowOfSelect = true;
    $liveListSelect = $('#J-live-list-select');

    init(timeout: angular.ITimeoutService) {
        let self = this;
        // 用于判断日期是否合法的正则表达式
        self.timeReg = /^(\d{4})\-(\d{2})\-(\d{2})$/;
        // 基于已准备好的dom，初始化ECharts实例。
        self.liveConcurrentChart = echarts.init(document.getElementById('J-live-concurrent-chart'));
        self.liveUserZoneChart = echarts.init(document.getElementById('J-live-user-zone-chart'));
        self.liveUserDeviceChart = echarts.init(document.getElementById('J-live-user-device-chart'));
        self.liveBrowserVersionChart = echarts.init(document.getElementById('J-live-browser-version-chart'));
        self.liveFlowChart = echarts.init(document.getElementById('J-live-flow-chart'));
        // 初始化一加载就执行的方法
        self.activationTimePlugIn ();   // 初始化时间插件
        self.getTodayData ();         // 获取今天的使用数据
    }
    /* 激活时间插件 */
    activationTimePlugIn () {
        let self = this;
        let start = {
            elem: '#J-calendar-start',
            event: 'click',
            format: 'YYYY-MM-DD',
            isclear: false,
            istoday: false,
            festival: true,
            fixed: false,
            istime: true
        };
        let end = {
            elem: '#J-calendar-end',
            event: 'click',
            format: 'YYYY-MM-DD',
            istime: true,
            istoday: false
        };
        laydate(start);
        laydate(end);
    }
    /* 得到今天的统计数据 */
    getTodayData () {
        let self = this;
        // 使页面上的“今天”按钮处于选中的状态
        self.currentBtn = 1;
        // 使直播列表select处于显示状态
        self.isShowOfSelect = true;
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.liveConcurrentChart.showLoading();
        self.liveUserZoneChart.showLoading();
        self.liveUserDeviceChart.showLoading();
        self.liveBrowserVersionChart.showLoading();
        self.liveFlowChart.showLoading();
        // 获取满足条件的开始、结束时间
        let nowDate = new Date();
        let nextDate = new Date(nowDate.getTime() + 1 * 24 * 3600 * 1000);

        let nowYear = nowDate.getFullYear();
        let nowMonth = (nowDate.getMonth() + 1) + '';
        let nowDay = nowDate.getDate() + '';

        if (nowMonth.length === 1) nowMonth = '0' + nowMonth;
        if (nowDay.length === 1) nowDay = '0' + nowDay;

        let startTimeOfToday = nowYear + '-' + nowMonth + '-' + nowDay + ' 00:00:00';
        let endTimeOfToday = nowYear + '-' + nowMonth + '-' + nowDay + ' 23:59:59';

        // 在开始时间、结束时间选择框中显示今天对应的开始、结束时间
        let todayStr = nowYear + '-' + nowMonth + '-' + nowDay;
        self.$calendarStart.val(todayStr);
        self.$calendarEnd.val(todayStr);
        // 获取今天的直播统计数据
        self.getCountData(startTimeOfToday, endTimeOfToday, 0);
        // 加载直播下拉列表的值
        self.getLiveListByCondition(startTimeOfToday, endTimeOfToday);
    }
    /* 获取某一时间段的直播列表 */
    getLiveListByCondition (startTime, endTime) {
        let self = this;
        let requestData = null;
        if (startTime && endTime) {
            requestData = {
                startTime: startTime,
                endTime: endTime
            }
        } else {
            return ;
        }
        // 获取直播列表数据
        self.remote.getLiveListByCondition (requestData)
            .then((res) => {
                let result = res.data;
                let resCode = result.code;
                let resDataList = result.data;
                if (resCode === "0") {
                    self.liveList = resDataList;
                } else {
                    self.warnInfoTipModal(result.message);
                }
            })
            .catch((error) => {
                self.warnInfoTipModal('服务器内部错误，请稍后重试');
            });
    }
    /* 得到昨天的统计数据 */
    getYesterdayData () {
        let self = this;
        // 使页面上的“昨天”按钮处于选中的状态
        self.currentBtn = 2;
        // 使直播列表select处于显示状态
        self.isShowOfSelect = true;
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.liveConcurrentChart.showLoading();
        self.liveUserZoneChart.showLoading();
        self.liveUserDeviceChart.showLoading();
        self.liveBrowserVersionChart.showLoading();
        self.liveFlowChart.showLoading();
        // 获取满足条件的开始、结束时间
        let nowDateTimestamp = new Date().getTime();
        let yesterday = new Date(nowDateTimestamp - 1 * 24 * 3600 * 1000);

        let yearOfYesterday = yesterday.getFullYear();
        let monthOfYesterday = (yesterday.getMonth() + 1) + '';
        let dateOfYesterday = yesterday.getDate() + '';

        if (monthOfYesterday.length === 1) monthOfYesterday = '0' + monthOfYesterday;
        if (dateOfYesterday.length === 1) dateOfYesterday = '0' + dateOfYesterday;

        let startTimeOfYesterday = yearOfYesterday + '-' + monthOfYesterday + '-' + dateOfYesterday + ' 00:00:00';
        let endTimeOfYesterday = yearOfYesterday + '-' + monthOfYesterday + '-' + dateOfYesterday + ' 23:59:59';

        // 在开始时间、结束时间选择框中显示昨天对应的开始、结束时间
        let yesterdayStr = yearOfYesterday + '-' + monthOfYesterday + '-' + dateOfYesterday;
        self.$calendarStart.val(yesterdayStr);
        self.$calendarEnd.val(yesterdayStr);
        // 获取昨天的直播统计数据
        self.getCountData(startTimeOfYesterday, endTimeOfYesterday, 0);
        // 加载直播下拉列表的值
        self.getLiveListByCondition(startTimeOfYesterday, endTimeOfYesterday);
    }
    /* 得到近一周的统计数据 */
    getOneWeekData () {
        let self = this;
        // 使页面上的“近一周”按钮处于选中的状态
        self.currentBtn = 3;
        // 使直播列表select处于隐藏状态
        self.isShowOfSelect = false;
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.liveConcurrentChart.showLoading();
        self.liveUserZoneChart.showLoading();
        self.liveUserDeviceChart.showLoading();
        self.liveBrowserVersionChart.showLoading();
        self.liveFlowChart.showLoading();
        // 获取开始时间、结束时间
        let nowDate = new Date();
        let nowDateTimestamp = nowDate.getTime();
        let beforeOneWeek = new Date(nowDateTimestamp - 6 * 24 * 3600 * 1000);

        let yearOfBeforeOneWeek = beforeOneWeek.getFullYear();
        let yearOfNowDate = nowDate.getFullYear();

        let monthOfBeforeOneWeek = (beforeOneWeek.getMonth() + 1) + '';
        let monthOfNowDate = (nowDate.getMonth() + 1) + '';

        let dateOfBeforeOneWeek = beforeOneWeek.getDate() + '';
        let dateOfNowDate = nowDate.getDate() + '';

        if (monthOfBeforeOneWeek.length === 1) monthOfBeforeOneWeek = '0' + monthOfBeforeOneWeek;
        if (monthOfNowDate.length === 1) monthOfNowDate = '0' + monthOfNowDate;

        if (dateOfBeforeOneWeek.length === 1) dateOfBeforeOneWeek = '0' + dateOfBeforeOneWeek;
        if (dateOfNowDate.length === 1) dateOfNowDate = '0' + dateOfNowDate;

        let startTime = yearOfBeforeOneWeek + '-' + monthOfBeforeOneWeek + '-' + dateOfBeforeOneWeek + ' 00:00:00';
        let endTime = yearOfNowDate + '-' + monthOfNowDate + '-' + dateOfNowDate + ' 23:59:59';

        // 在开始时间、结束时间选择框中显示近一周对应的开始、结束时间
        self.$calendarStart.val(yearOfBeforeOneWeek + '-' + monthOfBeforeOneWeek + '-' + dateOfBeforeOneWeek);
        self.$calendarEnd.val(yearOfNowDate + '-' + monthOfNowDate + '-' + dateOfNowDate);

        // 获取近一周的直播统计数据
        self.getCountData(startTime, endTime, 0);
    }
    /* 得到近一月的统计数据 */
    getOneMonthData () {
        let self = this;
        // 使页面上的“近一月”按钮处于选中的状态
        self.currentBtn = 4;
        // 使直播列表select处于隐藏状态
        self.isShowOfSelect = false;
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.liveConcurrentChart.showLoading();
        self.liveUserZoneChart.showLoading();
        self.liveUserDeviceChart.showLoading();
        self.liveBrowserVersionChart.showLoading();
        self.liveFlowChart.showLoading();
        // 获取开始时间、结束时间
        let nowDate = new Date();
        let nowDateTimestamp = nowDate.getTime();
        let beforeOneMonth = new Date(nowDateTimestamp - 29 * 24 * 3600 * 1000);

        let yearOfBeforeOneMonth = beforeOneMonth.getFullYear();
        let yearOfNowDate = nowDate.getFullYear();

        let monthOfBeforeOneMonth = (beforeOneMonth.getMonth() + 1) + '';
        let monthOfNowDate = (nowDate.getMonth() + 1) + '';

        let dateOfBeforeOneMonth = beforeOneMonth.getDate() + '';
        let dateOfNowDate = nowDate.getDate() + '';

        if (monthOfBeforeOneMonth.length === 1) monthOfBeforeOneMonth = '0' + monthOfBeforeOneMonth;
        if (monthOfNowDate.length === 1) monthOfNowDate = '0' + monthOfNowDate;

        if (dateOfBeforeOneMonth.length === 1) dateOfBeforeOneMonth = '0' + dateOfBeforeOneMonth;
        if (dateOfNowDate.length === 1) dateOfNowDate = '0' + dateOfNowDate;

        let startTime = yearOfBeforeOneMonth + '-' + monthOfBeforeOneMonth + '-' + dateOfBeforeOneMonth + ' 00:00:00';
        let endTime = yearOfNowDate + '-' + monthOfNowDate + '-' + dateOfNowDate + ' 23:59:59';

        // 在开始时间、结束时间选择框中显示近一月对应的开始、结束时间
        self.$calendarStart.val(yearOfBeforeOneMonth + '-' + monthOfBeforeOneMonth + '-' + dateOfBeforeOneMonth);
        self.$calendarEnd.val(yearOfNowDate + '-' + monthOfNowDate + '-' + dateOfNowDate);

        // 获取近一月的直播统计数据
        self.getCountData(startTime, endTime, 0);
    }
    /* 获取统计的数据*/
    getCountData (startTime, endTime, liveId) {
        let self = this;
        let requestData = null;
        !liveId || liveId === '0' ?
            requestData = {
                startTime: startTime,
                endTime: endTime
            } :
            requestData = {
                startTime: startTime,
                endTime: endTime,
                liveId: liveId
            }
        // 获取直播统计相关数据
        self.remote.getLiveCountData (requestData)
            .then((res) => {
                let result = res.data;
                let resCode = result.code;
                let resDataList = result.data;
                if (resCode === "0") {
                    // 渲染并发数统计图表
                    self.renderConcurrentChart(resDataList.timeline);
                    // 渲染用户分布地区统计图表
                    self.renderUserZoneChart(resDataList.region);
                    // 渲染用户设备统计图表
                    self.renderUserDeviceChart(resDataList.device);
                    // 渲染浏览器版本统计图表
                    self.renderBrowserVersionChart(resDataList.browser);
                    // 渲染流量统计图表
                    self.renderFlowChart(resDataList.timeline);
                } else {
                    self.warnInfoTipModal(result.message);
                }
            })
            .catch((error) => {
                self.warnInfoTipModal('服务器内部错误，请稍后重试');
                // 渲染并发数统计图表
                self.renderConcurrentChart(null);
                // 渲染用户分布地区统计图表
                self.renderUserZoneChart(null);
                // 渲染用户设备统计图表
                self.renderUserDeviceChart(null);
                // 渲染浏览器版本统计图表
                self.renderBrowserVersionChart(null);
                // 渲染流量统计图表
                self.renderFlowChart(null);
            });
    }
    /* 渲染并发数图表 */
    renderConcurrentChart (data) {
        let self = this;
        let option = {
            color:  [
                '#f36f6d'
            ],
            toolbox: {
                show : true,
                right: '30px',
                feature : {
                    magicType : {show: true, type: ['line', 'bar']}
                }
            },
            title: {
                text: '并发数量',
                x: 'center'
            },
            tooltip: {
                show: true,
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                    shadowStyle: {
                        color: '#e8f4fe',
                        width: '30px',
                        opacity: 0.8
                    }
                }
            },
            xAxis : [
                {
                    type : 'category',
                    data : data ? data.map(function (item) {
                        return item.time;
                    }) : '',
                    axisTick: {
                        alignWithLabel: true,
                        interval: 0
                    },
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    },
                    boundaryGap: true,
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    "name": "并发",
                    "type": "bar",
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barMaxWidth": '25px',
                    "data": data ? data.map(function (item) {
                        return item.simultaneous;
                    }) : ''
                }
            ]
        };
        self.liveConcurrentChart.hideLoading();
        self.liveConcurrentChart.setOption(option);
    }
    /* 渲染用户分布地区统计图表 */
    renderUserZoneChart (data) {
        let self = this;
        let userZoneOption = {
            color:  [
                '#169bd5'
            ],
            toolbox: {
                show : true,
                right: '30px',
                feature : {
                    magicType : {show: true, type: ['line', 'bar']}
                }
            },
            title: {
                text: '用户分布地区',
                x: 'center'
            },
            tooltip: {
                show: true,
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                    shadowStyle: {
                        color: '#e8f4fe',
                        width: '30px',
                        opacity: 0.8
                    }
                }
            },
            xAxis : [
                {
                    type : 'category',
                    axisTick: {
                        alignWithLabel: true,
                        interval: 0
                    },
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    },
                    boundaryGap: true,
                    data: data ? data.map(function (item) {
                        return item.name;
                    }) : '',
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    "size": ['60%', '60%'],
                    "name": "人数",
                    "type": "bar",
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barMaxWidth": '25px',
                    "data": data ? data.map(function (item) {
                        return item.value;
                    }) : '',
                }
            ]
        };
        self.liveUserZoneChart.hideLoading();
        self.liveUserZoneChart.setOption(userZoneOption);
    }
    /* 渲染用户设备统计图表 */
    renderUserDeviceChart (data) {
        let self = this;
        let legendOfData = null;
        let seriesOfData = null;
        if (data) {
            legendOfData = data.map(function (item) {
                return item.name;
            });
            seriesOfData = data;
        }
        let userDeviceOption = {
            color:  [
                '#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3'
            ],
            title : {
                text: '用户设备',
                'x': 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: '25%',
                data : legendOfData,
            },
            series : [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius : '70%',
                    center: ['50%', '50%'],
                    data : seriesOfData,
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        self.liveUserDeviceChart.hideLoading();
        self.liveUserDeviceChart.setOption(userDeviceOption);
    }
    /* 渲染浏览器版本统计图表 */
    renderBrowserVersionChart (data) {
        let self = this;
        let browserVersionOption = {
            color:  [
                '#f36f6d'
            ],
            toolbox: {
                show : true,
                right: '30px',
                feature : {
                    magicType : {show: true, type: ['line', 'bar']}
                }
            },
            title: {
                text: '浏览器版本',
                x: 'center'
            },
            tooltip: {
                show: true,
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                    shadowStyle: {
                        color: '#e8f4fe',
                        width: '30px',
                        opacity: 0.8
                    }
                }
            },
            xAxis : [
                {
                    type : 'category',
                    axisTick: {
                        alignWithLabel: true,
                        interval: 0
                    },
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    },
                    nameRotate: 30,
                    boundaryGap: true,
                    data : data ? data.map(function (item) {
                        return item.name;
                    }) : '',
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    "name": "个数",
                    "type": "bar",
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barMaxWidth": '25px',
                    "data": data ? data.map(function (item) {
                        return item.value;
                    }) : '',
                }
            ]
        };
        self.liveBrowserVersionChart.hideLoading();
        self.liveBrowserVersionChart.setOption(browserVersionOption);
    }
    /* 渲染流量统计图表 */
    renderFlowChart (data) {
        let self = this;
        let flowOption = {
            color:  [
                '#169bd5'
            ],
            toolbox: {
                show : true,
                right: '30px',
                feature : {
                    magicType : {show: true, type: ['line', 'bar']}
                }
            },
            title: {
                text: '流量（GB）',
                x: 'center'
            },
            tooltip: {
                show: true,
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                    shadowStyle: {
                        color: '#e8f4fe',
                        width: '30px',
                        opacity: 0.8
                    }
                }
            },
            xAxis : [
                {
                    type : 'category',
                    axisTick: {
                        alignWithLabel: true,
                        interval: 0
                    },
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    },
                    boundaryGap: true,
                    data : data ? data.map(function (item) {
                        return item.time;
                    }) : ''
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    "name": "流量（GB）",
                    "type": "line",
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barMaxWidth": '25px',
                    "data": data ? data.map(function (item) {
                        var traffic = item.traffic.toString();
                        traffic = traffic.indexOf(',') > -1 ? traffic.replace(/,/g, '') : traffic
                        return traffic;
                    }) : ''
                }
            ]
        };
        self.liveFlowChart.hideLoading();
        self.liveFlowChart.setOption(flowOption);
    }
    /* 执行搜索操作 */
    searchCountData () {
        let self = this;
        let startTime = $.trim(self.$calendarStart.val());
        let endTime = $.trim(self.$calendarEnd.val());
        let liveId = self.$liveListSelect.find('option:selected').val();
        // 判断开始时间是否为空
        if (!startTime) {
            self.warnInfoTipModal('请选择开始时间');
            return ;
        }
        // 判断结束时间是否为空
        if (!endTime) {
            self.warnInfoTipModal('请选择结束时间');
            return ;
        }
        // 判断选择的日期是否合法（如果是选择的话不存在合法的问题，但是如果用户是手动填写的话，就有可能）
        if (!self.timeReg.test(startTime)) {
            self.warnInfoTipModal('请选择合法的开始日期');
            return ;
        }
        if (!self.timeReg.test(endTime)) {
            self.warnInfoTipModal('请选择合法的结束日期');
            return ;
        }
        // 判断开始时间是否大于结束时间
        if (startTime > endTime) {
            self.warnInfoTipModal('开始时间不能大于结束时间');
            return ;
        }
        // 标准化时间格式
        startTime = startTime + ' 00:00:00';
        endTime = endTime + ' 23:59:59';
        // 加载loading
        self.liveConcurrentChart.showLoading();
        self.liveUserZoneChart.showLoading();
        self.liveBrowserVersionChart.showLoading();
        self.liveFlowChart.showLoading();
        // 获取统计数据
        self.getCountData(startTime, endTime, liveId);
    }
    /* 获取导出报表所需要的参数 (这个方法中的部分代码和searchCountData()方法对应的部分代码重复了，以后这块可以提出去，做个封装。)*/
    outputCharts () {
        let self = this;
        let startTime = $.trim(self.$calendarStart.val());
        let endTime = $.trim(self.$calendarEnd.val());
        let liveId = self.$liveListSelect.find('option:selected').val();
        // 判断是否选择了开始时间，即开始时间是否为空
        if (!startTime) {
            self.warnInfoTipModal('请选择开始时间');
            return ;
        }
        // 判断是否选择了结束时间，即结束时间是否为空
        if (!endTime) {
            self.warnInfoTipModal('请选择结束时间');
            return ;
        }
        // 判断选择的日期是否合法（如果是选择的话不存在合法的问题，但是如果用户是手动填写的话，就有可能）
        if (!self.timeReg.test(startTime)) {
            self.warnInfoTipModal('请选择合法的开始时间');
            return ;
        }
        if (!self.timeReg.test(endTime)) {
            self.warnInfoTipModal('请选择合法的结束时间');
            return ;
        }
        // 判断结束时间是否大于开始时间
        if (startTime > endTime) {
            self.warnInfoTipModal('开始时间不能大于结束时间');
            return ;
        }
        // 标准化时间格式
        startTime = startTime + ' 00:00:00';
        endTime = endTime + ' 23:59:59';
        self.outputChartsService(startTime, endTime, liveId);
    }
    // 导出报表 service
    outputChartsService (startTime, endTime, liveId) {
        let self = this;
        let newWindow = window.open();
        let requestData = null;
        // 根据liveId是否为空，来设置用于请求的数据
        liveId || liveId !== '0' ?
            requestData = {
                startTime: startTime,
                endTime: endTime,
                liveId: liveId
            } :
            requestData = {
                startTime: startTime,
                endTime: endTime
            }
        // 获取导出报表的url，并导出报表
        self.remote.getLiveURLOfOutputChart (requestData)
            .then((res) => {
                let result = res.data;
                let resCode = result.code;
                let resData = result.data;
                if (resCode === "0") {
                    newWindow.location.href = global.CHART_API_PATH + resData.url;
                } else {
                    self.warnInfoTipModal(result.message);
                }
            })
            .catch((error) => {
                self.warnInfoTipModal('导出报表失败，请稍后重试');
            });
    }
    /* 封装一个用于提示警告的模态框 */
    warnInfoTipModal (msg) {
        let $warnModal = $('#J-warn-modal');
        $warnModal.find('span').text(msg);
        $warnModal.fadeIn(1000);
        setTimeout(() => {
            $warnModal.fadeOut(1000)
        }, 1500)
    }
    signout() {
        this.session.clear();
        this.uiState.go('login');
    }
}