import {Page, IPageParams, page} from 'common/page';
import * as echarts from 'libs/echarts/echarts.min.js';
import formatDate from 'utils/format-date';

// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');

// 路由参数的设置
interface IStatusPageParams extends IPageParams {
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
    title: "",
    name: 'main.status'
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
class MainStatusPage extends Page<IStatusPageParams> {
    name: '';
    department;//所属机构
    count;//会议室总数
    deviceAccount;//设备账号
    userAccount;//用户账号
    account
    total
    meetingDurationChart
    activeMeetingInfoList

    init(timeout: angular.ITimeoutService) {
        this.pathTurnSession();
        this.getDepartmentInfo();       // 获取机构信息
        this.getTotalMeetingRoom();     // 获取会议室总数
        this.getDeviceAccount();        // 获取设备账号
        this.getUserAccount();          // 获取用户账号
        this.getChartDataOfChannel();   // 获取统计数据
        this.getActiveConference();     // 获取实时会议信息
        this.meetingDurationChart = echarts.init(document.getElementById('container'));
    }
    // 官网试用跳转, 获取localStorage数据转移到sessionStorage，然后删除
    pathTurnSession() {
        let url =  document.location.search; //获取url中"?"符后的字串
        if (url.indexOf("?") != -1) {
            let arr = url.substr(1).split('&');
            for (let item of arr.values()) {
                let dataArr = item.split('=');
                sessionStorage.setItem(dataArr[0], dataArr[1]);
            }
        }
    }
    // 获取机构信息
    getDepartmentInfo () {
        this.remote.getDepartment()
            .then((res) => {
                if (res.data.code === '0')
                    this.department = res.data.data.name;
            })
    }
    // 获取会议室总数
    getTotalMeetingRoom () {
        this.remote.totalCount()
            .then((res)=> {
                if (res.data.code == "0") {
                    this.count = res.data.data.count;
                }
            })
    }
    // 获取设备账号
    getDeviceAccount () {
        this.remote.getDeviceAccount()
            .then((res)=> {
                this.deviceAccount = res.data.data.count;
            })
    }
    // 获取用户账号
    getUserAccount () {
        this.remote.getUserAccount()
            .then((res)=> {
                this.userAccount = res.data.data.count;
            })
    }
    // 获取统计的数据
    getChartDataOfChannel () {
        // 获取请求参数
        let requestData = {
            startTime: `${formatDate.lastMonthDate()} 00:00:00`,
            endTime: `${formatDate.nowDate()} 00:00:00`
        }
        // 获取会议室使用次数
        this.getMeetingTimesData(requestData, meetingResponse => {
            this.getConcurrentData(requestData, concurrentResponse => {
                // 渲染会议使用图表
                this.renderMeetingUseChart(meetingResponse, concurrentResponse)
            })
        })
    }
    // 获取会议室使用次数 数据
    getMeetingTimesData (requestData, callback) {
        this.remote.getConferenceCount (requestData)
            .then(response => {
                if (response.data) {
                    let responseData = response.data
                    if (responseData.code === '0') {
                        if (!responseData.data) {
                            return false
                        }
                        callback(responseData.data.timeline)
                    } else {
                        this.rootScope.toggleInfoModal(4, responseData.message);
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error);
            })
    }
    // 获取最高并发 数据
    getConcurrentData (requestData, callback) {
        this.remote.getSimultaneousCount (requestData)
            .then(response => {
                if (response.data) {
                    let responseData = response.data
                    if (responseData.code === '0') {
                        callback(responseData.data.timeline)
                    } else {
                        this.rootScope.toggleInfoModal(4, responseData.message);
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error);
            })
    }
    // 渲染会议使用图表
    renderMeetingUseChart (meetingData, concurrentData) {
        let meetingUseOption = {
            color: [
                'rgba(82,192,250,1)', 'rgba(239, 100, 57, 1)'
            ],
            title: {
                text: this.translate.instant('ADMIN_STATUS_CHART_TITLE'),
                'x': 'left',
                textStyle: {
                    color: '#30383d',
                    fontWeight: 'bold',
                    fontSize: '14'
                },
                left: '10%',
                top: '8%'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                    shadowStyle: {
                        color: '#e8f4fe',
                        opacity: 0.8
                    }
                }
            },
            legend: {
                data: [{
                    name: this.translate.instant('ADMIN_STATUS_LEGEND_TIMES'),
                    icon: 'roundRect',
                    textStyle: {
                        color: '#30383d',
                        fontWeight: 'bolder',
                        fontSize: '14px'
                    }
                }, {
                    name: this.translate.instant('ADMIN_STATUS_LEGEND_CONCURRENCY'),
                    icon: 'roundRect',
                    textStyle: {
                        color: '#30383d',
                        fontWeight: 'bolder',
                        fontSize: '14px'
                    }
                }],
                align: 'left',
                right: '10%',
                top: '8%'
            },
            calculable: true,
            xAxis: [{
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                boundaryGap: true,
                data: meetingData.map((item) => { return item.time })
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value}'
                }
            }],
            series: [{
                name: this.translate.instant('ADMIN_STATUS_LEGEND_TIMES'),
                smooth: true,
                type: 'line',
                lineStyle: {
                    normal: {
                        width: 5
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                width: '30px',
                data: meetingData.map(item => {
                    return item.totalCount
                })
            }, {
                name: this.translate.instant('ADMIN_STATUS_LEGEND_CONCURRENCY'),
                smooth: true,
                lineStyle: {
                    normal: {
                        width: 5
                    }
                },
                type: 'line',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                barMaxWidth: '25px',
                data: concurrentData.map((item) => {
                    return item.simultaneous
                })
            }]
        }
        this.meetingDurationChart.setOption(meetingUseOption)
    }
    // 获取实时会议信息列表
    getActiveConference () {
        this.remote.getActiveConferences()
            .then((res) => {
                if (res.data.code === '0')
                    this.activeMeetingInfoList = res.data.data;
            })
    }
    // 跳转至会议室详情页面
    getMeetingDetail (item) {
        let { meetingRoomNum, conferenceDuration, locked, guestsMuted } = item;
        this.uiState.go('main.meeting-detail', { data: JSON.stringify({
            meetingRoomNum,
            conferenceDuration,
            locked,
            guestsMuted
        }) });
    }
}
