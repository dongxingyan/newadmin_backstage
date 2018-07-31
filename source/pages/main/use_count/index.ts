import { Page, IPageParams, page } from 'common/page';
import * as echarts from 'libs/echarts/echarts.min.js';
import { global } from 'common/global';
import * as laydate from 'layui-laydate/dist/laydate';
import 'layui-laydate/dist/theme/default/laydate.css';
import formatDate from 'utils/format-date';
import langUtil from 'utils/language';

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
    calendarStart;
    calendarEnd;
    meetingTime;
    meetingConcurrent;
    meetingDurationTime;
    meetingRoomDuration;
    participantTotalDuration;
    meetingUseTimeChart;
    meetingTimesChart;
    meetingConcurrentChart;
    meetingRoomStr;
    timeReg;
    $meetingDurationTable;
    hasDataOfMeetingTimes = true;
    hasDataOfSimultaneous = true;
    hasDataOfDuration = true;

    init(timeout: angular.ITimeoutService) {
        timeout(()=>{
            this.activationTimePlugIn ();   // 初始化时间插件
        },50)
        // 用于判断日期是否合法的正则表达式
        this.timeReg = /^(\d{4})\-(\d{2})\-(\d{2})$/;
        this.$meetingDurationTable = $('#J-meeting-duration-table');
        // 基于已准备好的dom，初始化ECharts实例。
        this.initOfEchart();
        // 初始化一加载就执行的方法
        this.getOneWeekData ();         // 获取近一周的使用数据
        this.meetingTimesChartClick (); // 点击会议室使用次数图表的某一item，获取相应的数据并重新渲染其对应的列表
        this.meetingConcurrentChartClick ();    // 点击最高并发图表的某一item，获取相应的数据并重新渲染其对应的列表
    }
    initOfEchart () {
        this.meetingUseTimeChart = echarts.init(document.getElementById('meeting-use-times'));
        this.meetingTimesChart = echarts.init(document.getElementById('meeting-times'));
        this.meetingConcurrentChart = echarts.init(document.getElementById('meeting-concurrent'));
    }
    /* 判断当前环境所对应的语言 */
    judgeLanguage () {
        let isEnglish = localStorage.getItem('lang') && localStorage.getItem('lang').indexOf('en-us') > -1;

        return isEnglish ? 'en' : '';
    }
    /* 激活时间插件 */
    activationTimePlugIn () {
        let
            _this = this,
            start = {
                elem: '#J-calendar-start',
                lang: this.judgeLanguage(),
                format: 'yyyy-MM-dd',
                isclear: false,
                istoday: false,
                festival: true,
                fixed: false,
                istime: true,
                done (value) {
                    _this.calendarStart = value;
                }
            },
            end = {
                elem: '#J-calendar-end',
                lang: this.judgeLanguage(),
                format: 'yyyy-MM-dd',
                istime: true,
                istoday: false,
                done (value) {
                    _this.calendarEnd = value;
                }
            };
        laydate.render(start);
        laydate.render(end);
    }
    /* 得到近一周的统计数据 */
    getOneWeekData () {
        let
            startTime = formatDate.lastWeekDate(),
            endTime   = formatDate.nowDate();
        // 使页面上的“近一周”按钮处于选中的状态
        this.currentBtn = 1;

        this.calendarStart = startTime;
        this.calendarEnd = endTime;

        this.getCountData(startTime, endTime, this.meetingRoomStr);
    }
    /* 得到近一月的统计数据 */
    getOneMonthData () {
        let
            startTime = formatDate.lastMonthDate(),
            endTime   = formatDate.nowDate();

        // 使页面上“近一月”处于被选中状态
        this.currentBtn = 2;

        this.calendarStart = startTime;
        this.calendarEnd = endTime;

        this.getCountData(startTime, endTime, this.meetingRoomStr);
    }
    /* 得到近一年的统计数据 */
    getOneYearData () {
        let
            startTime = formatDate.lastYearDate(),
            endTime   = formatDate.nowDate();

        // 使页面上的“近一年”按钮处于选中的状态
        this.currentBtn = 3;

        this.calendarStart = startTime;
        this.calendarEnd = endTime;

        this.getCountData(startTime, endTime, this.meetingRoomStr);
    }
    /* 获取统计数据 公共的方法 */
    getCountData (startTime, endTime, meetingRoomStr) {
        // 在获取数据进行渲染之前，使对应的图表处于加载的状态
        this.meetingUseTimeChart.showLoading();
        this.meetingTimesChart.showLoading();
        this.meetingConcurrentChart.showLoading();

        let
            requestData = {
                startTime: `${ startTime } 00:00:00`,
                endTime: `${ endTime } 00:00:00`,
            };

        if (meetingRoomStr) {
            requestData['vmrList'] = meetingRoomStr.replace(/，/g, ',')
        }
        // 获取会议统计相关数据
        this.remote.getConferenceCount (requestData)
            .then((res) => {
                this.meetingUseTimeChart.hideLoading();

                let
                    result      = res.data,
                    resCode     = result.code,
                    resDataList = result.data;

                if (resCode == '0') {
                  if (resDataList.timeline.length || resDataList.vmrDetail.length) {
                      this.hasDataOfMeetingTimes = true;
                      this.renderMeetingTimesChart(resDataList.timeline);
                      this.meetingTime = resDataList.vmrDetail;
                  } else {
                    this.hasDataOfMeetingTimes = false;
                  }
                } else {
                    this.rootScope.toggleInfoModal(4, result.message);
                }
            })
            .catch((error) => {
                this.meetingUseTimeChart.hideLoading();
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP7'));
            });
        // 获取并发统计相关数据
        this.remote.getSimultaneousCount (requestData)
            .then((res) => {
                this.meetingConcurrentChart.hideLoading();
                let
                    result      = res.data,
                    resCode     = result.code,
                    resDataList = result.data;
                if (resCode == '0') {
                  if (resDataList.timeline.length || resDataList.vmrDetail.length) {
                    this.hasDataOfSimultaneous = true;
                    this.renderConcurrentChart(resDataList.timeline);
                    this.meetingConcurrent = resDataList.vmrDetail;
                  } else {
                    //没有并发数据
                    this.hasDataOfSimultaneous = false;
                  }
                } else {
                    this.rootScope.toggleInfoModal(4, result.message);
                }
            })
            .catch((error) => {
                this.meetingConcurrentChart.hideLoading();
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP8'));
            });
        // 获取会议时长统计相关数据
        this.remote.getDurationCount (requestData)
            .then((res) => {
                let
                    result      = res.data,
                    resCode     = result.code,
                    resDataList = result.data;

                if (resCode == '0') {
                  if (resDataList.conference.length) {
                      this.hasDataOfDuration = true;

                    // 用相应的数据 去渲染会议时长图表
                    this.renderMeetingDurationChart(resDataList);
                    /* 渲染会议时长表格 */
                    // 获取会议时长表格的时间那一行对应的数据
                    let participantData = resDataList.participant;
                    this.meetingDurationTime =
                        participantData ?
                            participantData.map((item) => {
                                return arguments[3] === 1 ? item.time.slice(5) : item.time;
                            }) : '';
                    // 获取会议时长表格 会议室时长那一行对应的数据
                    let meetingRoomDurationData = resDataList.conference;
                    this.meetingRoomDuration =
                        meetingRoomDurationData ?
                            meetingRoomDurationData.map((item) => {
                                return formatDate.secondsToHour(item.duration)
                            }) : '';
                    // 获取会议时长表格 参会总时长那一行对应的数据
                    let participantTotalTimeData = resDataList.participant;
                    this.participantTotalDuration  =
                        participantTotalTimeData ?
                            participantTotalTimeData.map((item) => {
                                return formatDate.secondsToHour(item.duration)
                            }) : '';
                  } else {
                      this.hasDataOfDuration = false;
                  }
                } else {
                    this.rootScope.toggleInfoModal(4, result.message);
                }
            })
            .catch((error) => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP9'));
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
                text: this.translate.instant('ADMIN_USE_COUNT'),
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
                    "name": this.translate.instant('ADMIN_COUNT'),
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
                text: this.translate.instant('ADMIN_HIGHEST'),
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
                    "name": this.translate.instant('ADMIN_CONCURRENCY1'),
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
                text: this.translate.instant('ADMIN_HOURS'),
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
                data:[this.translate.instant('ADMIN_LENGTH'),this.translate.instant('ADMIN_TOTAL_LENGTH')],
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
                        formatter: '{value}'
                    }
                }
            ],
            series : [
                {
                    name:this.translate.instant('ADMIN_TOTAL_LENGTH'),
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
                    name:this.translate.instant('ADMIN_LENGTH'),
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
        this.meetingUseTimeChart.on('click', (params) => {
            let
                paramsName = params.name,   // 获取横坐标
                requestData = {},
                startTime = '',
                endTime = '';

            if (paramsName.length <= 7) {
                startTime = `${ paramsName }-01 00:00:00`;
                endTime = formatDate.nextMonthDate(startTime);
            } else {
                startTime = `${ paramsName } 00:00:00`;
                endTime = `${ paramsName } 23:59:59`;
            }

            requestData = {
                startTime,
                endTime
            };

            if (this.meetingRoomStr) {
                requestData['vmrList'] = this.meetingRoomStr.replace(/，/g, ',');
            }

            // 获取会议统计相关数据
            this.remote.getConferenceCount (requestData)
                .then((res) => {
                    let
                        result      = res.data,
                        resCode     = result.code,
                        resDataList = result.data;

                    if (resCode == '0') {
                        this.meetingTime = resDataList.vmrDetail;
                    } else {
                        this.rootScope.toggleInfoModal(4, result.message);
                    }
                })
                .catch((error) => {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP7'));
                });
        })
    }
    /* 最高并发图表点击事件 获取详情 */
    meetingConcurrentChartClick () {
        this.meetingConcurrentChart.on('click', (params) => {
            let
                paramsName  = params.name,   // 获取横坐标
                requestData = {},
                startTime   = '',
                endTime     = '';

            if (paramsName.length <= 7) {
                startTime = `${ paramsName }-01 00:00:00`;
                endTime = formatDate.nextMonthDate(startTime);
            } else {
                startTime = `${ paramsName } 00:00:00`;
                endTime = `${ paramsName } 23:59:59`;
            }

            requestData = {
                startTime,
                endTime
            };

            if (this.meetingRoomStr) {
                requestData['vmrList'] = this.meetingRoomStr.replace(/，/g, ',');
            }

            // 获取并发统计相关数据
            this.remote.getSimultaneousCount (requestData)
                .then((res) => {
                    let
                        result      = res.data,
                        resCode     = result.code,
                        resDataList = result.data;

                    if (resCode == '0') {
                        this.meetingConcurrent = resDataList.vmrDetail;
                    } else {
                        this.rootScope.toggleInfoModal(4, result.message);
                    }
                })
                .catch((error) => {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP10'));
                });
        })
    }
    /* 执行搜索操作 */
    searchCountData () {
        let
            startTime      = this.calendarStart,
            endTime        = this.calendarEnd,
            meetingRoomStr = this.meetingRoomStr;

        // 判断是否选择了开始时间，即开始时间是否为空
        if (!startTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP12'));
            return false;
        }
        // 判断是否选择了结束时间，即结束时间是否为空
        if (!endTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP13'));
            return false;
        }
        // 判断选择的日期是否合法（如果是选择的话不存在合法的问题，但是如果用户是手动填写的话，就有可能）
        if (!this.timeReg.test(startTime)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP15'));
            return false;
        }
        if (!this.timeReg.test(endTime)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP16'));
            return false;
        }
        // 搜索多个会议室会使用英文逗号隔开，如果用户手误输成了中文逗号。在这里就直接做转换了。
        if (meetingRoomStr && meetingRoomStr.indexOf('，') != -1) {
            meetingRoomStr.replace(/，/g, ',');
        }
        // 判断结束时间是否大于开始时间
        if (startTime > endTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP14'));
            return false;
        }
        this.getCountData(startTime, endTime, meetingRoomStr);
    }
    /* 获取导出报表所需要的参数 (这个方法中的部分代码和searchCountData()方法对应的部分代码重复了，以后这块可以提出去，做个封装。)*/
    outputCharts () {
        let
            startTime      = this.calendarStart,
            endTime        = this.calendarEnd,
            meetingRoomStr = this.meetingRoomStr;

        // 判断是否选择了开始时间，即开始时间是否为空
        if (!startTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP12'));
            return ;
        }
        // 判断是否选择了结束时间，即结束时间是否为空
        if (!endTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP13'));
            return ;
        }
        // 判断选择的日期是否合法（如果是选择的话不存在合法的问题，但是如果用户是手动填写的话，就有可能）
        if (!this.timeReg.test(startTime)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP15'));
            return ;
        }
        if (!this.timeReg.test(endTime)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP16'));
            return ;
        }
        // 搜索多个会议室会使用英文逗号隔开，如果用户手误输成了中文逗号。在这里就直接做转换了。
        if (meetingRoomStr && meetingRoomStr.indexOf('，') != -1) {
            meetingRoomStr.replace(/，/g, ',');
        }
        // 判断结束时间是否大于开始时间
        if (startTime > endTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP14'));
            return ;
        }
        this.outputChartsService(startTime, endTime, meetingRoomStr);
    }
    // 导出报表 service
    outputChartsService (startTime, endTime, meetingRoomStr) {
        let
            newWindow = window.open(),
            requestData = {
                startTime: `${ startTime } 00:00:00`,
                endTime: `${ endTime } 00:00:00`,
                language: langUtil.getLanguage()
            };

        if (meetingRoomStr) {
            requestData['vmrList'] = meetingRoomStr.replace(/，/g, ',');
        }

        // 获取导出报表的url，并导出报表
        this.remote.getURLOfOutputChart (requestData)
            .then((res) => {
                let
                    result  = res.data,
                    resCode = result.code,
                    resData = result.data;

                if (resCode == '0') {
                    newWindow.location.href = global.CHART_API_PATH + resData.url;
                } else {
                    this.rootScope.toggleInfoModal(4, result.message);
                }
            })
            .catch((error) => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP11'));
            });
    }
}
