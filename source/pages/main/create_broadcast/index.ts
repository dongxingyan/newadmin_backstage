import {Page, IPageParams, page} from "../../../common/page";
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// require("angular");
// require("jquery")
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
    title: '机构管理系统',
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
    liveDescription = '';    // 直播描述
    livePass = '';  // 直播密码
    file = '';
    fileName = '';

    init(timeout: angular.ITimeoutService) {
        // 根据机构ID获取会议室号列表
        this.remote.getRoomListByOrgID()
        .then((res) => {
            let resData = res.data;
            let resCode = resData.code;
            if (resCode === "0") {
                this.meetingRoomList = resData.data;
            }
        });
        let start = {
            elem: '#J-create-start-time',
            event: 'click',
            format: 'YYYY-MM-DD hh:mm:ss',
            isclear: false,
            istoday: false,
            festival: true,
            fixed: false,
            istime: true,
            zIndex: 9999999
        };
        let end = {
            elem: '#J-create-end-time',
            event: 'click',
            format: 'YYYY-MM-DD hh:mm:ss',
            istime: true,
            istoday: false
        };
        laydate(start);
        laydate(end);
    }
    imgChange(event) {
        let that = this;
        $('#changeImgInput').on('change', function() {
            let file = event.target.files[0];
            that.fileName = file.name;
            // 上传图片
            let picFileForm = new FormData();
            let files = event.target.files;
            let count = files.length;
            picFileForm.append('file', files[files.length - 1]);
            that.remote.uploadPic(picFileForm, file, that.preview);
        })
    }
    // 图片预览
    preview(file) {
        console.warn('file:', file);
        let img = new Image(),
             url = img.src = URL.createObjectURL(file);
        let $img = $(img)
        img.onload = function() {
            URL.revokeObjectURL(url)
            $('#preview').empty().append($img)
        }
    }
    // 创建直播
    createLive() {
        let that = this;
        // 获取用户填的信息
        let liveTitle = that.liveTitile;
        let meetingRoomNum = that.meetingRoomNum;
        let startTime = $('#J-create-start-time').val();
        let endTime = $('#J-create-end-time').val();
        let liveAuthority = that.liveAuthority;
        let livePassword = that.livePass;
        let articulation = that.articulation;
        let liveImg = sessionStorage.getItem('updImgURL');
        let liveDescription = this.liveDescription;

        // 判断必填项
        if (!liveTitle) {
            alert('请填写直播名称');
            return;
        }
        if (!meetingRoomNum) {
            alert('请选择会议室号')
            return;
        }
        if (!startTime) {
            alert('请选择开始时间');
            return;
        }
        if (!endTime) {
            alert('请选择结束时间');
            return;
        }
        if (startTime >= endTime) {
            alert('开始时间不能大于等于结束时间');
            return;
        }
        if (liveAuthority && !livePassword) {
            alert('请输入直播密码');
            return;
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
            'description': liveDescription
        };

        this.remote.createLiveActivity(createLiveInfo)
        .then((res) => {
            let resData = res.data;
            if (resData.code === "0") {
                $('#cancel').trigger('click');
                sessionStorage.removeItem('updImgURL');
            } else {
                alert(resData.message);
            }
        });

    }

    signout() {
        this.session.clear();
        this.uiState.go('login');

    }
}