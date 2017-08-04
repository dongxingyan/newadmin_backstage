import {Page, IPageParams, page} from "../../../common/page";
import * as echarts from '../../../libs/echarts/echarts.min.js';
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IUseCountPageParams extends IPageParams {
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
    title: '使用统计',
    name: 'main.use-count'
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
class MainUse_CountPage extends Page<IUseCountPageParams> {
    currentBtn = 1;
    $calendarStart = $('#J-calendar-start');
    $calendarEnd = $('#J-calendar-end');
    maxWidth = $('.meeting-duration-chart-row').innerWidth();
    meetingTime = null;
    meetingConcurrent = null;
    meetingDurationTime = null;
    meetingRoomDuration = null;
    participantTotalDuration = null;
    meetingUseTimeChart = null;
    meetingTimesChart = null;
    meetingConcurrentChart = null;
    meetingRoomStr = null;
    timeReg: null;
    $meetingDurationTable: null;

    init(timeout: angular.ITimeoutService) {
        let self = this;
        // 用于判断日期是否合法的正则表达式
        self.timeReg = /^(\d{4})\-(\d{2})\-(\d{2})$/;
        self.$meetingDurationTable = $('#J-meeting-duration-table');
        // 基于已准备好的dom，初始化ECharts实例。
        self.meetingUseTimeChart = echarts.init(document.getElementById('meeting-use-times'));
        self.meetingTimesChart = echarts.init(document.getElementById('meeting-times'));
        self.meetingConcurrentChart = echarts.init(document.getElementById('meeting-concurrent'));
        // 初始化一加载就执行的方法
        self.activationTimePlugIn ();   // 初始化时间插件
        self.getOneWeekData ();         // 获取近一周的使用数据
        self.meetingTimesChartClick (); // 点击会议室使用次数图表的某一item，获取相应的数据并重新渲染其对应的列表
        self.meetingConcurrentChartClick ();    // 点击最高并发图表的某一item，获取相应的数据并重新渲染其对应的列表
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
    /* 得到近一周的统计数据 */
    getOneWeekData () {
        let self = this;
        // 使页面上的“近一周”按钮处于选中的状态
        self.currentBtn = 1;
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.meetingUseTimeChart.showLoading();
        self.meetingTimesChart.showLoading();
        self.meetingConcurrentChart.showLoading();

        let preWeekTimeStamp = new Date().getTime();
        let preWeekOfDate = new Date(preWeekTimeStamp - 7 * 24 * 3600 * 1000);
        let nowDate = new Date();
        // 先把时间字符串转换称日期格式
        let preWeekOfYear = preWeekOfDate.getFullYear() + '';
        let nowYear = nowDate.getFullYear() + '';

        let preWeekOfMonth = (preWeekOfDate.getMonth() + 1) + '';
        let nowMonth = (nowDate.getMonth() + 1) + '';

        let preWeekOfDay = preWeekOfDate.getDate() + '';
        let date = nowDate.getDate() + '';

        // 格式化每个日期节点的个数
        if (preWeekOfMonth.length === 1) preWeekOfMonth = '0' + preWeekOfMonth;
        if (nowMonth.length === 1) nowMonth = '0' + nowMonth;

        if (preWeekOfDay.length === 1) preWeekOfDay = '0' + preWeekOfDay;
        if (date.length === 1) date = '0' + date;

        // 开始时间、结束时间（前一周的时间作为开始时间，现在的时间作为结束时间）
        let preOneWeek = preWeekOfYear + '-' + preWeekOfMonth + '-' + preWeekOfDay ;
        nowDate = nowYear + '-' + nowMonth + '-' + date;

        self.$calendarStart.val(preOneWeek);
        self.$calendarEnd.val(nowDate);

        self.getCountData(preOneWeek, nowDate, self.meetingRoomStr);
    }
    /* 得到近一月的统计数据 */
    getOneMonthData () {
        let self = this;
        // 使页面上“近一月”处于被选中状态
        self.currentBtn = 2;
        $('.meeting-duration-table-row').css({
            'maxWidth': self.maxWidth
        });
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.meetingUseTimeChart.showLoading();
        self.meetingTimesChart.showLoading();
        self.meetingConcurrentChart.showLoading();
        // 获取满足条件的开始时间、结束时间
        let nowDate = new Date();
        // 先把时间字符串转换称日期格式
        // 如果是某年的一月份 则前一个月为上一年的12月
        let nowYear = nowDate.getFullYear();
        let preMonth = nowDate.getMonth();
        if(!preMonth) {
            preMonth = 12 + '';
            nowYear = (nowYear - 1) + '';
        } else {
            preMonth = preMonth + '';
            nowYear = nowYear + '';
        }
        let nowMonth = (nowDate.getMonth() + 1) + '';
        let date = nowDate.getDate() + '';

        // 格式化每个日期节点的个数
        if (preMonth.length === 1) preMonth = '0' + preMonth;
        if (nowMonth.length === 1) nowMonth = '0' + nowMonth;
        if (date.length === 1) date = '0' + date;

        // 开始时间、结束时间（前一月的时间作为开始时间，现在的时间作为结束时间）
        let preOneMonth = nowYear + '-' + preMonth + '-' + date;
        nowDate = nowYear + '-' + nowMonth + '-' + date;

        self.$calendarStart.val(preOneMonth);
        self.$calendarEnd.val(nowDate);

        self.getCountData(preOneMonth, nowDate, self.meetingRoomStr, 1);
    }
    /* 得到近一年的统计数据 */
    getOneYearData () {
        let self = this;
        // 使页面上的“近一年”按钮处于选中的状态
        self.currentBtn = 3;
        self.$meetingDurationTable.css('width', '');
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.meetingUseTimeChart.showLoading();
        self.meetingTimesChart.showLoading();
        self.meetingConcurrentChart.showLoading();
        // 获取满足条件的开始时间、结束时间
        let nowDate = new Date();
        // 先把时间字符串转换称日期格式
        let prevYear = nowDate.getFullYear() - 1 + '';
        let nowYear = nowDate.getFullYear() + '';
        let month = (nowDate.getMonth() + 1) + '';
        let date = nowDate.getDate() + '';

        // 格式化每个日期节点的个数
        if (month.length === 1) month = '0' + month;
        if (date.length === 1) date = '0' + date;

        // 开始时间、结束时间（前一年的时间作为开始时间，现在的时间作为结束时间）
        let preOneYear = prevYear + '-' + month + '-' + date;
        nowDate = nowYear + '-' + month + '-' + date;

        self.$calendarStart.val(preOneYear);
        self.$calendarEnd.val(nowDate);

        self.getCountData(preOneYear, nowDate, self.meetingRoomStr);
    }
    /* 获取统计数据 公共的方法 */
    getCountData (startTime, endTime, meetingRoomStr) {
        let self = this;
        let requestData = null;
        if (!meetingRoomStr) {
            requestData = {
                'startTime': startTime + ' 00:00:00',
                'endTime': endTime + ' 00:00:00',
            }
        } else {
            requestData = {
                'startTime': startTime + ' 00:00:00',
                'endTime': endTime + ' 00:00:00',
                'vmrList': meetingRoomStr.replace(/，/g, ",")
            }
        }
        // 获取会议统计相关数据
        self.remote.getConferenceCount (requestData)
            .then((res) => {
                let result = res.data;
                let resCode = result.code;
                let resDataList = result.data;
                if (resCode === "0") {
                    self.renderMeetingTimesChart(resDataList.timeline);
                    self.meetingTime = resDataList.vmrDetail;
                } else {
                    self.warnInfoTipModal(result.message);
                }
            })
            .catch((error) => {
                self.warnInfoTipModal('获取会议室使用次数失败，请稍后重试');
            });
        // 获取并发统计相关数据
        self.remote.getSimultaneousCount (requestData)
            .then((res) => {
                let result = res.data;
                let resCode = result.code;
                let resDataList = result.data;
                if (resCode === "0") {
                    self.renderConcurrentChart(resDataList.timeline);
                    self.meetingConcurrent = resDataList.vmrDetail;
                } else {
                    self.warnInfoTipModal(result.message);
                }
            })
            .catch((error) => {
                self.warnInfoTipModal('获取最高并发数失败，请稍后重试');
            });
        // 获取会议时长统计相关数据
        self.remote.getDurationCount (requestData)
            .then((res) => {
                let result = res.data;
                let resCode = result.code;
                let resDataList = result.data;
                if (resCode === "0") {
                    // 用相应的数据 去渲染会议时长图表
                    self.renderMeetingDurationChart(resDataList);
                    /* 渲染会议时长表格 */
                    // 获取会议时长表格的时间那一行对应的数据
                    let participantData = resDataList.participant;
                    self.meetingDurationTime =
                        participantData ?
                            participantData.map((item) => {
                                return arguments[3] === 1 ? item.time.slice(5) : item.time;
                            }) : '';
                    // 获取会议时长表格 会议室时长那一行对应的数据
                    let meetingRoomDurationData = resDataList.conference;
                    self.meetingRoomDuration =
                        meetingRoomDurationData ?
                            meetingRoomDurationData.map((item) => {
                                return item.duration ? (Math.ceil(item.duration / 60) / 60).toFixed(1) : 0
                            }) : '';
                    // 获取会议时长表格 参会总时长那一行对应的数据
                    let participantTotalTimeData = resDataList.participant;
                    self.participantTotalDuration  =
                        participantTotalTimeData ?
                            participantTotalTimeData.map((item) => {
                                return item.duration ? (Math.ceil(item.duration / 60) / 60).toFixed(1) : '0.0'
                            }) : '';
                } else {
                    self.warnInfoTipModal(result.message);
                }
            })
            .catch((error) => {
                self.warnInfoTipModal('获取会议时长失败，请稍后重试');
            });
    }
    /* 渲染会议室使用次数图表 */
    renderMeetingTimesChart (data) {
        let self = this;
        // 指定图表的配置项和数据
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
                text: '会议室使用次数',
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
                    data : data.map(function (item) {
                        return item.time;
                    }),
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
                    "name": "次数",
                    "type": "bar",
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barWidth": '15px',
                    "barMaxWidth": '15px',
                    "data": data.map(function (item) {
                        return item.totalCount;
                    })
                }
            ]
        };
        // 取消图表loading的加载
        self.meetingUseTimeChart.hideLoading();
        // 使用刚指定的配置项和数据显示图表
        self.meetingUseTimeChart.setOption(option);
    }
    /* 渲染最高并发图表 */
    renderConcurrentChart (data) {
        let self = this;
        // 指定图表的配置项和数据
        let concurrentOption = {
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
                text: '最高并发',
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
                        alignWithLabel: true
                    },
                    boundaryGap: true,
                    data : data.map(function (item) {
                        return item.time;
                    })
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    "name": "并发数",
                    "type": "bar",
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barWidth": '15px',
                    "barMaxWidth": '15px',
                    "data": data.map(function (item) {
                        return item.simultaneous;
                    })
                }
            ]
        };
        // 取消图表loading的加载
        self.meetingConcurrentChart.hideLoading();
        // 使用刚指定的配置项和数据显示图表
        self.meetingConcurrentChart.setOption(concurrentOption);
    }
    /* 渲染会议时长图表 */
    renderMeetingDurationChart (data) {
        let self = this;
        // 指定图表的配置项和数据
        let meetingTimesOption = {
            color:  [
                '#1d94f5', '#ffa800'
            ],
            title : {
                text: '会议时长（小时）',
                'x': 'center'
            },
            tooltip : {
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
            legend: {
                data:['会议室时长','参会总时长'],
                top: 'top',
                left: 'left'
            },
            toolbox: {
                show : true,
                right: '30px',
                feature : {
                    magicType : {show: true, type: ['line', 'bar']},
                }
            },

            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    data : data.conference.map(function (item) {
                        return item.time;
                    }),
                    axisTick: {
                        alignWithLabel: true
                    },
                    boundaryGap: true,
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} 小时'
                    }
                }
            ],
            series : [
                {
                    name:'参会总时长',
                    type:'line',
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barWidth": '15px',
                    "barMaxWidth": '15px',
                    data: data.participant.map(function (item) {
                        return (Math.ceil(item.duration / 60) / 60).toFixed(1);
                    }),
                },
                {
                    name:'会议室时长',
                    type:'line',
                    "label": {
                        normal: {
                            show: true,
                            position: 'top'
                        }
                    },
                    "barWidth": '15px',
                    "barMaxWidth": '15px',
                    data: data.conference.map(function (item) {
                        return (Math.ceil(item.duration / 60) / 60).toFixed(1);
                    }),
                }
            ]
        };
        // 取消图表loading的加载
        self.meetingTimesChart.hideLoading();
        // 使用刚指定的配置项和数据显示图表
        self.meetingTimesChart.setOption(meetingTimesOption);
    }
    /* 会议室使用次数图表点击事件 获取详情 */
    meetingTimesChartClick () {
        let self = this;
        self.meetingUseTimeChart.on('click', (params) => {
            let paramsName = params.name;   // 获取横坐标
            let requestData = null;
            let startTime = '';
            let endTime = '';
            if (paramsName.length <= 7) {
                startTime = paramsName + '-01 00:00:00';
                var currentYear = paramsName.substring(0, 4);
                var currentMonth = paramsName.substring(5);
                if (currentMonth == '12') {
                    // 如果当前月是12月
                    endTime = paramsName + '-31 23:59:59';
                } else if (currentMonth < '12'){
                    // 否则的话(不是12月)
                    endTime = currentYear + '-' + (Number(currentMonth) + 1) + '-01 00:00:00';
                }
            } else {
                startTime = paramsName + ' 00:00:00';
                endTime = paramsName + ' 23:59:59';
            }
            self.meetingRoomStr ?
                requestData = {
                    'startTime': startTime,
                    'endTime': endTime,
                    'vmrList': self.meetingRoomStr.replace(/，/g, ",")
                } :
                requestData = {
                    'startTime': startTime,
                    'endTime': endTime,
                }
            // 获取会议统计相关数据
            self.remote.getConferenceCount (requestData)
                .then((res) => {
                    let result = res.data;
                    let resCode = result.code;
                    let resDataList = result.data;
                    if (resCode === "0") {
                        self.meetingTime = resDataList.vmrDetail;
                    } else {
                        self.warnInfoTipModal(result.message);
                    }
                })
                .catch((error) => {
                    self.warnInfoTipModal('获取会议室使用次数失败，请稍后重试');
                });
        })
    }
    /* 最高并发图表点击事件 获取详情 */
    meetingConcurrentChartClick () {
        let self = this;
        self.meetingConcurrentChart.on('click', (params) => {
            let paramsName = params.name;   // 获取横坐标
            let requestData = null;
            let startTime = '';
            let endTime = '';
            if (paramsName.length <= 7) {
                startTime = paramsName + '-01 00:00:00';
                let currentYear = paramsName.substring(0, 4);
                let currentMonth = paramsName.substring(5);
                if (currentMonth == '12') {
                    // 如果当前月是12月
                    endTime = paramsName + '-31 23:59:59';
                } else if (currentMonth < '12'){
                    // 否则的话(不是12月)
                    endTime = currentYear + '-' + (Number(currentMonth) + 1) + '-01 00:00:00';
                }
            } else {
                startTime = paramsName + ' 00:00:00';
                endTime = paramsName + ' 23:59:59';
            }
            self.meetingRoomStr ?
                requestData = {
                    'startTime': startTime,
                    'endTime': endTime,
                    'vmrList': self.meetingRoomStr.replace(/，/g, ",")
                } :
                requestData = {
                    'startTime': startTime,
                    'endTime': endTime,
                }
            // 获取并发统计相关数据
            self.remote.getSimultaneousCount (requestData)
                .then((res) => {
                    let result = res.data;
                    let resCode = result.code;
                    let resDataList = result.data;
                    if (resCode === "0") {
                        self.meetingConcurrent = resDataList.vmrDetail;
                    } else {
                        self.warnInfoTipModal(result.message);
                    }
                })
                .catch((error) => {
                    self.warnInfoTipModal('获取并发数据失败，请稍后重试');
                });
        })
    }
    /* 执行搜索操作 */
    searchCountData () {
        let self = this;
        let startTime = self.$calendarStart.val();
        let endTime = self.$calendarEnd.val();
        let meetingRoomStr = self.meetingRoomStr;
        /* 前期准备 条件判断 */
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
        // 搜索多个会议室会使用英文逗号隔开，如果用户手误输成了中文逗号。在这里就直接做转换了。
        if (meetingRoomStr && meetingRoomStr.indexOf('，') != -1) {
            meetingRoomStr.replace(/，/g, ',');
        }
        // 判断结束时间是否大于开始时间
        if (startTime > endTime) {
            self.warnInfoTipModal('开始时间不能大于结束时间');
            return ;
        }
        /* 渲染图表 */
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        self.meetingUseTimeChart.showLoading();
        self.meetingTimesChart.showLoading();
        self.meetingConcurrentChart.showLoading();
        // 获取指定条件下的数据
        self.getCountData(startTime + ' 00:00:00', endTime + ' 00:00:00', meetingRoomStr);
    }
    /* 获取导出报表所需要的参数 (这个方法中的部分代码和searchCountData()方法对应的部分代码重复了，以后这块可以提出去，做个封装。)*/
    outputCharts () {
        let self = this;
        let startTime = self.$calendarStart.val();
        let endTime = self.$calendarEnd.val();
        let meetingRoomStr = self.meetingRoomStr;
        /* 前期准备 条件判断 */
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
        // 搜索多个会议室会使用英文逗号隔开，如果用户手误输成了中文逗号。在这里就直接做转换了。
        if (meetingRoomStr && meetingRoomStr.indexOf('，') != -1) {
            meetingRoomStr.replace(/，/g, ',');
        }
        // 判断结束时间是否大于开始时间
        if (startTime > endTime) {
            self.warnInfoTipModal('开始时间不能大于结束时间');
            return ;
        }
        self.outputChartsService(startTime, endTime, meetingRoomStr);
    }
    // 导出报表 service
    outputChartsService (startTime, endTime, meetingRoomStr) {
        let self = this;
        let newWindow = window.open();
        let requestData = null;
        // 根据meetingRoomStr是否为空，来设置用于请求的数据
        meetingRoomStr ?
            requestData = {
                startTime: startTime + ' 00:00:00',
                endTime: endTime + ' 00:00:00',
                vmrList: meetingRoomStr.replace(/，/g, ',')
            } :
            requestData = {
                startTime: startTime + ' 00:00:00',
                endTime: endTime + ' 00:00:00'
            }
        // 获取导出报表的url，并导出报表
        self.remote.getURLOfOutputChart (requestData)
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