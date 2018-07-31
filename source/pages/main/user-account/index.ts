import {Page, IPageParams, page} from "../../../common/page";
import {async} from "rxjs/scheduler/async";
import {timeout} from "rxjs/operator/timeout";
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IUserAccountPageParams extends IPageParams {
    page: string;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    params: ['page'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    name: 'main.user-account'
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
class MainUser_AccountPage extends Page<IUserAccountPageParams> {
    name = 'hello order manager';
    visible//控制弹框的显示
    visible1//控制弹框1的显示
    feedbackContent//弹框中显示的内容
    //弹框中的信息
    department//所属机构名
    aliasName//账号别名
    account//登录账号
    loginPassword//登录密码
    departments//部门
    departName//选中的部门名称
    userName//用户名
    acountEmail//账号邮箱
    phoneNum//联系电话
    remark//账号描述
    pexipName
    users;
    userId;
    departId;
    accountList;
    totalCount: number//总条数
    pageSize: number = 10;//每页显示条数
    selPage: number = 1;
    imgBase;
    imgName;
    codeSrc;//二维码的路径

    init() {
        this.getAccountInfo();
        this.imgBase = global.IMG_API_PATH1;
    }
    // 获取用户账号信息
    getAccountInfo () {
        this.remote.userAccount({
            start: this.selPage,
            size: this.pageSize
        })
            .then((res) => {
                if (res.data.code == "0") {
                    this.accountList = res.data.data.resultList;
                    this.totalCount = res.data.data.totalSize;
                }
            })
    }
    //点击修改用户信息
    userModify(id, departId, alias) {
        //获取该机构中所有的部门
        this.visible = true;
        this.aliasName = "" || alias;
        this.remote.getDepts()
            .then((res) => {
                this.departments = res.data.data;
            })
        //获取该账号的所属机构和别名
        this.remote.getDepartment()
            .then((res) => {
                if (res.data.code == "0")
                    this.department = res.data.data.name;
            })
        this.remote.getUsers(id)
            .then((res) => {
                if (res.data.code == 0) {
                    this.account = res.data.data.pexipName || "";
                    this.loginPassword = res.data.data.pexipPassword || "";
                    this.userName = res.data.data.displayName || "";
                    this.acountEmail = res.data.data.userEmail || "";
                    this.phoneNum = res.data.data.userTel || "";
                    this.remark = res.data.data.description || "";
                    this.userId = res.data.data.id;
                    this.departName = res.data.data.departId || "";
                    this.pexipName = res.data.data.pexipName;
                }
            })
    }

    //  确定保存自己的编辑
    sureEdit() {
        //提交的时候需要判断的有：
        //    登录密码不能为空
        //    登录帐号不能为空
        //    邮箱格式是否正确
        //    手机格式是否正确
        //    密码为6-12位字母或数字
        //    账号为6-12位字母或数字
        if(!this.loginPassword) {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP47'));
            return;
        }

        if (!this.account) {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP48'));
            return;
        }

        if ((!this.acountEmail.match(/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/)) && (this.acountEmail != '')) {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP13'));
        }
        else if ((!this.phoneNum.match(/^(1+\d{10})$/)) && this.phoneNum != "") {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP14'));

        }
        else if ((!this.loginPassword.match(/^[a-zA-Z0-9]{6,12}$/)) && this.loginPassword != "") {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP15'));

        }
        else if ((!this.account.match(/^[a-zA-Z0-9]{6,12}$/)) && this.account != "") {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP16'));
        }
        else {
            let data = {
                organId: sessionStorage.getItem("orgId"),
                id: this.userId,
                departId: this.departName,
                displayName: this.userName,//用户名
                userName: this.pexipName,//
                pexipPassword: this.loginPassword,
                userEmail: this.acountEmail,
                userTel: this.phoneNum,
                pexipName: this.account,//用户账号
                description: this.remark
            }
            this.remote.editUserById(this.userId, data)
                .then((res) => {
                    this.visible = false;
                    // this.visible1 = true;
                    if (res.data.code == 15) {
                        this.feedbackContent = this.translate.instant('ADMIN_ERROR_TIP17');
                    }
                    else if (res.data.code == 999) {
                        this.feedbackContent = this.translate.instant('ADMIN_ERROR_TIP3');
                    }
                    else if (res.data.code == 0) {
                        // this.feedbackContent = this.translate.instant('ADMIN_SUCCESS5');
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS5'));
                        this.selPage = 1;
                        this.init();

                    }
                    else {
                        this.feedbackContent = this.translate.instant('ADMIN_ERROR_TIP18');
                    }
                })
        }

    }

    //点击取消修改用户信息
    close() {
        this.visible = false;
        this.visible1 = false;
        //清空信息
        this.department="";
        this.aliasName="";
        this.account="";
        this.loginPassword="";
        this.departName="";
        this.userName="";
        this.acountEmail="";
        this.phoneNum="";
        this.remark="";
    }

    //点击二维码显示二维码弹框
    showCode(src) {
        if (src) {
            this.imgName = src;
            this.codeSrc = this.imgBase+src;
        } else {
            this.codeSrc = '';
        }
    }
    // 点击下载二维码
    downloadBtn () {
       if (this.codeSrc) {
           this.downloadImg(this.codeSrc);
       } else {
           console.log('图片为空');
       }
    }

    // 点击打印二维码
    printCode() {
        let bdhtml = window.document.body.innerHTML;
        let sprnstr = "<!--startprint-->";
        let eprnstr = "<!--endprint-->";
        let prnhtml = bdhtml.substr(bdhtml.indexOf(sprnstr) + 17);
        prnhtml = prnhtml.substring(0, prnhtml.indexOf(eprnstr));
        // window.document.body.innerHTML=prnhtml;
        // window.print();
        var newWindow=window.open("","_blank");
        newWindow.document.body.innerHTML=prnhtml;
        newWindow.document.close();
        setTimeout(function(){
            newWindow.print();
            newWindow.close();
        }, 100);
    }

    downloadImg(url) {
        if (this.myBrowser()==="IE"|| this.myBrowser()==="Edge"){
            this.SaveAs5(url);
        }else{
            this.download(url);
        }

    }

    SaveAs5(imgURL) {
        var oPop = window.open(imgURL,"","width=1, height=1, top=5000, left=5000");
        for(; oPop.document.readyState != "complete"; )
        {
            if (oPop.document.readyState == "complete")break;
        }
        oPop.document.execCommand("SaveAs");
        oPop.close();
    }

    download(src) {
        var $a = document.getElementById('download-code');
        $a.setAttribute("href", src);
        $a.setAttribute("download", "");
    };

//判断浏览器类型
    myBrowser(){
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        if (isOpera) {
            return "Opera"
        }; //判断是否Opera浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        } //判断是否Firefox浏览器
        if (userAgent.indexOf("Chrome") > -1){
            return "Chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } //判断是否Safari浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return "IE";
        }; //判断是否IE浏览器
        if (userAgent.indexOf("Trident") > -1) {
            return "Edge";
        } //判断是否Edge浏览器
    }
}
