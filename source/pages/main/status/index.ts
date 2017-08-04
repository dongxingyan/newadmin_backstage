import {Page, IPageParams, page} from "../../../common/page";
// import * as echarts from '../../../libs/echarts/echarts.min.js';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
let highcharts=require("highcharts")
// require("highcharts/css/highcharts.css")

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
    title: '机构管理系统',
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
    name:"";
    department;//所属机构
    count;//会议室总数
    deviceAccount;//设备账号
    userAccount;//用户账号
    cates
    cates2
    series
    series2
    account
    page: number;
    pageSize = 6;
    order: any[] = []
    pager: any[] = []
    total
    current
    next

    init(timeout: angular.ITimeoutService) {
        // timeout(() => {
            this.remote.getDepartment()
                .then((res) => {
                    if(res.data.code=="0")
                    this.department=res.data.data.name;
                })
        this.remote.totalCount()
            .then((res)=>{
                if(res.data.code=="0"){
                    this.count=res.data.data.count;
                }
                console.log(res.data)
            })
        this.remote.getDeviceAccount()
                .then((res)=>{
                    this.deviceAccount=res.data.data.count;
            })
        this.remote.getUserAccount()
            .then((res)=>{
                this.userAccount=res.data.data.count;
            })
        this.remote.getAllDuration()
            .then((res)=>{
                if(res.data.code =="0"){
                    this.cates=JSON.parse(res.data.data).meetingRoomNum;
                    this.series=JSON.parse(res.data.data).data;
                    console.log(this.cates)
                    console.log(typeof this.cates)
                    console.log(this.series)
                    console.log("haohoa")
                    $('#container').highcharts({
                        chart: {
                            type: 'column'
                            // margin: [ 50, 50, 100, 80]
                        },
                        credits: {
                            enabled: false //不显示LOGO
                        },
                        title: {
                            text: '会议时长统计'
                        },
                        xAxis: {
                            categories:this.cates,
                            labels: {
                                rotation: -45,
                                align: 'right',
                                style: {
                                    fontSize: '11px',
                                    fontFamily: 'Verdana, sans-serif'
                                }
                            }
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: '会议时长 (秒)'
                            }
                        },
                        legend: {
                            enabled: false
                        },
                        tooltip: {
                            pointFormat: '会议时长: <b>{point.y:.1f} 秒</b>',
                        },
                        series: [{
                            name: '会议时长',
                            data:this.series,//
                            dataLabels: {
                                enabled: false,
                                rotation: 0,
                                color: '#FFFFFF',
                                align: 'center',
                                x: 4,
                                y: 10,
                                style: {
                                    fontSize: '13px',
                                    fontFamily: 'Verdana, sans-serif',
                                    textShadow: '0 0 3px black'
                                }
                            }
                        }]
                    });
                    // this.renderMeetingDuration(res.data.data.meetingRoomNum)
                }
            })
        this.remote.getAllConferenceTime()
            .then((res)=>{
                if(res.data.code=="0"){
                    this.series2=JSON.parse(res.data.data).data;
                    this.cates2=JSON.parse(res.data.data).meetingRoomNum.length;
                    this.account=JSON.parse(res.data.data).totalTime;
                    console.log(this.account)
                    console.log(this.cates2);
                    $('#container2').highcharts({
                        chart: {
                            plotBackgroundColor: '#fff',
                            plotBorderWidth: null,
                            plotShadow: false
                        },
                        credits: {
                            enabled: false //不显示LOGO
                        },
                        title: {
                            text: '会议次数统计',
                        },
                        tooltip: {
                            formatter: function() {
                                return '<b>会议名称：'+ this.point.name +'</b><br/>'+'<b>会议数量:'+
                                    highcharts.numberFormat(this.y, 0, ',') +' 个</b>';
                            }
                        },
                        plotOptions: {
                            pie: {
                                size:160,
                                innerSize:'120',
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: false
                                },
                                showInLegend: true
                            }
                        },
                        series: [{
                            type: 'pie',
                            name: '会议总数',
                            data: this.series2
                        }]
                    });
                    $("#contents").html( '<b style="z-index:-999;font-size:13px;">会议室总数：'+ this.cates2 +'</b><br/>'+'<b style="z-index:-999;font-size:13px;">会议数量:'+
                        this.account+' 个</b>')
                }
            })





        // })
    }



    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

    paging(total, current) {
        // 小于十页全显示
        if (total <= 10) {
            let arr = [];
            for (var i = 0; i < total; i++) {
                arr[i] = i + 1;
            }
            return arr.map(x => ({
                type: 0,
                value: x,
                isCurrent: x === current
            }))
        }
        // 大于十页部分显示
        else {
            // 当前页号小于等于5
            if (current <= 4) {
                return [1, 2, 3, 4, 5].map<{type,value?,isCurrent?}>(x => ({
                    type: 0,
                    value: x,
                    isCurrent: x === current
                }))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
            // 当前页号是最后5页之一
            else if (current > total - 4) {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([total - 4, total - 3, total - 2, total - 1, total].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === current
                    })))
            }
            // 其它情况
            else {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([current - 2, current - 1, current, current + 1, current + 2].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === current
                    })))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
        }
    }

    async nextPage() {
        let maxPage = await this.total;
        let page = parseInt(this.params.page);
        console.log(page)
        if (page < maxPage) {
            this.uiState.go('main.order-manager', {page: page + 1});
        } else {
            this.uiState.go('main.order-manager', {page: maxPage});
        }
    }

    async  prevPage() {
        let maxPage = this.total
        let page = parseInt(this.params.page);
        console.log(page)        
        if (page > 1) {
            this.uiState.go('main.order-manager', {page: page - 1})
        } else {
            this.uiState.go('main.order-manager', {page: 1})
        }
    }
}