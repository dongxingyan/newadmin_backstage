import {Page, IPageParams, page} from "../../../common/page";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IDeviceManagePageParams extends IPageParams {
    page: string;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    params: ['page'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    title: '机构管理系统',
    name: 'main.device-manage'
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
class MainDevice_ManagePage extends Page<IDeviceManagePageParams> {
    name = 'hello order manager';
    devices
    visible//控制第一个弹框的显示
    visible1//控制第二个弹框的显示
    feedbackContent//弹框中显示的内容
    //弹框中的内容
    deviceAlias//设备别名
    deviceName//设备名称
    account//绑定账号
    password//绑定密码
    origanizeName//所属机构
    departNames//所有的部门
    departName//绑定的部门名称
    remark//账号描述
    deviceId//设备id

    items//
    pager: any[] = []
    total//总页数
    totalCount//总条数
    pageSize:number =10;//每页显示条数
    count:number//跳转到某页
    selPage:number=1


    init() {
        // timeout(() => {
        // this.remote.getDeviceCount()
        //     .then((res)=>{
        //     if(res.data.code==0){
        //         this.totalCount=parseInt(res.data.data.count);
        //         console.log(this.totalCount)
        //     }
        //     else if(res.data.code==2){
        //         this.uiState.go("login")
        //     }
        //     });
        // timeout(()=>{
            this.remote.getDevices()
                .then((res)=>{
                    if(res.data.code==0){
                        console.log(this.totalCount)
                        this.totalCount=res.data.data.length;
                        this.total = Math.ceil(this.totalCount / this.pageSize)
                        console.log(this.total)
                        this.devices = res.data.data;
                        this.pager = this.paging(this.total, this.selPage)
                        this.items=this.devices.slice(0,this.pageSize)
                    }
                    else if(res.data.code==2){
                        this.uiState.go("login")
                    }
                })
        // },150)
    }

    signout() {
        this.session.clear();
        this.uiState.go('login');
    }

    deviceModify(id,alias,displayName,name,password,departId,description){
        this.visible=true;
        this.deviceId=id;
        this.deviceAlias=alias||"";
        this.deviceName=displayName||"";
        this.account=name||"";
        this.password=password||"";
        this.departName=departId||""
        this.remark=description||""
        console.log(departId)
        this.remote.getDepartment()
            .then((res) => {
                if(res.data.code=="0")
                    this.origanizeName=res.data.data.name;
                console.log(this.origanizeName)
            })
        this.remote.getDepts()
            .then((res) => {
                this.departNames = res.data.data;
                console.log(this.departNames)
                console.log(this.departName)
            })
    }

    //点击确定保存编辑内容
    sureEdit(){
    //        提交的时候需要判断的内容有：
    //    如果绑定密码为空：提示请完善信息
    //    如果绑定密码不符合要求，提示密码为6位纯数字
    //    发送请求根据返回的code进行判断
        if(this.password==""){
            this.visible=false;
            this.visible1=true;
            this.feedbackContent="请完善信息";
        }
        else if(!this.password.match(/^\d{6}$/)){
            this.visible=false;
            this.visible1=true;
            this.feedbackContent="密码为6位纯数字"
        }
        else{
            let data={
                organId:sessionStorage.getItem("orgId"),
                id:this.deviceId,
                departId:this.departName,
                displayName:this.deviceName,
                pexipName:this.account,
                pexipPassword:this.password,
                description:this.remark
            }
            this.remote.editDevices(this.deviceId,data)
                .then((res)=>{
                if(res.data.code==0){
                    this.visible=false;
                    this.visible1=true;
                    this.feedbackContent='编辑成功'
                    this.init();
                }
                else if(res.data.code==999){
                    this.visible=false;
                    this.visible1=true;
                    this.feedbackContent='服务器内部错误'
                }
                else if(res.data.code==16){
                    this.visible=false;
                    this.visible1=true;
                    this.feedbackContent='设备名称已存在'
                    }
                })

        }
    }

    close(){
        this.visible=false;
        this.visible1=false;
    }
    // sureEdit(){
    //     this.visible=true;
    // }

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
            if (current <= 4&&current>0) {
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

    setData(data){
        console.log(this.selPage+"xuanze d")
        this.items=data.slice((this.pageSize)*(this.selPage-1),this.selPage*(this.pageSize))
        console.log(this.items)
    }

    selectPage(page,type){
        if(page<1||page>this.total) return;
        if(type==1) return;
        console.log("shifou ")
        // if(page>2){
        //     this.setData(this.rooms);
        // }
        this.selPage=page
        this.setData(this.devices);
        console.log(this.selPage)
        console.log(typeof this.selPage)
        this.pager=this.paging(this.total,this.selPage)
        console.log(this.pager);
    }
    //页码的显示
    // 上一页
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
    //     if (page < maxPage) {
    //         this.uiState.go('main.device-manage', {page: page + 1});
    //     } else if(page>1&&page>=maxPage) {
    //         this.uiState.go('main.device-manage', {page: maxPage});
    //     }
    // }
    //
    // async  prevPage() {
    //     let page = parseInt(this.params.page);
    //     console.log(page)
    //     if (page > 1) {
    //         this.uiState.go('main.device-manage', {page: page - 1})
    //     } else {
    //         this.uiState.go('main.device-manage', {page: 1})
    //     }
    // }
}