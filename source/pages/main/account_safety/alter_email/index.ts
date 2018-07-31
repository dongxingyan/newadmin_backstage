import { Page, IPageParams, page } from 'common/page';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IAlterEmailPageParams extends IPageParams {
    email: string;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    params: ['email'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    title: '机构管理系统',
    name: 'main.alter-email'
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
class MainAlter_EmailPage extends Page<IAlterEmailPageParams> {
    oldEmail;
    newEmail;
    authCode;
    rules;
    disabled = false; // 验证码是否禁止
    codeTipVisibly = false;
    count = 60;
    errorTips = {};
    second = {count:this.count};

    init(timeout: angular.ITimeoutService){
        this.oldEmail = decodeURIComponent(this.params.email);
        this.rules = {
            newEmail: async (value, callback) => {
                if(!value){
                    callback(new Error(this.translate.instant('ADMIN_WARN_TIP21')));
                } else if(!/^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/.test(value)) {
                    callback(new Error(this.translate.instant('ADMIN_WARN_TIP22')));
                } else {
                    await this.remote.checkEmail({email: value}).then(res => {
                        if(res.data.code === '0'){
                            callback()
                        } else if(res.data.code === '52') {
                            callback(new Error(this.translate.instant('ADMIN_WARN_TIP23')));
                        } else {
                            callback(new Error(this.translate.instant('ADMIN_ERROR_TIP21')));
                        }
                    })
                }
            },
            authCode: (value, callback) => {
                if (!value) {
                    callback(new Error(this.translate.instant('ADMIN_WARN_TIP24')));
                } else {
                    callback()
                }
            }
        }
        this.addValidateEvent(this.rules)
    }

    getCode(event) {
        // 验证邮箱账号是否填写
        this.validateField(this.rules, 'newEmail', (valid) => {
            if (valid) {
                // 获取邮箱验证码
                this.remote.sendEmailCode({email: this.newEmail}).then(res => {
                    if (res.data.code === '0') {
                        this.count--;
                        this.second={count:this.count}
                        let timer = setInterval(() => {
                            this.count--;
                            this.second={count:this.count}
                            if(this.count === 0){
                                this.codeTipVisibly = false;
                                this.disabled = false;
                                clearInterval(timer);
                                this.count = 60;
                            }
                        }, 1000)
                        this.codeTipVisibly = true;
                        this.disabled = true;

                    } else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP22'))
                    }
                })
            }
        })
    }

    // 点击确定修改邮箱
    alterEmail() {
        let reqData = {
            email: this.newEmail,
            code: this.authCode
        }
        this.validate(this.rules, (valid) => {
            if (valid) {

                this.remote.alterAndBindEmail(reqData).then(res => {
                    if (res.data.code === '0') {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS7'));
                        setTimeout(() => {
                            this.uiState.go('main.account-safety');
                        },1000)
                    } else if(res.data.code === '8') {
                        this.errorTips['authCode'] = this.translate.instant('ADMIN_ERROR_TIP4');
                    } else if(res.data.code === '9') {
                        this.errorTips['authCode'] = this.translate.instant('ADMIN_ERROR_CODE_EXPIRED');;
                    } else {
                        this.errorTips['authCode'] = this.translate.instant('ADMIN_ERROR_TIP31');
                    }
                })
            }
        })
    }

    addValidateEvent(rules) {
        for (let [key, validFun] of Object.entries(rules)) {
            document.querySelector(`input[name='${key}']`).addEventListener('blur', () => {
                validFun(this[key], (err) => {
                    this.errorTips[key] = err ? err.message : '';
                })
            })
        }
    }

    async validate(rules, valid) {
        let result = true;
        for (let [key, validFun] of Object.entries(rules)) {
            await validFun(this[key], (err) => {
                if(err) {
                    result = false
                    this.errorTips[key] = err.message
                }
            })
        }
        valid(result);
    }

    async validateField(rules, field, valid) {
        let result = true;
        await rules[field](this[field], (err) => {
            if(err) {
                result = false
                this.errorTips[field] = err.message
            }
        })
        valid(result);
    }

    close() {
    }
    signout() {
        this.rootScope.signout()
    }
}
