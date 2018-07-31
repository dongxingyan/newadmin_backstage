import { Page, IPageParams, page } from '../../../../common/page';
import { global } from '../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomMeetingPageParams extends IPageParams {
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
    name: 'main.custom-meeting'
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
class MainCustom_MeetingPage extends Page<ICustomMeetingPageParams> {
    id;
    systemName;
    defaultDomain;
    customizedDomain;
    certificateUrl;
    loginLogo;
    ico;
    systemLogo;
    background;
    imageUrl = global.IMG_API_PATH;
    fileType;

    init(timeout: angular.ITimeoutService) {
        this.rootScope.titleConetent.title="web浏览器端";
        this.rootScope.titleConetent.titleEn="CUSTOMIZATION";
        // 获取定制化 web浏览器端信息
        this.getMeetingInfo();
        this.addListenerfileChange();
    }

    // 获取定制化 web浏览器端信息
    getMeetingInfo() {
        this.remote.getMeetingCustomInfo()
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        let resData = res['data'].data;
                        this.systemName = resData.name;
                        this.defaultDomain = resData.defaultDomain;
                        this.customizedDomain = resData.customizedDomain;
                        this.certificateUrl = resData.certificateUrl;
                        this.loginLogo = resData.loginLogo;
                        this.ico = resData.ico;
                        this.systemLogo = resData.systemLogo;
                        this.background = resData.background;
                    } else {
                        this.rootScope.toggleInfoModal(4, res.data['message']);
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString())
            })
    }

    addListenerfileChange() {
        $('#J-meeting-input-file').off('change').on('change', (event) => {
            let file = event.target.files[0];
            if (!file) {
                return false;
            }
            // 上传图片
            let picFileForm = new FormData();
            picFileForm.append('file', file);
            this.remote.customUploadPicture(this.params.id, picFileForm)
                .then(response => {
                    if (response.data['code'] === '0') {
                        this.rootScope.toggleInfoModal(1, '上传成功');
                        this[this.fileType] = response['data'].data.filePath;
                    } else {
                        this.rootScope.toggleInfoModal(4, response.data['message']);
                    }
                }).catch(error => {
                this.rootScope.toggleInfoModal(4, error.data.responseText);
            })
        })
    }

    selectFile(imgType) {
        this.fileType = imgType;
        $('#J-meeting-input-file').trigger('click');
    }

    meetingInfoSave() {
        let systemName = this.systemName;
        if (!systemName) {
            this.rootScope.toggleInfoModal(3, '请填写系统名称');
            return false;
        }
        let requestParam = {
            background: this.background,
            certificateUrl: this.certificateUrl,
            customizedDomain: this.customizedDomain,
            ico: this.ico,
            id: Number(this.params.id),
            loginLogo: this.loginLogo,
            name: systemName,
            systemLogo: this.systemLogo
        };
        this.remote.updMeetingCustomized(requestParam)
            .then(response => {
                if (response.data['code'] === '0') {
                    this.rootScope.toggleInfoModal(1, '修改成功');
                    this.getMeetingInfo();
                } else {
                    this.rootScope.toggleInfoModal(4, response['data'].data.message);
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString());
            })
    }

    signout() {
        this.rootScope.signout()
    }
}
