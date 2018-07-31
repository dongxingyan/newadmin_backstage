import {Page, IPageParams, page} from '../../../../../common/page';
import {global} from '../../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IApkPageParams extends IPageParams {
    page: string;
    id;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    // params: ['id'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    title: '机构管理系统',
    name: 'main.custom-hardware.apk'
})

class MainHardware_ApkPage extends Page<IApkPageParams> {
    apkList;
    isAllSelect = false;
    searchType = '1';
    pageId = 1;
    pageSize = '10';
    queryId = '0';
    totalSize = 0;
    isShowOfChannelSelect = false;
    isShowOfOrgSelect = false;
    apkName = '';
    maxSize = 7;
    fileUrl = global.IMG_API_PATH;
    create;
    update;
    deleteId;
    version;
    delete;

    init(timeout: angular.ITimeoutService) {
        // 初始化对象变量
        this.initVariableOfObj();
        // 获取APK信息列表
        this.getApkInfoList();
        this.modalHide();
        this.uploadFile();
        this.updateUploadFile();
    }

    // 初始化对象变量
    initVariableOfObj () {
        this.create = {
            apkName: '',
            installType: '1',
            isShowErrorTip: false,
            errorText: ''
        };
        this.update = {
            apkName: '',
            installType: '1',
            isShowErrorTip: false,
            errorText: '',
            apkId: 0,
            online: 0
        };
        this.version = {
            index: -1,
            versionList: null,
            pageId: 1,
            pageSize: '6',
            totalSize: 0,
            apkId: 0,
            apkName: '',
            create: {
                versionNum: '',
                packName: '',
                installPack: '',
                absoluteUrl: '',
                versionDesc: '',
                isShowErrorTip: false,
                errorText: ''
            },
            update: {
                versionNum: '',
                packName: '',
                installPack: '',
                absoluteUrl: '',
                versionDesc: '',
                isShowErrorTip: false,
                errorText: '',
                versionId: 0,
                index: -1
            },
            delete: {
                id: 0
            }
        };
        this.delete = {
            deleteId: 0,
            deleteType: 0   // 0: 初始值；1: 删除单个盒子；2: 删除多个盒子
        };
    }
    // 获取APK信息列表
    getApkInfoList() {
        let searchType = this.searchType,
            requestData = {
                start: this.pageId,
                size: this.pageSize,
                apkName: this.apkName
            };

        this.remote.getApkListInfo(requestData)
            .then(res => {
                let resData = res.data,
                    response = resData.data;

                if (resData.code === '0') {
                    this.totalSize = response.totalSize;
                    response.resultList.forEach((item, index) => {
                        item.isSelect = 0;
                    });
                    this.isAllSelect = false;
                    this.apkList = response.resultList;
                } else {
                    this.rootScope.toggleInfoModal(4, '获取数据失败，请稍后重试')
                }
            })
    }
    // 全选操作
    isSelectAll () {
        let isAllSelect = this.isAllSelect,
             apkList = this.apkList;
        // 全部选中
        if (!isAllSelect) {
            apkList.forEach(function (item, index) {
                item.isSelect = 1;
            })
        } else {    // 全部不选中
            apkList.forEach(function (item, index) {
                item.isSelect = 0;
            })
        }
        this.isAllSelect = !isAllSelect;
    }
    // 点击列表每一项 对其判断是否是全选或非全选状态
    isAllSelectOfItemClick (apk) {
        let apkList = this.apkList;
        apk.isSelect = apk.isSelect ^ 1;

        for (var i = 0; i < apkList.length; i++) {
            if (!apkList[i].isSelect) {
                this.isAllSelect = false;
                return false;
            }
        }
        this.isAllSelect = true;
    }
    // 上下线
    upOrDownline (apk) {
        let requestParam = {
            id: apk.id
        };
        this.remote.upOrDownline(requestParam)
            .then(res => {
                let resData = res.data,
                    response = resData.data;

                if (resData.code === '0') {
                    apk.online = !apk.online;
                    this.rootScope.toggleInfoModal(1, '上下线编辑成功');
                } else {
                    this.rootScope.toggleInfoModal(4, '上下线编辑失败');
                }
            })
    }
    /* 新增 */
    // 模态框弹出 清空数据
    modalHide () {
        // 新增apk模态框
        $('#apkCreateModal').on('hide.bs.modal', (e) => {
            this.create = {
                apkName: '',
                installType: '1',
                isShowErrorTip: false,
                errorText: ''
            };
        })

        $('#createVersionModal').on('hide.bs.modal', (e) => {
            this.version.create.versionNum = '';
            this.version.create.packName = '';
            this.version.create.absoluteUrl = '';
            this.version.create.versionDesc = '';
            this.version.create.installPack = '';
            this.version.create.isShowErrorTip = false;
            this.version.create.errorText = '';
        })
        $('#apkVersionModal').on('hide.bs.modal', (e) => {
            let index = this.version.index,
                versionNum = this.version.versionList[0].versionNum;

            this.apkList[index].versionNum = versionNum;
        })
    }
    createOfApk () {
        if (!this.create.apkName) {
            this.create.errorText = '请填写APK名称';
            this.create.isShowErrorTip = true;
            return false;
        }

        let requestData = {
            name: this.create.apkName,
            installWay: Number(this.create.installType)
        };

        this.remote.addAPK(requestData)
            .then(res => {
                $('#apkCreateModal').modal('hide');
                if (res.data.code === '0') {
                    this.getApkInfoList();
                    this.rootScope.toggleInfoModal(1, 'APK添加成功');
                } else {
                    this.rootScope.toggleInfoModal(4, 'APK添加失败');
                }
            })
    }
    /* 修改 */
    updateModalShow (apk, index) {
        this.update.apkName = apk.name.toString();
        this.update.installType = apk.installWay.toString();
        this.update.apkId = apk.id;
        this.update.isShowErrorTip = false;
        this.update.errorText = '';
        this.update.online = apk.online;
        this.update.index = index;
    }
    updateOfApk () {
        var self = this,
            curIndex = self.update.index;
        if (!this.update.apkName) {
            this.update.errorText = '请填写APK名称';
            this.update.isShowErrorTip = true;
            return false;
        }

        let requestData = {
            name: this.update.apkName,
            installWay: this.update.installType,
            id: this.update.apkId,
            online: Number(this.update.online)
        };

        this.remote.updateAPK(requestData)
            .then(res => {
                $('#apkEditModal').modal('hide');
                self.update.apkId = 0;

                if (res.data.code === '0') {
                    self.apkList[curIndex].name = requestData.name;
                    self.apkList[curIndex].installWay = requestData.installWay;
                    this.rootScope.toggleInfoModal(1, 'APK修改成功');
                } else {
                    this.rootScope.toggleInfoModal(4, 'APK修改失败');
                }
            })
    }
    /* 删除 */
    deleteApks () {
        let requestParam = [],
            deleteType = this.delete.deleteType,
            deleteId = this.deleteId,
            apkList = this.apkList;

        if (deleteType === 1) {
            requestParam.push(deleteId)
        } else if (deleteType === 2) {
            apkList.forEach(function (item, index) {
                if (item.isSelect === 1 && item.type === 3) {
                    requestParam.push(item.id);
                }
            })
        }

        this.remote.deleteApks(requestParam)
            .then(res => {
                $('#apkDeleteModal').modal('hide');
                let resData = res.data;

                if (resData.code === '0') {
                    this.rootScope.toggleInfoModal(1, '删除APK成功');
                    this.getApkInfoList();
                } else if (resData.code === '21') {
                    this.rootScope.toggleInfoModal(4, resData.message);
                } else {
                    this.rootScope.toggleInfoModal(4, '删除APK失败, 请稍后重试');
                }
            })
    }
    // 全选删除 的模态框弹出时机错误，增加判断
    deleteManyOpen () {
        let validIndex= this.apkList.findIndex((item) => item.isSelect === 1 && item.type === 3)
        if (validIndex !== -1) {
            this.delete.deleteType=2
            $('#apkDeleteModal').modal('show')
        }
    }
    /* 版本管理 */
    getApkVersionInfo () {
        let requestData = {
            apkId: this.version.apkId,
            start: this.version.pageId,
            size: this.version.pageSize
        };

        this.remote.getApkVersionInfo(requestData)
            .then(res => {
                if (res.data.code === '0') {
                    this.version.versionList = res.data.data.resultList;
                    this.version.totalSize = res.data.data.totalSize;
                }
            })
    }
    // 新建版本 选择文件
    selectFile () {
        $('#J-install-upload').trigger('click');
    }
    // 新建版本 上传文件
    uploadFile () {
        $('#J-install-upload').off('change').on('change', (event) => {
            let file = event.target.files[0],
                fileName = file.name,
                fileNameArr = fileName.split('.'),
                formData = new FormData();

            formData.append('file', event.target.files[0]);

            this.remote.uploadFileOfHardware('apk', formData)
                .then(res => {
                    if (res.data.code === '0') {
                        this.version.create.installPack = res.data.data.filePath;
                        this.version.create.absoluteUrl = this.fileUrl + res.data.data.filePath;
                    }
                })
        })
    }
    // 新建版本
    createVersion () {
        let versionNum = this.version.create.versionNum,
            packName = this.version.create.packName,
            installPack = this.version.create.installPack,
            versionDesc = this.version.create.versionDesc;

        if (!versionNum) {
            this.version.create.isShowErrorTip = true;
            this.version.create.errorText = '请填写版本号';
            return false;
        }
        if (!/^[1-9]\d*$/.test(versionNum)) {
            this.version.create.isShowErrorTip = true;
            this.version.create.errorText = '版本号必须为大于0的数字';
            return false;
        }
        if (!packName) {
            this.version.create.isShowErrorTip = true;
            this.version.create.errorText = '请填写包名';
            return false;
        }
        if (!installPack) {
            this.version.create.isShowErrorTip = true;
            this.version.create.errorText = '请上传安装包';
            return false;
        }

        this.version.create.isShowErrorTip = false;
        this.version.create.errorText = '';

        let requestData = {
            versionNum: versionNum,
            versionDesc: versionDesc,
            packName: packName,
            packUrl: installPack,
            apkId: this.version.apkId
        };

        this.remote.addApkVersion(requestData)
            .then(res => {
                var resData = res.data;

                if (resData.code === '0') {
                    $('#createVersionModal').modal('hide');
                    this.getApkVersionInfo();
                } else {
                    this.version.create.isShowErrorTip = true;
                    this.version.create.errorText = '新建APK版本失败';
                }
            })
    }
    // 修改版本 模态框弹出
    updateVersionModalShow (version) {
        this.version.update.versionId = version.id;
        this.version.update.versionNum = version.versionNum;
        this.version.update.packName = version.packName;
        this.version.update.versionDesc = version.versionDesc;
        this.version.update.isShowErrorTip = false;
        this.version.update.errorText = '';

        if (version.packUrl) {
            this.version.update.installPack = version.packUrl;
            this.version.update.absoluteUrl = this.fileUrl + version.packUrl;
        } else {
            this.version.update.installPack = '';
            this.version.update.absoluteUrl = '';
        }
    }
    // 修改版本 选择文件
    updateSelectFile () {
        $('#J-update-install-upload').trigger('click');
    }
    // 修改版本 上传文件
    updateUploadFile () {
        $('#J-update-install-upload').off('change').on('change', (event) => {
            let file = event.target.files[0],
                fileName = file.name,
                fileNameArr = fileName.split('.'),
                formData = new FormData();

            formData.append('file', event.target.files[0]);

            this.remote.uploadFileOfHardware('apk', formData)
                .then(res => {
                    if (res.data.code === '0') {
                        this.version.update.installPack = res.data.data.filePath;
                        this.version.update.absoluteUrl = this.fileUrl + res.data.data.filePath;
                    }
                })
        })
    }
    // 修改版本
    updateVersion () {
        let versionNum = this.version.update.versionNum,
            packName = this.version.update.packName,
            installPack = this.version.update.installPack,
            versionDesc = this.version.update.versionDesc;

        if (!versionNum) {
            this.version.update.isShowErrorTip = true;
            this.version.update.errorText = '请填写版本号';
            return false;
        }
        if (!/^[1-9]\d*$/.test(versionNum)) {
            this.version.update.isShowErrorTip = true;
            this.version.update.errorText = '版本号必须为大于0的数字';
            return false;
        }
        if (!packName) {
            this.version.update.isShowErrorTip = true;
            this.version.update.errorText = '请填写包名';
            return false;
        }
        if (!installPack) {
            this.version.update.isShowErrorTip = true;
            this.version.update.errorText = '请上传安装包';
            return false;
        }

        this.version.update.isShowErrorTip = false;
        this.version.update.errorText = '';

        let requestData = {
            versionNum: versionNum,
            versionDesc: versionDesc,
            packName: packName,
            packUrl: installPack,
            apkId: this.version.apkId,
            id: this.version.update.versionId
        };

        this.remote.updateApkVersion(requestData)
            .then(res => {
                let resData = res.data;

                if (resData.code === '0') {
                    $('#editVersionModal').modal('hide');
                    this.getApkVersionInfo();
                } else {
                    this.version.update.isShowErrorTip = true;
                    this.version.update.errorText = '修改APK版本失败';
                }
            })
    }
    // 删除版本
    deleteVersion (versionId) {
        let requestData = {
            id: versionId
        };

        this.remote.deleteApkVersion(requestData)
            .then(res => {
                this.getApkVersionInfo();
            })
    }
    signout() {
        this.rootScope.signout()
    }
}
