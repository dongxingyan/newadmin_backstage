import {Page, IPageParams, page} from "../../../common/page";
import * as laydate from 'layui-laydate/dist/laydate';
import 'layui-laydate/dist/theme/default/laydate.css';
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICreateBroadcastPageParams extends IPageParams {
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
    name: 'main.create-broadcast'
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
class MainCreate_BroadcastPage extends Page<ICreateBroadcastPageParams> {
    meetingRoomList: {};
    liveTitile = '';    // 直播标题
    meetingRoomNum = '';    // 会议室号
    startLiveTime = ''; // 预计直播开始时间
    endLiveTime = '';   // 预计直播结束时间
    liveAuthority = 0;  // 直播权限 是否公开
    articulation = 0;   // 清晰度
    interact = 1;   // 是否允许互动交流
    liveDescription = '';    // 直播描述
    livePass = '';  // 直播密码
    file = '';
    coverImage;
    imageUrl = global.IMG_API_PATH;

    init(timeout: angular.ITimeoutService) {
        this.getMeetingRoomList();
        this.activationTimePlugIn();
        this.imgChange();
    }
    // 获取会议室号列表
    getMeetingRoomList () {
        this.remote.getRoomListByOrgID({
            start: 0,
            size: 10
        })
            .then((res) => {
                let resData = res.data;
                let resCode = resData.code;
                if (resCode === '0') {
                    this.meetingRoomList = resData.data.resultList;
                }
            });
    }
    // 初始化时间插件
    activationTimePlugIn (){
        let start = {
            elem: '#J-create-start-time',
            lang:(localStorage.getItem('lang')&&localStorage.getItem('lang').indexOf('en-us') > -1)?"en":"",
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            isclear: false,
            istoday: false,
            festival: true,
            fixed: false,
            istime: true,
            zIndex: 9999999
        };
        let end = {
            elem: '#J-create-end-time',
            lang:(localStorage.getItem('lang')&&localStorage.getItem('lang').indexOf('en-us') > -1)?"en":"",
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            istime: true,
            istoday: false
        };
        laydate.render(start);
        laydate.render(end);
    }
    selectPicture () {
        $('#changeImgInput').trigger('click');
    }
    imgChange() {
        $('#changeImgInput').off('change').on('change', (event) => {
            let file = event.target.files[0];
            if (!file) {
                return false;
            }
            // 上传图片
            let picFileForm = new FormData();
            picFileForm.append('file', file)
            this.remote.uploadPic(picFileForm)
                .then(response => {
                    if (response.data['code'] === '0') {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS3'));
                        this.coverImage = response['data'].data['picUrl'];
                    } else {
                        this.rootScope.toggleInfoModal(4, response.data['message']);
                    }
                }).catch(error => {
                    this.rootScope.toggleInfoModal(4, error.data.responseText);
                });
        })
    }
    // 创建直播
    createLive() {
        // 获取用户填的信息
        let liveTitle = this.liveTitile;
        let meetingRoomNum = this.meetingRoomNum;
        let startTime = $('#J-create-start-time').val();
        let endTime = $('#J-create-end-time').val();
        let liveAuthority = this.liveAuthority;
        let livePassword = this.livePass;
        let articulation = this.articulation;
        let interact = this.interact;
        let liveImg = this.coverImage;
        let liveDescription = this.liveDescription;
        // 判断必填项
        if (!liveTitle) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP10'));
            return false;
        }
        if (!meetingRoomNum) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP11'));
            return false;
        }
        if (!startTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP12'));
            return false;
        }
        if (!endTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP13'));
            return false;
        }
        if (startTime >= endTime) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP14'));
            return false;
        }
        if (liveAuthority && !livePassword) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_INPUT_PASSWORD'));
            return false;
        }

        let createLiveInfo = {
            'title': liveTitle,
            'vmrNum': meetingRoomNum,
            'startTime': startTime,
            'endTime': endTime,
            'imgUrl': liveImg,
            'authority': liveAuthority,
            'authCode': livePassword,
            'definition': articulation,
            'interact': interact,
            'description': liveDescription
        };

        this.remote.createLiveActivity(createLiveInfo)
            .then((res) => {
                let resData = res.data;
                if (resData.code === "0") {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS2'));
                    this.uiState.go('main.live')
                } else {
                    this.rootScope.toggleInfoModal(4, resData.message);
                }
            });

    }
}
