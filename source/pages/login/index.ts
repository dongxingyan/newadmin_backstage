import { Page, IPageParams, page } from 'common/page';
import ITimeoutService = angular.ITimeoutService;
import 'babel-polyfill/lib';

require('./style.styl');

require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));

@page({
  template: require('./tmpl.html'),
  requires: ['$timeout'],
  title: ''
})

class LoginPage extends Page<IPageParams> {
  username: string;
  password: string;
  errorMsg: string;
  isLogin = false;
  loginText: string;
  timeout: ITimeoutService;
  loginLogonStyle; //登录页logo  ng-style
  backgroundStyle; //登录页背景

  // init里面不要写逻辑，只写方法的调用
  init(timeout: ITimeoutService) {
    this.timeout = timeout;
    this.getCustomInfo();
    this.initLoginBtnText();
  }
  // 初始化登录按钮文案
  initLoginBtnText() {
    this.loginText = 'ADMIN_LOGIN';
  }
  // 获取定制化信息
  getCustomInfo() {
    let domain = document.domain;

    this.remote.getCustomImgByDomain(domain).then(res => {
      this.setCustomStyle(res);
    });
  }
  // 设置定制化样式
  setCustomStyle(res) {
    let
        data             = res.data.data,
        host             = this.global.IMG_API_PATH,
        defaultLoginLogo = require('static/images1/loginbcg.png'),
        titleOfDom       = document.querySelector('title');

      // 设置登录页logo
      this.loginLogonStyle =
          data && data.loginLogo ?
              `${ host }${ data.loginLogo }` :
              defaultLoginLogo;
      // 设置登录页背景图
      this.backgroundStyle =
          data && data.background ?
              { background: `url(${host}${data.background}) left top/cover no-repeat` } :
              { background: `url(./libs/images2/bodybg.png) left top/cover no-repeat` };
      // 下面的有直接操作DOM，以后需要优化
      // 设置ico图标
      if (data && data.ico) {
        document.querySelector('link[rel="icon"]').setAttribute('href', host + data.ico);
      }
      // 设置title
      titleOfDom.innerHTML =
          data && data.name ?
              data.name :
              this.translate.instant('ADMIN_SYSTEM_NAME');
  }
  // input 输入框回车事件
  enterEvent($event) {
    if ($event.which === 13) {
      this.login();
    }
  }
  // 登录
  login() {
    let
        username = this.username,
        password = this.password,
        isLogin  = this.isLogin;

    if (!isLogin) {
      switch (true) {
        case !username:
          this.errorMsg = this.translate.instant('ADMIN_ERROR_TIP');
          break;
        case !password:
          this.errorMsg = this.translate.instant('ADMIN_ERROR_TIP1');
          break;
        default:
          this.loginText = this.translate.instant('ADMIN_LOGINING');
          this.isLogin = true;
          // 获取登录信息
          this.getLoginInfo();
      }
    }
  }
  // 调取登录接口 并对其返回的数据做相应的处理
  getLoginInfo() {
    let requestData = {
      username: this.username,
      password: this.password,
      domainName: document.domain
    };
    this.remote.login(requestData)
        .then((res) => {
          let
              response = res.data,
              code = response.code,
              resultData = response.data;
          switch (code) {
            case '0':
              let { 'org_id': orgId, accountId, userId, token } = resultData;
              // 如果orgId或accountId不能存在则表明其不是机构账号，直接给出相应的错误提示信息
              if (orgId && accountId) {
                // 把用户数据存储到sessionStorage中
                Object.assign(this.session, {
                  token,
                  orgId,
                  accountId,
                  userId
                })
                // 跳转到状态总览页面
                this.uiState.go('main.status');
              } else {
                this.errorMsg = this.translate.instant('ADMIN_ERROR_TIP2');
              }
                  break;
            case '6':
              this.errorMsg = this.translate.instant('ADMIN_ERROR_TIP2');
                  break;
            case '63':
              this.errorMsg = this.translate.instant('ADMIN_ERROR_ACCOUNT_CLOSED');
              break;
            case '999':
              this.errorMsg = this.translate.instant('ADMIN_ERROR_TIP3');
                  break;
            default:
              this.errorMsg = res.data.message;
                  break;
          }
          // 不管结果如何 都把登录按钮的文案进行初始化
          this.isLogin = false;
          this.initLoginBtnText();
        });
  }
}
