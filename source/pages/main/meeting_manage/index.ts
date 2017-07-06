import {Page, IPageParams, page} from "../../../common/page";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IMeetingManagePageParams extends IPageParams {
    // page: string;
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
    name: 'main.meeting-manage'
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
class MainMeeting_ManagePage extends Page<IMeetingManagePageParams> {
    meetings;
    items;
    pager:any[]=[]
    total;//总页数
    totalCount;//总条数
    pageSize=15;
    count
    selPage:number=1
    visible=false;
    visible1=false;
    meetingId;


    init() {
        // timeout(() => {
        this.remote.getMeetingManage()
            .then((res) => {
            if(res.data.code=="0"){
                this.meetings=res.data.data;
                this.totalCount=parseInt(res.data.data.length);
                this.total = Math.ceil(this.totalCount / this.pageSize);
                this.pager=this.paging(this.total,this.selPage);
                this.items=this.meetings.slice(0,this.pageSize)

            }
            })
        // })
    }

    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

    delete(id){
        this.meetingId=id;
        this.visible=true;
    }
    cancel(){
        this.visible=false;
        this.visible1=false;
    }
    sure(){
        this.visible=false;

       this.remote.deleteMeeting(this.meetingId)
           .then((res)=>{
           if(res.data.code=="0"){
                this.visible1=true;
           }
           })



    }
    makeSure(){
        this.visible1=false;
        this.init();
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

    //设置数据的分页
    setData(data){
        console.log(this.selPage+"xuanze d")
        this.items=data.slice((this.pageSize)*(this.selPage-1),this.selPage*(this.pageSize))
        console.log(this.items)
    }
    selectPage(page){
        if(page<1||page>this.total) return;
        console.log("shifou ")
        // if(page>2){
        //     this.setData(this.rooms);
        // }
        this.selPage=page
        this.setData(this.meetings);
        console.log(this.selPage)
        console.log(typeof this.selPage)
        this.pager=this.paging(this.total,this.selPage)
        console.log(this.pager);
    }
    //页码的显示
    async  prevPage(page) {
        this.selectPage(page-1);
        console.log(page)
    }
    //下一页
    async nextPage(page) {
        this.selectPage(page+1)
    }
    //页面跳转
    jump(page){
        if(page){
            var page1=parseInt(page)
            this.selectPage(page1)
        }

    }
    // async nextPage() {
    //     let maxPage = await this.total;
    //     let page = parseInt(this.params.page);
    //     console.log(page)
    //     if (page < maxPage) {
    //         this.uiState.go('main.order-manager', {page: page + 1});
    //     } else {
    //         this.uiState.go('main.order-manager', {page: maxPage});
    //     }
    // }
    //
    // async  prevPage() {
    //     let maxPage = this.total
    //     let page = parseInt(this.params.page);
    //     console.log(page)
    //     if (page > 1) {
    //         this.uiState.go('main.order-manager', {page: page - 1})
    //     } else {
    //         this.uiState.go('main.order-manager', {page: 1})
    //     }
    // }
}