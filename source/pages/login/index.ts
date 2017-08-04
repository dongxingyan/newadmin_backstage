import {Page, IPageParams, page} from "../../common/page";
import ITimeoutService = angular.ITimeoutService;
import 'babel-polyfill/lib';

require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
require('./style.styl');
@page({
    template: require('./tmpl.html'),
    requires: ['$timeout'],
    title: "机构管理系统"
})
class LoginPage extends Page<IPageParams> {
    username: string;
    password: string;
    checkCode
    codeUrl
    errorMsg: string;
    isLogin = false;
    loginText = "登录"
    timeout: ITimeoutService;

    isFailed() {
        if (this.errorMsg) {
            return true;
        }
        else {
            return false;
        }
    }

    async init(timeout: ITimeoutService) {
        this.timeout = timeout;
        this.codeUrl = this.global.API_PATH + 'getCaptchaImage?' + Math.random()
    }


    async getCode() {
        this.codeUrl = this.global.API_PATH + 'getCaptchaImage?' + Math.random()
    }
    async login() {
        if (!this.isLogin) {
            this.errorMsg = null;
            console.log("开始登录")
            if (!this.username) {
                console.log("用户名")
                this.errorMsg = "请输入用户名!";
            }
            else if (!this.password) {
                console.log("密码")
                this.errorMsg = "请输入密码!"
            }
            // else if (!this.checkCode) {
            //     console.log("验证码")
            //     this.errorMsg = "请输入验证码"
            // }
            else if(!this.isLogin) {
                this.loginText = "正在登录中，请稍候..."
                this.isLogin = true;
                console.log(this.loginText)
                this.errorMsg = null;
                // console.debug(this.username, this.password,);
                // this.remote.codeCheck(this.checkCode)
                //     .then((res) => {
                //         console.log(this.checkCode)
                //         console.log(res)
                //         if (res == "true") {
                //             console.log("验证正确")
                            this.timeout(() => {
                                this.remote.login(this.username, this.password)
                                    .then((res) => {
                                        // this.waitLogin = false;
                                        console.log(res.data);
                                        if (res.data.code == "0") {
                                            this.session.token = res.data.token;
                                            this.session.orgId = res.data.data.org_id;
                                            this.uiState.go('main.status');
                                        } else {
                                            if (res.data.code == "6") {
                                                console.log("用户不存在")
                                                this.errorMsg = '用户名或密码错误！'
                                            }
                                            else {
                                                if (res.data.code == "999")
                                                    this.errorMsg = "服务器内部错误！"
                                            }
                                        }
                                        this.loginText = '登录'
                                    });

                            }, 1000);
                        }
                        else {
                            this.errorMsg = "验证码错误"
                            this.loginText = "登录"
                        }
                        this.isLogin = false;
                    // });
            // }

        }

            // this.waitLogin=true
    }
}

