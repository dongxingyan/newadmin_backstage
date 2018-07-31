import { Page, IPageParams, page } from '../../../common/page';
import {global} from '../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IUserCustomPageParams extends IPageParams {
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
  name: 'main.user-custom'
})

class MainUser_CustomPage extends Page<IUserCustomPageParams> {
  imageUrl = global.IMG_API_PATH;
  isOpenAdmin;
  isOpenMeeting;
  isOpenAndroid;
  isOpenIOS;
  isOpenDesktop;
  isOpenHardware;
  isOpenConference;
  isOpenInformation;
  admin = {
    id: 0,
    version: ''
  };
  meeting = {
    id: 0,
    version: ''
  };
  iOS = {
    id: 0,
    isHasNewVersion: false,
    version: '',
    systemVersion: '',
    url: ''
  };
  android = {
    id: 0,
    isHasNewVersion: false,
    version: '',
    systemVersion: '',
    url: ''
  };
  pc = {
    id: 0,
    isHasNewVersion: false,
    version: '',
    systemVersion: '',
    windowsUrl: '',
    macUrl: ''
  };
  hardware = {
    id: 0
  };
  conference = {
    id: 0
  };
  information = {
    id: 0
  };

  boxClick;
  fileHost;

  init() {
    setTimeout(()=>{
      this.rootScope.titleConetent.title= this.translate.instant('ADMIN_CUSTOMIZATION1');
    },50)
    // this.rootScope.titleConetent.titleEn="CUSTOMIZATION";
    this.fileHost = global.IMG_API_PATH;
    this.getCustomizedInfo();
    this.listenModalEvents();
  }
  // 获取定制化信息
  getCustomizedInfo () {
    this.remote.getCustomizedInfo().then(res => {
      if (res.data['code'] == 0) {
        let resData = res['data'].data;
        // 设置 后台管理系统定制化信息
        if (resData.adminCustomized) {
          if (resData.adminCustomized.status == 0) {
            this.isOpenAdmin = 2;
          } else {
            this.isOpenAdmin = 1;
            this.admin.id = resData.adminCustomized.id;
            this.admin.version = resData.version.adminCustomizedVersion;
          }
        } else {
          this.isOpenAdmin = 2;
        }
        // 设置 meeting系统定制化信息
        if (resData.meetingCustomized) {
          if (resData.meetingCustomized.status == 0) {
            this.isOpenMeeting = 2;
          } else {
            this.isOpenMeeting = 1;
            this.meeting.id = resData.meetingCustomized.id;
            this.meeting.version = resData.version.meetingCustomizedVersion;
          }
        } else {
          this.isOpenMeeting = 2;
        }
        // 设置 iOS定制化信息
        if (resData.iosMobileCustomized) {
          if (resData.iosMobileCustomized.status == 0) {
            this.isOpenIOS = false;
          } else {
            this.isOpenIOS = true;
            this.iOS.id = resData.iosMobileCustomized.id;
            this.iOS.version = resData.iosMobileCustomized.version;
            this.iOS.url = resData.iosMobileCustomized.url;
            this.iOS.systemVersion = resData.version.iosMobileCustomizedVersion;

            if (!this.iOS.systemVersion || !this.iOS.version) {
              this.iOS.isHasNewVersion = false;
            } else {
              // 截取版本号
              let versionArr = this.iOS.version.split('.');
              let sysVersionArr = this.iOS.systemVersion.split('.');
              let versionNum = Number(versionArr[versionArr.length - 1]);
              let sysVersionNum = Number(sysVersionArr[sysVersionArr.length - 1]);

              if (sysVersionNum > versionNum) {
                this.iOS.isHasNewVersion = true;
              } else {
                this.iOS.isHasNewVersion = false;
              }
            }
          }
        } else {
          this.isOpenIOS = false;
        }
        // 设置 安卓定制化信息
        if (resData.androidMobileCustomized) {
          if (resData.androidMobileCustomized.status == 0) {
            this.isOpenAndroid = false;
          } else {
            this.isOpenAndroid = true;
            this.android.id = resData.androidMobileCustomized.id;
            this.android.version = resData.androidMobileCustomized.version;
            this.android.url = resData.androidMobileCustomized.url;
            this.android.systemVersion = resData.version.androidMobileCustomizedVersion;
            if (!this.android.systemVersion || !this.android.version) {
              this.android.isHasNewVersion = false;
            } else {
              // 截取版本号
              let versionArr = this.android.version.split('.');
              let sysVersionArr = this.android.systemVersion.split('.');
              let versionNum = Number(versionArr[versionArr.length - 1]);
              let sysVersionNum = Number(sysVersionArr[sysVersionArr.length - 1]);

              if (sysVersionNum > versionNum) {
                this.android.isHasNewVersion = true;
              } else {
                this.android.isHasNewVersion = false;
              }
            }
          }
        } else {
          this.isOpenAndroid = false;
        }
        // 设置 PC客户端定制化信息
        if (resData.desktopCustomized) {
          if (resData.desktopCustomized.status == 0) {
            this.isOpenDesktop = false;
          } else {
            this.isOpenDesktop = true;
            this.pc.id = resData.desktopCustomized.id;
            this.pc.version = resData.desktopCustomized.version;
            this.pc.systemVersion = resData.version.desktopCustomizedVersion;
            this.pc.version = resData.desktopCustomized.version;
            this.pc.windowsUrl = resData.desktopCustomized.windowsUrl;
            this.pc.macUrl = resData.desktopCustomized.macUrl;

            if (!this.pc.systemVersion || !this.pc.version) {
              this.pc.isHasNewVersion = false;
            } else {
              // 截取版本号
              let versionArr = this.pc.version.split('.');
              let sysVersionArr = this.pc.systemVersion.split('.');
              let versionNum = Number(versionArr[versionArr.length - 1]);
              let sysVersionNum = Number(sysVersionArr[sysVersionArr.length - 1]);

              if (sysVersionNum > versionNum) {
                this.pc.isHasNewVersion = true;
              } else {
                this.pc.isHasNewVersion = false;
              }
            }
          }
        } else {
          this.isOpenDesktop = false;
        }
        // 设置 硬件界面定制化信息
        if (resData.customized) {
          if (resData.customized.isEVCCustomized == 1) {
            this.isOpenHardware = true;
          }
        }
        // 设置 企业视讯定制化信息
        if (resData.conferenceCustomized) {
          if (resData.conferenceCustomized.status == 1) {
            this.isOpenConference = true;
          }
        }
          // 设置 企业信息墙定制化信息
          if (resData.customized) {
              if (resData.customized.isEnterpriseInfoCustomized == 1) {
                  this.isOpenInformation = true;
              }
          }
      } else {
        // 失败
      }
    })
  }
  // 监听弹出框事件
  listenModalEvents () {
    this.boxClick = (path, type, infoObj) => {

      if (!this[type]) {
        $('#myModal').modal('show');
        return false;
      }
      if(path == 'main.custom-information.content') {
        this.uiState.go(path, {id: infoObj.id});
      }
    }
  }
  signout() {
    this.rootScope.signout()
  }
}
