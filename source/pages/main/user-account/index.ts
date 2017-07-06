import {Page, IPageParams, page} from "../../../common/page";
import {async} from "rxjs/scheduler/async";
import {timeout} from "rxjs/operator/timeout";
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
    title: '机构管理系统',
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
    //
    users;
    userId;
    departId;
    items//
    pager: any[] = []
    total//总页数
    totalCount: number//总条数
    pageSize: number = 15;//每页显示条数
    count: number//跳转到某页
    selPage: number = 1

    init() {
        this.remote.getUserAccount()
            .then((res) => {
                if (res.data.code == "0") {
                    this.totalCount = parseInt(res.data.data.count);
                    console.log(this.totalCount)
                }
                else if (res.data.code == "2") {
                    this.uiState.go("login")
                }
            });
        // timeout(() => {
            this.remote.userAccount()
                .then((res) => {
                    if (res.data.code == "0") {
                        this.pageSize = 15;
                        this.total = Math.ceil(this.totalCount / this.pageSize)
                        this.users = res.data.data;
                        this.pager = this.paging(this.total, this.selPage)
                        this.items = this.users.slice(0, this.pageSize)
                    }
                    else if (res.data.code == "2") {
                        this.uiState.go("login")
                    }
                })
        // }, 300)


    }

    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

    //点击修改用户信息
    userModify(id, departId, alias) {
        this.visible = true;
        //获取该机构中所有的部门
        this.aliasName = "" || alias;
        this.remote.getDepts()
            .then((res) => {
                this.departments = res.data.data;
                console.log(this.departments)
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
                    this.account = res.data.data.userName || "";
                    this.loginPassword = res.data.data.password || "";
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
        //    邮箱格式是否正确
        //    手机格式是否正确
        //    密码为6-12位字母或数字
        //    账号为6-12位字母或数字

        //如果有所在的部门
        console.log(this.departments)

            console.log("haohao")
            if ((!this.acountEmail.match(/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/)) && (this.acountEmail != '')) {
                this.visible = false;
                this.visible1 = true;
                this.feedbackContent = "邮箱格式不对"
            }
            else if ((!this.phoneNum.match(/^(1+\d{10})$/)) && this.phoneNum != "") {
                this.visible = false;
                this.visible1 = true;
                this.feedbackContent = "手机格式不对"
            }
            else if ((!this.loginPassword.match(/^[a-zA-Z0-9]{6,12}$/)) && this.loginPassword != "") {
                this.visible = false;
                this.visible1 = true;
                this.feedbackContent = "密码为6-12位字母或数字"
            }
            else if ((!this.account.match(/^[a-zA-Z0-9]{6,12}$/)) && this.account != "") {
                this.visible = false;
                this.visible1 = true;
                this.feedbackContent = "账号为6-12位字母或数字"
            }
            else {
                console.log("执行了")
                let data = {
                    organId: sessionStorage.getItem("orgId"),
                    id: this.userId,
                    departId: this.departName,
                    displayName: this.userName,
                    userName: this.account,
                    password: this.loginPassword,
                    userEmail: this.acountEmail,
                    userTel: this.phoneNum,
                    pexipName: this.pexipName,
                    description: this.remark
                }
                this.remote.editUserById(this.userId,data)
                    .then((res) => {
                    console.log("执行了请求")
                        this.visible = false;
                        this.visible1 = true;
                        if (res.data.code == 15) {
                            this.feedbackContent = "用户名已存在";
                        }
                        else if (res.data.code == 999) {
                            this.feedbackContent = "服务器内部错误";
                        }
                        else if (res.data.code == 0) {
                            this.feedbackContent = "编辑成功";
                            this.init();
                            console.log("编辑成功")
                        }
                        else {
                            this.feedbackContent = "编辑失败";
                        }
                    })
            }



    }

    //点击取消修改用户信息
    close() {
        this.visible = false;
        this.visible1 = false;
    }

    paging(total, current) {
        // 小于十页全显示
        if (total <= 10) {
            let arr = [];
            for (var i = 0; i < total; i++) {
                arr[i] = i + 1;
            }
            return arr.map(x => ({
                type: 0,
                value: x,
                isCurrent: x === current
            }))
        }
        // 大于十页部分显示
        else {
            // 当前页号小于等于5
            if (current <= 4) {
                return [1, 2, 3, 4, 5].map<{ type, value?, isCurrent? }>(x => ({
                    type: 0,
                    value: x,
                    isCurrent: x === current
                }))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
            // 当前页号是最后5页之一
            else if (current > total - 4) {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([total - 4, total - 3, total - 2, total - 1, total].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === current
                    })))
            }
            // 其它情况
            else {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([current - 2, current - 1, current, current + 1, current + 2].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === current
                    })))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
        }
    }

    setData(data) {
        console.log(this.selPage + "xuanze d")
        this.items = data.slice((this.pageSize) * (this.selPage - 1), this.selPage * (this.pageSize))
        console.log(this.items)
    }

    selectPage(page) {
        if (page < 1 || page > this.total) return;
        console.log("shifou ")
        // if(page>2){
        //     this.setData(this.rooms);
        // }
        this.selPage = page
        this.setData(this.users);
        console.log(this.selPage)
        console.log(typeof this.selPage)
        this.pager = this.paging(this.total, this.selPage)
        console.log(this.pager);
    }

    //页码的显示
    // 上一页
    async  prevPage(page) {
        this.selectPage(page - 1);
        console.log(page)
    }

    //下一页
    async nextPage(page) {
        this.selectPage(page + 1)
    }

    //页面跳转
    jump(page) {
        console.log(page)
        if (page) {
            var page1 = parseInt(page)
            this.selectPage(page1)
        }

    }

    // jump(page) {
    //     if (page <= this.total && page >= 1) {
    //         this.uiState.go("main.user-account", {page: page});
    //     }
    // }
    //
    // async nextPage() {
    //     let maxPage = await this.total;
    //     let page = parseInt(this.params.page);
    //     if (page < maxPage) {
    //         this.uiState.go('main.user-account', {page: page + 1});
    //     } else if(page>1&&page>=maxPage) {
    //         this.uiState.go('main.user-account', {page: maxPage});
    //     }
    // }
    //
    // async  prevPage() {
    //     // let maxPage = this.total
    //     let page = parseInt(this.params.page);
    //     console.log(page)
    //     if (page > 1) {
    //         this.uiState.go('main.user-account', {page: page - 1})
    //     } else {
    //         this.uiState.go('main.user-account', {page: 1})
    //     }
    // }
}