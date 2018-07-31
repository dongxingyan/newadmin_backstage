import {Page, IPageParams, page} from "../../../common/page";
import {global} from "../../../common/global";
import * as laydate from 'layui-laydate/dist/laydate';
import 'layui-laydate/dist/theme/default/laydate.css';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// require("angular");
// require("jquery")
// 路由参数的设置
interface IUpdateBroadcastPageParams extends IPageParams {
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
    name: 'main.update-broadcast'
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
class MainUpdate_BroadcastPage extends Page<IUpdateBroadcastPageParams> {
    meetingRoomList: {};
    liveTitile = '';    // 直播标题
    meetingRoomNum;    // 会议室号
    originMeetingRoomNum = '';  // 之前的会议室号
    startLiveTime = ''; // 预计直播开始时间
    endLiveTime = '';   // 预计直播结束时间
    liveAuthority = 0;  // 直播权限 是否公开
    livePassword = '';  // 如果直播权限是私密的 则对应一个直播密码
    articulation = 0;   // 清晰度
    interact = 1;   // 是否允许互动交流
    rtmpUrl;
    liveUrl;
    liveDescription = ''    // 直播描述
    liveID = 0;
    coverImage;
    imageUrl = global.IMG_API_PATH;
    imgFile

    init(timeout: angular.ITimeoutService) {
        this.ininTimePicker();
        let updLiveID = sessionStorage.getItem('updLiveID');
        // 根据机构ID获取其对应的会议室号列表
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
        // 根据直播记录ID查询直播的详情
        this.remote.getLiveDetailByLiveID(updLiveID)
            .then((res) => {
                let resData = res.data;
                let resCode = resData.code;
                let resDataInfo = resData.data;
                if (resCode === '0') {
                    this.liveID = resDataInfo.id;
                    this.liveTitile = resDataInfo.title;
                    this.originMeetingRoomNum = resDataInfo.vmrNum;
                    this.meetingRoomNum = resDataInfo.vmrNum;
                    this.liveUrl = resDataInfo.liveUrl;
                    this.rtmpUrl = resDataInfo.rtmpUrl;
                    this.liveDescription = resDataInfo.description;
                    this.liveAuthority = resDataInfo.authority;
                    this.articulation = resDataInfo.definition;
                    this.interact = resDataInfo.interact;
                    this.livePassword = resDataInfo.authCode;
                    this.startLiveTime = resDataInfo.startTime.substring(0, 19);
                    this.endLiveTime = resDataInfo.endTime.substring(0, 19);
                    this.coverImage = resDataInfo.imgUrl;
                }
            });


        this.imgChange();
    }
    ininTimePicker(){
        let start = {
            elem: '#J-update-start-time',
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
            elem: '#J-update-end-time',
            lang:(localStorage.getItem('lang')&&localStorage.getItem('lang').indexOf('en-us') > -1)?"en":"",
            type: 'datetime',
            format: 'yyyy-MM-dd HH:mm:ss',
            istime: true,
            istoday: false
        };
        laydate.render(start);
        laydate.render(end);
    }
    signout() {
        this.rootScope.signout()
    }

    selectPicture() {
        $('#J-upd-picture').trigger('click');
    }

    imgChange() {
        $('#J-upd-picture').off('change').on('change', (event) => {
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

    // 修改直播
    updateLive() {
        let that = this;
        // 获取用户填的信息
        let liveTitle = that.liveTitile;
        let meetingRoomNum = that.meetingRoomNum;
        let startTime = $('#J-update-start-time').val();
        let endTime = $('#J-update-end-time').val();
        let liveAuthority = that.liveAuthority;
        let livePassword = that.livePassword;
        let articulation = that.articulation;
        let interact = that.interact;
        let liveDescription = that.liveDescription;
        let liveImg = this.coverImage;

        // 判断必填项
        if (!liveTitle) {
            alert(this.translate.instant('ADMIN_WARN_TIP10'));
            return;
        }
        if (!meetingRoomNum) {
            alert(this.translate.instant('ADMIN_WARN_TIP11'))
            return;
        }
        if (!startTime) {
            alert(this.translate.instant('ADMIN_WARN_TIP12'));
            return;
        }
        if (!endTime) {
            alert(this.translate.instant('ADMIN_WARN_TIP13'));
            return;
        }
        if (startTime >= endTime) {
            alert(this.translate.instant('ADMIN_WARN_TIP14'));
            return;
        }
        if (liveAuthority && !livePassword) {
            alert(this.translate.instant('ADMIN_INPUT_PASSWORD'));
            return;
        }
        let updateLiveInfo = {
            'title': liveTitle,
            'vmrNum': meetingRoomNum,
            'startTime': startTime,
            'endTime': endTime,
            'imgUrl': liveImg,
            'authority': liveAuthority,
            'authCode': livePassword,
            'definition': articulation,
            interact,
            'description': liveDescription
        };

        this.remote.updateLiveActivity(that.liveID, updateLiveInfo)
            .then((res) => {
                let resData = res.data;
                if (resData.code === "0") {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS4'));
                    this.uiState.go('main.live')
                } else {
                    this.rootScope.toggleInfoModal(4, resData.message);
                }
            });
    }

    // 日期格式化
    formatDate(timeString) {
        let formatTime = '';
        let timeDate = new Date(timeString);

        // 先把时间字符串转换称日期格式
        let year = timeDate.getFullYear();
        let month = timeDate.getMonth() + 1 + '';
        let date = timeDate.getDate() + '';
        let hours = timeDate.getHours() + '';
        let minutes = timeDate.getMinutes() + '';

        // 格式化每个日期节点的个数
        if (month.toString().length === 1) month = '0' + month;
        if (date.toString().length === 1) date = '0' + date;
        if (hours.toString().length === 1) hours = '0' + hours;
        if (minutes.toString().length === 1) minutes = '0' + minutes;

        // 拼接称最终返回的时间
        formatTime = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':00';

        return formatTime;
    }
}
