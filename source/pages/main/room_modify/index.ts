import {Page, IPageParams, page} from "../../../common/page";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IRoomModifyPageParams extends IPageParams {
    page: string;
    id
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    params: ['id'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    title: '机构管理系统',
    name: 'main.room-modify'
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
class MainRoom_modifyPage extends Page<IRoomModifyPageParams> {
    name = 'hello order manager';
    visible
    visible1;
    visible2;//编辑成功时的弹出框
    feedbackContent
    feedbackContent2
    meetingroomName//会议室名
    meetingroomNum//会议室号
    capacity//默认的做多会议人数
    maxNum:number//最多人数
    anotherName//会议室别名
    anotherName1//会影响的会议主题
    hostPassword:string//主持人密码
    defaultPassword:string//默认的参会者密码
    guestPassword:string//参会者密码
    autoChangePasswd//在提交密码修改的时候需要的字段
    description//描述信息
    checkStatus//是否允许参会
    time
    timeId
    themename
    themeuuid
    page: number;
    pageSize = 6;
    order: any[] = []
    pager: any[] = []
    total
    current
    next
    checkList=[{key:"1",value:"是"},{key:"0",value:"否"}]
    init() {
        // timeout(() => {
        //根据参数id获取当前编辑的会议室的信息
        this.remote.getRoominfoById(this.params.id)
            .then((res)=>{
            this.meetingroomName=res.data.data.name;
            this.meetingroomNum=res.data.data.meetingRoomNum;
            this.capacity=res.data.data.capacity;
            this.maxNum=res.data.data.capacity;
            this.hostPassword=res.data.data.hostPassword;
            this.defaultPassword=res.data.data.guestPassword;
            this.guestPassword=res.data.data.guestPassword;
            this.time=res.data.data.expirationDate;
            this.timeId=res.data.data.themeId;
            this.description=res.data.data.description;
            this.themename=res.data.data.themeName;
            this.checkStatus=res.data.data.allowGuestFlag;
            this.themeuuid=res.data.data.themeUuid;
            this.autoChangePasswd=res.data.data.autoChangePasswd;
            console.log(this.hostPassword)
                console.log(this.guestPassword)
            })
        this.remote.getAlias(this.params.id)
            .then((res)=>{
            this.anotherName=res.data.data;
            })
        // })
    }
    changeStatus(key){
        this.checkStatus=key;
        if(key==1){
            if(this.hostPassword==""){
                this.visible=true;
                this.feedbackContent="主持人密码不能为空";
            }
        }
        if(key==0){
            this.guestPassword="";
        }
    }
    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

    submitInfo(){
        if(this.checkStatus==1){
            if(this.hostPassword==""){
                this.visible=true;
                this.feedbackContent="主持人密码不能为空";
                return;
            }
        }
        let data={
            organId: sessionStorage.getItem('orgId'),
            id: this.params.id,
            meetingRoomNum: this.meetingroomNum,
            capacity: this.maxNum,
            guestPassword: this.guestPassword,
            hostPassword:this.hostPassword,
            description: this.description,
            allowGuestFlag:this.checkStatus,
            expirationDate: this.time,
            themeId: this.timeId,
            themeName: this.themename,
            themeUuid: this.themeuuid,
            name: this.meetingroomName,
            autoChangePasswd:this.autoChangePasswd,
        }
        console.log(data)
        this.remote.submitRoomInfo(this.params.id,data)
            .then((res)=>{
            if(res.data.code==999){
                this.visible=true;
                this.feedbackContent="服务器内部错误"
            }
            else if(res.data.code==18){
                this.visible=true;
                this.feedbackContent="会议室名称已存在"
            }
            else if(res.data.code==4){
                this.visible=true;
                this.feedbackContent="没有该资源"
            }
            else if(res.data.code==32){
                this.visible=true;
                this.feedbackContent="密码格式错误"
            }
            else {
                this.visible2=true;
                this.feedbackContent2="编辑成功"
            }




            })

    }
    saveModify(){
    //     this.checkStatus = $("input[name='admitButton']:checked").val();//是否允许访客参加会议的选中状态
    // //    需要分以下几种情况
    // //    一种是对人数和访客密码进行修改之后提交的
    // //    一种是将访客密码和主持人密码设为一样的，提示密码不能相同
    // //    一种是会议容量存在非数字时，提示会议容量只能为数字
    // //    一种是主持人密码或者访客密码存在非数字时，提示密码为6位纯数字
    // //    一种是会议名和最多人数为空时，提示请完善信息
    // //    最后一种是直接提交

        let a=/^[0-9]*$/;
        let b=/^\d{6}$/;
        let num=$.trim(this.maxNum);
        let hp=$.trim(this.hostPassword);
        console.log(this.capacity,this.maxNum)
        if(this.maxNum != this.capacity||this.guestPassword!= this.defaultPassword){
            if(this.guestPassword==this.hostPassword&&this.guestPassword!=""&&this.hostPassword!=""){
                this.visible=true;
                this.feedbackContent="密码不能相同";
                return false;
            }
            if(!hp.match(b)&&this.hostPassword!=''){
                console.log("密码格式")
                this.visible=true;
                this.feedbackContent='主持人密码为6位纯数字';
                return false;
            }
            console.log("执行这里")
            this.remote.getRoominfoByNum(this.meetingroomNum)
                .then((res)=>{
                if(res.data.code==31){
                    // this.visible=true;
                    this.submitInfo();
                }
                else{
                    this.visible1=true;
                    this.anotherName1=res.data.data;

                }
                })

        }
        else if(this.guestPassword==this.hostPassword&&this.guestPassword!=""&&this.hostPassword!=""){
            this.visible=true;
            this.feedbackContent="密码不能相同";
            return false;
        }
        else if(!num.match(a)){
            this.visible=true;
            this.feedbackContent="会议容量只能为数字";
            return false;
        }
        else if(!hp.match(b)&&this.hostPassword!=''){
            console.log("密码格式")
            this.visible=true;
            this.feedbackContent='密码为6位纯数字';
            return false;
        }
        else if(!this.name||!this.maxNum){
            this.visible=true;
            this.feedbackContent="请完善信息";
            return false;
        }
        else{
            this.submitInfo()
        }

    }
    goTo(){
        this.visible=false;
        console.log("hahoahohao")
        // this.uiState.go('main.meeting-room',{page:1})

    }
    goTo2(){
        this.visible2=false;
        this.uiState.go('main.meeting-room')
    }

    //点击按钮继续提交修改信息
    continue(){
        this.visible1=false;
        //执行提交的方法
        this.submitInfo();
    }


    //点击关闭弹框
    close() {
        this.visible = false;
        this.visible1=false;
    }
    close2(){
        this.visible2=false;
        this.uiState.go('main.meeting-room')
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