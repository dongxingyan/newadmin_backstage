import {Page, IPageParams, page} from '../../../../common/page';
import {global} from '../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomIosPageParams extends IPageParams {
    page: string;
    id;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    params: ['id'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    name: 'main.custom-ios'
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
class MainCustom_IosPage extends Page<ICustomIosPageParams> {
    color;
    copyright;
    appName;
    packAppName;
    version;
    packName;
    downloadUrl;
    systemVersion;
    ico;
    startPageImage;
    backgroundUrl;
    loginLogo;
    callHistoryLogo;
    ipadStartPageUrl;
    hasAppleAccount = '0';
    bundleID;
    certificateUrl;
    certificatePassword;
    isHasNewVersion = false;
    fileType;
    imageUrl = global.IMG_API_PATH;
    isPublish = false;
    publishDate;
    colors = {
        blue: '#0a9af9',
        gold: '#d4a660',
        green: '#0da591',
        orange: '#f8922f',
        red: '#a3121a'
    };

    init() {
        setTimeout(()=>{
            this.rootScope.titleConetent.title=this.translate.instant('ADMIN_CUSTOMIZATION3');
        },50)
        // this.rootScope.titleConetent.titleEn="CUSTOMIZATION";
        this.getIOSCustomInfo();
        this.addListenerfileChange();
    }

    getIOSCustomInfo() {
        this.remote.getIOSCustomInfo()
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        let resData = res.data['data'];
                        // 获取定制化信息
                        this.color = resData.iosMobileCustomized.color || '#0a9af9';
                        this.copyright = resData.iosMobileCustomized.copyright;
                        this.appName = resData.iosMobileCustomized.appName;
                        this.packAppName = resData.iosMobileCustomized.appName;
                        this.version = resData.iosMobileCustomized.version;
                        this.packName = resData.iosMobileCustomized.packName;
                        this.downloadUrl = resData.iosMobileCustomized.url;
                        this.systemVersion = resData.systemVersion;
                        this.ico = resData.iosMobileCustomized.iconUrl;
                        this.startPageImage = resData.iosMobileCustomized.startPageUrl;
                        this.loginLogo = resData.iosMobileCustomized.logoUrl;
                        this.callHistoryLogo = resData.iosMobileCustomized.callHistoryLogoUrl;
                        this.ipadStartPageUrl = resData.iosMobileCustomized.ipadstartPageUrl;
                        if (resData.iosMobileCustomized.hasAppleAccount) {
                            this.hasAppleAccount = resData.iosMobileCustomized.hasAppleAccount + '';
                        } else {
                            this.hasAppleAccount = '0'
                        }
                        this.bundleID = resData.iosMobileCustomized.bundleID;
                        this.certificateUrl = resData.iosMobileCustomized.certificateUrl;
                        this.certificatePassword = resData.iosMobileCustomized.certificatePassword;
                        this.backgroundUrl = resData.iosMobileCustomized.backgroundUrl;
                        // 判断是否有新版本
                        if (this.version && this.systemVersion) {
                            let versionArr = this.version.split('.');
                            let sysVersionArr = this.systemVersion.split('.');
                            let versionNum = versionArr[versionArr.length - 1];
                            let sysVersionNum = sysVersionArr[sysVersionArr.length - 1];
                            if (parseInt(sysVersionNum) > parseInt(versionNum)) {
                                this.isHasNewVersion = true;
                            }
                        }
                        // 判断是否正在发布中
                        if (resData.iosMobileCustomized.status === 2) {
                            this.isPublish = true;
                            if (!this.publishDate) {
                                this.publishDate = new Date().getTime()
                            }
                            this.getStatusOfPublish();
                        } else {
                            this.isPublish = false;
                        }
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
        $('#J-ios-input-file').off('change').on('change', (event) => {
            let file = event.target.files[0];
            if (!file) {
                return false;
            }
            // 上传图片
            let picFileForm = new FormData(),
                accountId = sessionStorage.getItem('accountId');

            picFileForm.append('file', file);
            this.remote.customUploadPicture(accountId, picFileForm)
                .then(response => {
                    if (response.data['code'] === '0') {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS11'));
                        this[this.fileType] = response.data['data'].filePath;
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
        $('#J-ios-input-file').trigger('click');
    }

    iOSInfoSave() {
        let requestParam = {
            id: Number(this.params.id),
            color: this.color,
            copyright: this.copyright,
            appName: this.appName,
            iconUrl: this.ico,
            startPageUrl: this.startPageImage,
            logoUrl: this.loginLogo,
            callHistoryLogoUrl: this.callHistoryLogo,
            ipadstartPageUrl: this.ipadStartPageUrl,
            hasAppleAccount: this.hasAppleAccount,
            bundleID: this.bundleID,
            certificateUrl: this.certificateUrl,
            certificatePassword: this.certificatePassword,
            backgroundUrl: this.backgroundUrl
        };
        this.remote.updIOSCustomized(requestParam)
            .then(response => {
                if (response.data['code'] === '0') {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS4'));
                    this.getIOSCustomInfo();
                } else {
                    this.rootScope.toggleInfoModal(4, response.data['data'].message);
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString());
            })
    }

    publishIOSVersion() {
        if (this.appName && this.ico && this.startPageImage && this.backgroundUrl && this.loginLogo && this.callHistoryLogo && this.ipadStartPageUrl) {
            if (this.hasAppleAccount == 1) {
                if (!(this.bundleID && this.certificateUrl)) {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP17'));
                    return
                }
            }
        } else {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP17'));
            return
        }
        this.isPublish = true;
        // 发布前先保存
        let requestParam = {
            id: Number(this.params.id),
            appName: this.appName,
            color: this.color,
            copyright: this.copyright,
            iconUrl: this.ico,
            startPageUrl: this.startPageImage,
            logoUrl: this.loginLogo,
            callHistoryLogoUrl: this.callHistoryLogo,
            ipadstartPageUrl: this.ipadStartPageUrl,
            hasAppleAccount: this.hasAppleAccount,
            bundleID: this.bundleID,
            certificateUrl: this.certificateUrl,
            certificatePassword: this.certificatePassword,
            backgroundUrl: this.backgroundUrl
        };
        this.remote.updIOSCustomized(requestParam).then(res => {
            if (res.status === 200) {
                if (res.data['code'] === '0') {
                    this.remote.publishInstallPackage('iOS')
                        .then(response => {
                            if (response.data['code'] === '0') {
                                this.publishDate = new Date().getTime();
                                this.getStatusOfPublish();
                            } else {
                                this.isPublish = false;
                                this.rootScope.toggleInfoModal(4, response.data['message']);
                            }
                        })
                        .catch(error => {
                            this.isPublish = false;
                            this.rootScope.toggleInfoModal(4, error.statusText);
                        })
                } else {
                    this.isPublish = false;
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP30'));
                }
            } else {
                this.isPublish = false;
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP30'));
            }
        }).catch(err => {
            this.isPublish = false;
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP31'));
        })

    }

    // 定时请求接口，获取发布状态
    getStatusOfPublish () {
        let statusOfPublish = setInterval(() => {
            // 如果循环请求接口的总时长超过10分钟就终止循环
            let nowDate = new Date().getTime() - this.publishDate
            if (nowDate >= 1000 * 600) {
                this.isPublish = false
                clearInterval(statusOfPublish)
                this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_IOS'), this.translate.instant('ADMIN_ERROR_TIP32'))
                return false;
            }
            let requestData = {
                accountId: sessionStorage.getItem('accountId')
            };
            this.remote.getIOSCustomInfo().then(response => {
                let resData = response.data
                if (resData['code'] === '0') {
                    let status = resData['data'].iosMobileCustomized.status
                    if (status === 1) {
                        this.isPublish = false
                        clearInterval(statusOfPublish)
                        this.rootScope.toggleNotificationModal(1, this.translate.instant('ADMIN_IOS'), this.translate.instant('ADMIN_SUCCESS13'))
                        this.getIOSCustomInfo()
                    } else if (status === 3) {
                        this.isPublish = false
                        clearInterval(statusOfPublish)
                        this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_IOS'), this.translate.instant('ADMIN_ERROR_TIP34'))
                    }
                } else {
                    this.isPublish = false
                    clearInterval(statusOfPublish)
                    this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_IOS'), this.translate.instant('ADMIN_ERROR_TIP34'))
                }
            }).catch(error => {
                this.isPublish = false
                clearInterval(statusOfPublish)
                this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_IOS'), this.translate.instant('ADMIN_ERROR_TIP34'))
            })
        }, 30000)
    }

    signout() {
        this.rootScope.signout()
    }
}
