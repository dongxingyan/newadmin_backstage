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
    name//会议室名
    meetingRoomNum//会议室号
    capacity//默认的做多会议人数
    hostPassword:string//主持人密码
    guestPassword:string//参会者密码
    autoChangePasswd//在提交密码修改的时候需要的字段
    description//描述信息
    allowGuestFlag//是否允许参会
    expirationDate
    themeCustomizedId
    themeId
    themeName
    themeUuid
    checkList=  [];
    selectableThemes

    init() {
        setTimeout(() => {
            this.initCheckboxArr();
        }, 0)
        this.getSelectableThemes();
        this.getMeetingDetail();
    }

    // 初始化单选按钮 数组
    initCheckboxArr () {
        this.checkList = [
            { key: '1', value: this.translate.instant('ADMIN_YES')},
            { key: '0', value: this.translate.instant('ADMIN_NOT')}
        ]
    }
    // 获取会议室详情
    getMeetingDetail () {
        this.remote.getRoominfoById(this.params.id)
            .then((res)=>{
                let
                    resData = res.data.data,
                    {
                        name,
                        meetingRoomNum,
                        capacity,
                        hostPassword,
                        guestPassword,
                        themeId,
                        themeName,
                        themeCustomizedId,
                        themeUuid,
                        description,
                        expirationDate,
                        allowGuestFlag,
                        autoChangePasswd,
                        isThemeCustomized
                    } = resData;

                Object.assign(this, {
                    name,
                    meetingRoomNum,
                    capacity,
                    hostPassword,
                    guestPassword,
                    themeId,
                    themeName,
                    themeCustomizedId,
                    themeUuid,
                    description,
                    expirationDate,
                    allowGuestFlag,
                    autoChangePasswd,
                    isThemeCustomized
                })
            })
    }
    // 获取可供选择的会议主题
    getSelectableThemes () {
        this.remote.getSelectableThemes().then(res => {
            this.selectableThemes = res.data.data;
        })
    }
    // 是否允许参会者加入 切换事件
    changeStatus(key){
        this.allowGuestFlag = key;
        if(!key) {
            this.guestPassword = '';
        }
    }
    // 保存
    submitInfo (){
        let
            data = {
                id: this.params.id,
                organId: sessionStorage.getItem('orgId'),
                meetingRoomNum: this.meetingRoomNum,
                capacity: this.capacity,
                guestPassword: this.guestPassword,
                hostPassword:this.hostPassword,
                description: this.description,
                allowGuestFlag:this.allowGuestFlag,
                expirationDate: this.expirationDate,
                themeCustomizedId: null,
                themeId: this.themeId,
                themeName: null,
                themeUuid: null,
                name: this.name,
                autoChangePasswd:this.autoChangePasswd,
            },
            selectTheme = this.selectableThemes.find((item) => item.themeId === this.themeId);

        if (selectTheme && selectTheme.themeId) {
            let themeObj = {
                themeCustomizedId: selectTheme.id,
                themeName: selectTheme.themeName,
                themeUuid: selectTheme.themeUuid
            };

            Object.assign(data, themeObj)
        }
        this.remote.submitRoomInfo(data)
            .then((res)=>{
                if (res.data.code === '0') {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS'));
                    this.uiState.go('main.meeting-room')

                } else{
                    this.rootScope.toggleInfoModal(4, res.data.message);
                }
            }).catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString());
            })
    }
    saveModify(){
        let regex = /^\d{6}$/;

        if (!this.name) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP'));
            return false;
        }
        if (!/^[1-9]\d{0,5}$|^1000000$/.test(this.capacity)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP1'));
            return false;
        }
        // 先验证：如果参会者密码、主持人密码有值时，必须是6为数字
        let
            hostPassword   = $.trim(this.hostPassword),
            guestPassword  = $.trim(this.guestPassword),
            allowGuestFlag = this.allowGuestFlag;

        if (hostPassword && !hostPassword.match(regex)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP2'));
            return false;
        }
        if (guestPassword && !guestPassword.match(regex)) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP3'));
            return false;
        }
        // 允许参会者加入时，主持人密码是必填项
        if (allowGuestFlag && allowGuestFlag != '0' && !hostPassword) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP4'));
            return false;
        }

        this.submitInfo();
    }
}
