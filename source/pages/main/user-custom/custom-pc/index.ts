import { Page, IPageParams, page } from '../../../../common/page';
import { global } from '../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomPcPageParams extends IPageParams {
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
    name: 'main.custom-pc'
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
class MainCustom_PcPage extends Page<ICustomPcPageParams> {
    color;
    appName;
    packAppName;
    version;
    packName;
    installPackName;
    macUrl;
    windowsUrl;
    systemVersion;
    ico;
    indexImageUrl;
    logoUrl;
    background;
    installImageUrl1;
    installImageUrl2;
    isHasNewVersion = false;
    fileType;
    imageUrl = global.IMG_API_PATH;
    isPublish = false;
    publishDate;
    windowsStatus = false;
    macStatus = false;
    colors = {
        blue: '#0a9af9',
        gold: '#d4a660',
        green: '#0da591',
        orange: '#f8922f',
        red: '#a3121a'
    };

    init() {
        setTimeout(()=>{
            this.rootScope.titleConetent.title=this.translate.instant('ADMIN_CUSTOMIZATION4');
        },50)
        // this.rootScope.titleConetent.titleEn="CUSTOMIZATION";
        this.getPCCustomInfo();
        this.addListenerfileChange();
    }

    getPCCustomInfo() {
        this.remote.getPCCustomInfo()
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        let resData = res.data['data'];
                        // 获取定制化信息
                        this.color = resData.desktopCustomized.color  || '#0a9af9';
                        this.appName = resData.desktopCustomized.appName;
                        this.packAppName = resData.desktopCustomized.appName;
                        this.version = resData.desktopCustomized.version;
                        this.installPackName = resData.desktopCustomized.installPackName;
                        this.packName = resData.desktopCustomized.packName;
                        this.macUrl = resData.desktopCustomized.macUrl;
                        this.windowsUrl = resData.desktopCustomized.windowsUrl;
                        this.systemVersion = resData.systemVersion;
                        this.ico = resData.desktopCustomized.iconUrl;
                        this.indexImageUrl = resData.desktopCustomized.indexImageUrl;
                        this.logoUrl = resData.desktopCustomized.logoUrl;
                        this.background = resData.desktopCustomized.backgroundUrl;
                        this.installImageUrl1 = resData.desktopCustomized.installImageUrl1;
                        this.installImageUrl2 = resData.desktopCustomized.installImageUrl2;
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
                        let windowsStatus = resData.desktopCustomized.windowsStatus
                        let macStatus = resData.desktopCustomized.macStatus
                        // mac或windows处于发布状态中
                        if (windowsStatus === 2 || macStatus === 2) {
                            if (windowsStatus === 2 && macStatus === 2) {
                                this.isPublish = true
                                this.windowsStatus = false
                                this.macStatus = false
                            }
                            if (windowsStatus === 2 && macStatus !== 2) {
                                this.isPublish = false
                                this.windowsStatus = true
                                this.macStatus = false
                            }
                            if (windowsStatus !== 2 && macStatus === 2) {
                                this.isPublish = false
                                this.windowsStatus = false
                                this.macStatus = true
                            }
                            if (!this.publishDate) {
                                this.publishDate = new Date().getTime()
                            }
                            this.getStatusOfPublish()
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
        $('#J-pc-input-file').off('change').on('change', (event) => {
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
        $('#J-pc-input-file').trigger('click');
    }

    PCInfoSave() {
        let requestParam = {
            id: Number(this.params.id),
            color: this.color,
            appName: this.appName,
            backgroundUrl: this.background,
            iconUrl: this.ico,
            indexImageUrl: this.indexImageUrl,
            logoUrl: this.logoUrl,
            installPackName: this.installPackName,
            installImageUrl1: this.installImageUrl1,
            installImageUrl2: this.installImageUrl2
        };
        this.remote.updPCCustomized(requestParam)
            .then(response => {
                if (response.data['code'] === '0') {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS4'));
                    this.getPCCustomInfo();
                } else {
                    this.rootScope.toggleInfoModal(4, response.data['data'].message);
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString());
            })
    }

    publishPCVersion() {
        if (!(this.appName && this.installPackName && this.ico && this.indexImageUrl && this.logoUrl && this.background && this.installImageUrl1 && this.installImageUrl2)) {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP17'));
            return
        }
        this.isPublish = true;
        // 发布前先保存
        let requestParam = {
            id: Number(this.params.id),
            color: this.color,
            appName: this.appName,
            backgroundUrl: this.background,
            iconUrl: this.ico,
            indexImageUrl: this.indexImageUrl,
            logoUrl: this.logoUrl,
            installPackName: this.installPackName,
            installImageUrl1: this.installImageUrl1,
            installImageUrl2: this.installImageUrl2
        };
        this.remote.updPCCustomized(requestParam).then(res => {
            if (res.status === 200) {
                if (res.data['code'] === '0') {
                    this.remote.publishInstallPackage('PC')
                        .then(response => {
                            if (response.data['code'] === '0') {
                                this.publishDate = new Date().getTime()
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
                this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_PC'), this.translate.instant('ADMIN_ERROR_TIP32'))
                return false;
            }
            this.remote.getPCCustomInfo().then(response => {
                let resData = response.data
                if (resData['code'] === '0') {
                    let windowsStatus = resData.data.desktopCustomized.windowsStatus
                    let macStatus = resData.data.desktopCustomized.macStatus
                    // windows、mac同时在发布过程中
                    if (windowsStatus === 2 && macStatus === 2) {
                        this.isPublish = true
                        this.windowsStatus = false
                        this.macStatus = false
                    } else if (macStatus === 2 && windowsStatus !== 2) {  // 只有mac处于发布过程中
                        this.isPublish = false
                        this.windowsStatus = false
                        this.macStatus = true
                        this.updateShowData(resData)
                    } else if (windowsStatus === 2 && macStatus !== 2) {  // 只有windows处于发布过程中
                        this.isPublish = false
                        this.windowsStatus = true
                        this.macStatus = false
                        this.updateShowData(resData)
                    } else {  // 剩余的所有情况
                        this.isPublish = false
                        this.windowsStatus = false
                        this.macStatus = false
                        clearInterval(statusOfPublish)
                        if (windowsStatus === 1 && macStatus === 1) {
                            this.rootScope.toggleNotificationModal(1, this.translate.instant('ADMIN_PC'), this.translate.instant('ADMIN_SUCCESS14'))
                        }
                        if (windowsStatus === 3 && macStatus === 3) {
                            this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_PC'), this.translate.instant('ADMIN_ERROR_TIP35'))
                        }
                        this.updateShowData(resData)
                    }
                } else {
                    this.isPublish = false
                    this.windowsStatus = false
                    this.macStatus = false
                    clearInterval(statusOfPublish)
                    this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_PC'), this.translate.instant('ADMIN_ERROR_TIP35'))
                }
            }).catch(error => {
                this.isPublish = false
                clearInterval(statusOfPublish)
                this.rootScope.toggleNotificationModal(2, this.translate.instant('ADMIN_PC'), this.translate.instant('ADMIN_ERROR_TIP35'))
            })
        }, 30000)
    }

    // 刷新数据
    updateShowData (resData) {
        let responseData = resData.data
        // 获取定制化信息
        this.appName = responseData.desktopCustomized.appName;
        this.packAppName = responseData.desktopCustomized.appName;
        this.version = responseData.desktopCustomized.version;
        this.packName = responseData.desktopCustomized.packName;
        this.installPackName = responseData.desktopCustomized.installPackName;
        this.macUrl = responseData.desktopCustomized.macUrl;
        this.windowsUrl = responseData.desktopCustomized.windowsUrl;
        this.systemVersion = responseData.systemVersion;
        this.ico = responseData.desktopCustomized.iconUrl;
        this.indexImageUrl = responseData.desktopCustomized.indexImageUrl;
        this.logoUrl = responseData.desktopCustomized.logoUrl;
        this.background = responseData.desktopCustomized.backgroundUrl;
        this.installImageUrl1 = responseData.desktopCustomized.installImageUrl1;
        this.installImageUrl2 = responseData.desktopCustomized.installImageUrl2;
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
    }

    signout() {
        this.rootScope.signout()
    }
}
