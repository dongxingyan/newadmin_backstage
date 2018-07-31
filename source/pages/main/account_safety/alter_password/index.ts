import { Page, IPageParams, page } from 'common/page';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IAccountSafetyPageParams extends IPageParams {
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
    name: 'main.alter-password'
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
class MainAccount_SafetyPage extends Page<IAccountSafetyPageParams> {
    oldPassword;
    newPassword;
    rePassword;
    rules;
    errorTips = {};

    init(timeout: angular.ITimeoutService){
        this.rules = {
            oldPassword: (value, callback) => {
                if(!value){
                    return callback(new Error(this.translate.instant('ADMIN_WARN_TIP25')))
                } else {
                    callback()
                }
            },
            newPassword: (value, callback) => {
                if(!value){
                    return callback(new Error(this.translate.instant('ADMIN_WARN_TIP26')))
                } else if(!/^.{6,20}$/.test(value)){
                    return callback(new Error(this.translate.instant('ADMIN_WARN_TIP27')))
                }else if(value === this.oldPassword){
                    return callback(new Error(this.translate.instant('ADMIN_WARN_TIP28')))
                } else {
                    callback()
                }
            },
            rePassword: (value, callback) => {
                if(!value){
                    return callback(new Error(this.translate.instant('ADMIN_WARN_TIP29')))
                } else if(value !== this.newPassword){
                    return callback(new Error(this.translate.instant('ADMIN_WARN_TIP30')))
                } else{
                    callback()
                }
            }
        }
        this.addValidateEvent(this.rules);
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

    validate(rules, valid) {
        let result = true;
        for (let [key, validFun] of Object.entries(rules)) {
            validFun(this[key], (err) => {
                if(err) {
                    this.errorTips[key] = err.message
                    result = false
                }
            })
        }
        valid(result);
    }

    changePassword() {
        this.validate(this.rules, (valid)=>{
            if(!valid){
                return false;
            }
            let data = {
                newPassword: this.newPassword,
                oldPassword: this.oldPassword
            }
            let url = this.global.API_PATH + 'v1/orgs/' + sessionStorage.getItem("orgId") + '/change-admin-password?token=' + sessionStorage.getItem("token");
            let xmlhttp = new XMLHttpRequest();
            xmlhttp.open("put", url, false);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.send(JSON.stringify(data));
            if (xmlhttp.status == 200) {
                var res = JSON.parse(xmlhttp.responseText)
                if (res.code == "11") {
                    // this.rootScope.toggleInfoModal(4, '密码错误');
                    this.errorTips['oldPassword'] = this.translate.instant('ADMIN_ERROR_TIP23')
                }
                else if(res.code=="13"){
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP27'));
                }
                else if(res.code=="0"){
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS4'));
                    setTimeout(() => {
                        this.uiState.go('main.account-safety');
                    },1000)
                }
                else if(res.code=="999"){
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP3'));
                }
            } else {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP12'));
            }
        });
    }


    signout() {
        this.rootScope.signout()
    }
}
