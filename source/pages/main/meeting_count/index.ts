import {Page, IPageParams, page} from "../../../common/page";
import * as laydate from 'layui-laydate/dist/laydate';
import 'layui-laydate/dist/theme/default/laydate.css';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IMeetingCountPageParams extends IPageParams {
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
    name: 'main.meeting-count'
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
class MainMeeting_CountPage extends Page<IMeetingCountPageParams> {
    name = 'hello order manager';
    page: number;
    pageSize = 6;
    order: any[] = []
    pager: any[] = []
    total
    current
    next

    init(timeout: angular.ITimeoutService) {
        this.initTimePlugin();
    }
    initTimePlugin(){
        let start = {
            elem: '#J-count-start-time',
            lang:(localStorage.getItem('lang')&&localStorage.getItem('lang').indexOf('en-us') > -1)?"en":"",
            format: 'yyyy-MM-dd HH:mm:ss',
            max: '2099-06-16 23:59:59',
            isclear: false,
            istoday: false,
            festival: true,
            fixed: false,
            istime: true,
            zIndex: 9999999,
            choose: function (dates) {
                end.min = dates;    // 开始日期选好后，重置结束日期的最小值
                end.start = dates;  // 将结束日期的初始值设定为开始时间
            }
        };
        let end = {
            elem: '#J-count-end-time',
            lang:(localStorage.getItem('lang')&&localStorage.getItem('lang').indexOf('en-us') > -1)?"en":"",
            format: 'yyyy-MM-dd HH:mm:ss',
            istime: true,
            start:'',
            min: new Date(),
            max: '2099-06-16 23:59:59',
            istoday: false,
            choose: function (dates) {
                start.max = dates;  // 结束日期选好之后，重置开始日期的最大日期
            }
        };
        laydate.render(start);
        laydate.render(end);
    }
    query(){

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
        if (page < maxPage) {
            this.uiState.go('main.order-manager', {page: page + 1});
        } else {
            this.uiState.go('main.order-manager', {page: maxPage});
        }
    }

    async  prevPage() {
        let maxPage = this.total
        let page = parseInt(this.params.page);
        if (page > 1) {
            this.uiState.go('main.order-manager', {page: page - 1})
        } else {
            this.uiState.go('main.order-manager', {page: 1})
        }
    }
}