import {Page, IPageParams, page} from "../../../common/page";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface INewMeetingPageParams extends IPageParams {
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
    name: 'main.new-meeting'
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
class MainNew_MeetingPage extends Page<INewMeetingPageParams> {
    name = 'hello new meeting';
    visible;
    feedbackContent;
    theme;//会议主题
    startLiveTime;//会议开始时间
    endLiveTime;//会议结束时间
    vmrNum;//选择的会议室号
    isActive;
    isClicked;
    team;//通讯录人员中的分组
    teamid;
    persons;//通讯录每个组中对应的具体的人员
    vmr;//所有会议室号
    container;//会议容量
    enterPassword//入会密码
    checkStatus//是否发送邮件
    participants:any[]//邀请的与会人员
    others;//其他人员
    originator//会议发起人
    phoneNum//联系电话
    email//邮箱
    page: number;
    pageSize = 6;
    currentItemID: null;
    order: any[] = []
    pager: any[] = []
    total
    current
    next

    init(timeout: angular.ITimeoutService) {
        // timeout(() => {
        this.remote.getTeam()
            .then((res) => {
                this.team = res.data.data;
                this.teamid = res.data.data[0].id
                console.log(this.team)
                console.log(this.teamid)
            })

        // })
        let start = {
            elem: '#J-create-start-time',
            event: 'click',
            format: 'YYYY-MM-DD hh:mm',
            max: '2099-06-16 23:59',
            // isclear: false,
            // istoday: false,
            festival: true,
            // fixed: false,
            // istime: true,
            zIndex: 9999999,
            choose: function (dates) {
                end.min = dates;    // 开始日期选好后，重置结束日期的最小值
                end.start = dates;  // 将结束日期的初始值设定为开始时间
            }
        };
        let end = {
            elem: '#J-create-end-time',
            event: 'click',
            format: 'YYYY-MM-DD hh:mm',
            istime: true,
            min: "",
            start: '',
            max: '2099-06-16 23:59',
            istoday: false,
            choose: function (dates) {
                start.max = dates;  // 结束日期选好之后，重置开始日期的最大日期
            }
        };
        laydate(start);
        laydate(end);
        $("#J-create-start-time").val(laydate.now(0, 'YYYY-MM-DD hh:mm'))
        $("#J-create-end-time").val(laydate.now(0, 'YYYY-MM-DD hh:mm'))

    }

    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

    showPerson(id) {
        this.isClicked = !this.isClicked;
        this.currentItemID = id;
        if (this.isClicked) {
            this.remote.getPerson(id)
                .then((res) => {
                    this.persons = res.data.data;
                })
        }

    }

    getMeetingInfo() {
        // 先获取会议室
        this.remote.getVmrs(this.startLiveTime, this.endLiveTime)
            .then((res) => {
                if (res.data.data.length == 0) {
                    this.visible = true;
                    this.feedbackContent = "没有可用的会议室"
                }
                else {
                    this.vmr = res.data.data;
                    this.vmrNum = res.data.data[0];
                    console.log(this.vmrNum)
                    //确定会议室后获取容量和密码
                    // console.log(this.vmr+"hodhohdohd")
                    this.remote.getvmrsDetail(this.vmrNum)
                        .then((response) => {
                            this.container = response.data.data[0].capacity;
                            this.enterPassword = response.data.data[0].guestPassword;
                        })
                }

            })
    }

    change() {
        this.remote.getvmrsDetail(this.vmrNum)
            .then((response) => {
                this.container = response.data.data[0].capacity;
                this.enterPassword = response.data.data[0].guestPassword;
            })
    }

    //关闭弹框
    close() {
        this.visible = false;
    }

    chose(id,name:string){
        console.log(typeof this.participants)
        console.log(this.participants+"参加的成员")

    }


    //比较两个时间大小的函数
    //确定保存新建会议
    sure() {
        //点击保存按钮分
        //1、什么都没有填直接确定，提示：请获取可用的会议室
        //2、获取了会议室直接保存，提示：请完善会议信息
        //3、获取了会议室且完善了相关信息，提示：开始时间和结束时间不能相同
        //4、修改了会议时间，直接确定，提示：请获取可用会议室
        //5、修改了会议时间之后，重新获取可用会议室，点击确定，可能的提示有：结束时间小于开始时间、其他判断：如主题、有其他会议
        //先判断是否获取了可用的会议室

        this.startLiveTime = $("#J-create-start-time").val()
        this.endLiveTime = $("#J-create-end-time").val()
        let startTime=this.startLiveTime+':00'
        let endTime=this.endLiveTime+':00'
        this.checkStatus = $("input[name='admitButton']:checked").val();
        console.log(this.checkStatus);
        let start = new Date(this.startLiveTime).getTime();
        console.log(this.endLiveTime)
        let end = new Date(this.endLiveTime).getTime();
        if (this.vmrNum && this.enterPassword && this.container) {
            //    对开始时间和结束时间进行判断
            console.log(start)
            console.log(end)
            if (start == end) {
                this.visible = true;
                this.feedbackContent = "开始和结束时间不能相同"
                this.vmrNum='';
                this.container='';
                this.enterPassword='';
            }
            else if (start > end) {
                this.visible = true;
                this.feedbackContent = "会议结束时间应大于开始时间"
                this.vmrNum='';
                this.container='';
                this.enterPassword='';
            }
            //判断是否完善了其他信息
            else if (this.theme && this.originator && this.phoneNum && this.email) {
                //然后判断时间
                let data={
                    meetingRoomNum: this.vmrNum,
                    meetingName: this.theme,
                    sendName: this.originator,
                    sendMail: this.email,
                    sendPhone: this.phoneNum,
                    receiveOut: this.others,
                    personList: this.participants,
                    beginTime: startTime,
                    endTime: endTime,
                }
                    this.remote.getNewMeeting(this.checkStatus,data)
                        .then((res) => {
                        if(res.data.code==14){
                            this.visible=true;
                            this.feedbackContent="此时间段内有其他会议"
                        }
                        else if(res.data.code==17){
                            this.visible=true;
                            this.feedbackContent="会议主题已存在"
                        }
                        else if(res.data.code==999){
                            this.visible=true;
                            this.feedbackContent="服务器内部错误"
                        }
                        else if(res.data.code==0){
                            this.visible=true;
                            this.feedbackContent="创建成功"
                            this.uiState.go('main.meeting-manage({page:1})');
                        }
                        })
            }
            else {
                this.visible=true;
                this.feedbackContent = "请完善会议信息"
            }


            // this.remote.getNewMeeting(this.checkStatus)
            //     .then((res)=>{
            //         console.log(res)
            //     })
        }
        else {
            this.visible = true;
            this.feedbackContent = "请获取可用的会议室"
    }
}

//取消新建会议


paging(total, current){
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
            return [1, 2, 3, 4, 5].map<{ type, value?, isCurrent? }>(x => ({
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

async prevPage() {
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