import {Page, IPageParams, page} from "../../../common/page";
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
    name: 'main.account-safety'
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
    hasEmail = false;
    hasPhone = false;
    username;
    newUsername;
    email;
    encodeEmail;
    phone;
    isUsernameModified;
    errorTip = {};
    alterInputVisibly = false;


    // 只能修改一次的账号， 点击确定修改
    alterAccNameConfirm() {
        let reqData = {
            newUsername: this.newUsername
        }
        // 判断为空
        if (!this.newUsername) {
            return this.errorTip['username'] = this.translate.instant('ADMIN_WARN_TIP34');
        }
        this.remote.alterUsername(reqData).then(res => {
            if(res.data.code === '0') {
                this.username = this.newUsername;
                this.isUsernameModified = true;
                this.alterInputVisibly = false;
            } else if(res.data.code === '15') {
                // 用户名已存在
                this.errorTip['username'] = this.translate.instant('ADMIN_ERROR_TIP17');
            }
        })
    }

    alterAccNameCancel() {
        this.alterInputVisibly=false;
        this.newUsername = '';
        this.errorTip = {};
    }

    // 获取账号信息
    getAccountStatus() {
        this.remote.getUserStatus().then((res) => {
            if(res.data.code === '0') {
                let result = res.data.data;
                this.username = result.username;
                this.email = result.email;
                this.encodeEmail = encodeURIComponent(result.email);
                this.phone = result.phone;
                this.isUsernameModified = result.isUsernameModified;
            }
        })
    }

    // 保密邮箱
    hideEmail() {

    }

    // 保密手机号
    hidePhoneNum() {

    }
    init(timeout: angular.ITimeoutService){
        timeout(()=>{
            this.rootScope.titleConetent.title= this.translate.instant('ADMIN_ACCOUNT_SAFETY');
        },50)
        this.getAccountStatus();
    }
}
