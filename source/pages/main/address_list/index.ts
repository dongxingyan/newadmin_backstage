import {Page, IPageParams, page} from "../../../common/page";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IAddressListPageParams extends IPageParams {
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
    name: 'main.address-list'
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
class MainAddress_ListPage extends Page<IAddressListPageParams> {
    name = 'hello order manager';
    visible//控制弹框的显示
    visible1
    visible2//控制添加人员弹框的显示
    visible3//控制编辑人员弹框的显示
    visible4//控制表格中删除单条数据的弹框显示
    feedbackContent
    feedbackContent4//删除表格中单条数据的显示内容
    ifAdd//是否添加组的判断
    ifModify//是否修改组名称的判断
    personName//添加的姓名
    personEmail//添加人员的邮箱
    personPhone//添加人员手机
    remark//备注信息
    teamManage//分组管理
    parentId
    groupName//添加的组的名字
    groupName1//修改的组的名字
    ungrouped//未分组联系人
    allContactsCount//所有联系人数
    allContacts//所有联系人
    teams//所有的联系组
    groupMember//联系组对应的数量
    deleteId//对应的删除的组的id
    deleteSingleId//对应的删除的表格中单条数据的id
    singleId
    order: any[] = []
    items//
    pager: any[] = []
    total//总页数
    totalCount//总条数
    pageSize: number = 10;//每页显示条数
    count: number//跳转到某页
    selPage: number = 1

    init() {
        if (!this.teamManage) {
            this.teamManage = 0;
        }

        //获取所有联系人
        this.remote.getAllPersons()
            .then((res) => {
                if (res.data.code == 31) {
                    this.allContactsCount = 0
                }
                else {
                    this.allContacts = res.data.data;
                    this.allContactsCount = res.data.data.length;
                    this.totalCount = parseInt(res.data.data.length);
                    this.total = Math.ceil(this.totalCount / this.pageSize);
                    this.pager = this.paging(this.total, this.selPage);
                    this.items = this.allContacts.slice(0, this.pageSize)
                    this.count = 1;
                }
            })

        //获取未分组联系人
        this.remote.getPerson(0)
            .then((res) => {
                if (res.data.code == 31) {
                    this.ungrouped = 0;
                }
                else {
                    this.ungrouped = res.data.data.length;
                }
            })

        //获取联系组
        this.remote.getTeam()
            .then((res) => {
                this.teams = res.data.data;
            })
    }

    //点击退出登录
    signout() {
        this.rootScope.signout()
    }

    //点击编辑单条人员信息
    modifySingle(name, email, phone, team, id) {
        this.visible3 = true;
        this.personName = name;
        this.personEmail = email;
        this.personPhone = phone;
        if (team == 0) {
            this.teamManage = "0";
        }
        else {
            this.teamManage = team;
        }
        this.selPage = 1;
        this.singleId = id;
    }

    //点击删除单条人员信息
    deleteSingle(id) {
        this.visible4 = true;
        this.deleteSingleId = id;
        this.feedbackContent4 = this.translate.instant('ADMIN_SURE_DELETE')

    }

    //点击确定删除表格中的单条数据
    sureDeleteSingle() {
        this.visible4 = false;
        this.remote.deletePerson(this.deleteSingleId)
            .then((res)=> {
                if (res.data.code == 0) {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS1'));
                    this.selPage = 1;
                    this.init();
                }
                else {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP19'));
                    this.init();
                }
            })
    }

    //取消单条删除
    cancelSingle() {
        this.visible4 = false;
    }


    sureModify() {
        if (!this.personName || !this.personPhone || !this.personEmail || !this.teamManage) {
            this.visible3 = false;
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP17'));
        }
        else {
            let data2 = {
                id: this.singleId,
                orgId: sessionStorage.getItem('orgId'),
                teamId: this.teamManage,
                cName: this.personName,
                phoneNum: this.personPhone,
                email: this.personEmail,
                remark: this.remark,
            }
            this.visible3 = false;
            this.remote.modifyPerson(data2)
                .then((res)=> {
                    if (res.data.code == 0) {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS5'));
                        this.init();
                    }
                    else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP18'));
                        this.init();
                    }
                })
        }
    }

    //点击添加人员按钮添加人员
    addPerson() {
        this.personName = '';
        this.personEmail = '';
        this.personPhone = "";
        this.teamManage = "";
        this.remark = "";
        this.visible2 = true;

    }

    //点击所有联系人左边表格展示对应的所有联系人
    showAll() {
        if (this.allContactsCount == 0) {
            this.rootScope.toggleInfoModal(2, this.translate.instant('ADMIN_WARN_TIP18'));
        }
        else {
            this.uiState.go('main.address-list', {page: 1});
            this.selPage = 1;
            this.remote.getAllPersons()
                .then((response) => {
                    this.allContacts = response.data.data
                    this.totalCount = parseInt(response.data.data.length);
                    this.total = Math.ceil(this.totalCount / this.pageSize);
                    this.pager = this.paging(this.total, this.selPage);
                    this.items = this.allContacts.slice(0, this.pageSize)
                })
        }

    }

    //点击确定添加人员信息
    sureAdd() {
        let data1 = {
            orgId: sessionStorage.getItem('orgId'),
            teamId: this.teamManage || 0,
            cName: this.personName,
            phoneNum: this.personPhone,
            email: this.personEmail,
            remark: this.remark,
        }
        //首先判断必填项是否为空
        if (!this.personName || !this.personEmail || !this.personPhone) {
            this.visible2 = false;
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP17'));
        }
        else {
            this.visible2 = false;
            this.remote.addPerson(data1)
                .then((res)=> {
                    if (res.data.code == 0) {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS6'));
                        this.selPage = 1;
                        this.init();
                    }
                    else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP20'));
                        this.init();
                    }
                })
        }
    }

    //点击未分组联系人左边的表格展示对应的未分组联系人
    showUngrouped() {
        this.remote.getPerson(0)
        this.selPage = 1
        if (this.ungrouped == 0) {
            this.rootScope.toggleInfoModal(2, this.translate.instant('ADMIN_WARN_TIP18'));
        }
        else {
            this.uiState.go('main.address-list', {page: 1});
            this.remote.getPerson(0)
                .then((response) => {
                    this.allContacts = response.data.data;
                    this.totalCount = parseInt(response.data.data.length);
                    this.total = Math.ceil(this.totalCount / this.pageSize);
                    this.pager = this.paging(this.total, this.selPage);
                    this.items = this.allContacts.slice(0, this.pageSize)
                })
        }


    }

    //点击联系组中的某个组左边表格显示对应的组成员
    showGroup(id, count) {
        this.selPage = 1;
        if (count == 0) {
            this.rootScope.toggleInfoModal(2, this.translate.instant('ADMIN_WARN_TIP18'));
        }
        else {
            this.uiState.go('main.address-list', {page: 1});
            this.remote.getPerson(id)
                .then((res) => {
                    this.allContacts = res.data.data;
                    this.totalCount = parseInt(res.data.data.length);
                    this.total = Math.ceil(this.totalCount / this.pageSize);
                    this.pager = this.paging(this.total, this.selPage);
                    this.items = this.allContacts.slice(0, this.pageSize)
                })
        }
    }

    //点击添加按钮添加联系组
    addGroup() {
        this.ifAdd = !this.ifAdd;
        this.groupName = "";
    }

    //点击确定按钮保存添加的分组
    sure() {
        let data = {
            orgId: sessionStorage.getItem('orgId'),
            tName: this.groupName,
        }
        if (!this.groupName) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP19'));
        }
        else {
            this.remote.addTeam(data)
                .then((res)=> {
                    if (res.data.code == 0) {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS6'));
                        this.remote.getTeam()
                            .then((res) => {
                                this.teams = res.data.data;
                            })
                    }
                    else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP20'));
                    }
                })
        }
        this.ifAdd = false;
    }

    //点击修改分组名称
    modify(id) {
        this.ifModify = true;
        this.parentId = id;
    }

    //点击删除该组
    delete(id) {
        this.visible1 = "true"
        this.feedbackContent = this.translate.instant('ADMIN_SURE_DELETE')
        this.deleteId = id;
    }

    sureDelete() {
        this.visible1 = false;
        this.remote.deleteTeam(this.deleteId)
            .then((res)=> {
                if (res.data.code == 0) {
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS1'));
                    this.remote.getTeam()
                        .then((res) => {
                            this.teams = res.data.data;
                        })
                }
                else {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP19'));
                }
            })
    }

    //点击确定保存修改的组名称
    sureEdit(id) {
        if (!this.groupName1) {
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP20'));
        }
        else {
            let data = {
                id: id,
                tName: this.groupName1,
            }
            this.remote.editTeam(data)
                .then((res)=> {
                    if (res.data.code == 0) {
                        this.groupName1 = ""
                        this.ifModify = false;
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS4'));
                        this.remote.getTeam()
                            .then((res) => {
                                this.teams = res.data.data;
                            })
                    }
                    else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP20'));
                    }
                })
        }
    }

    //点击取消修改的组名称
    cancelEdit() {
        this.ifModify = false;
    }

    cancel() {
        this.visible1 = false;
        this.visible2 = false;
        this.visible3 = false;
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
        this.items = data.slice((this.pageSize) * (this.selPage - 1), this.selPage * (this.pageSize))
    }

    selectPage(page, type) {
        if (page < 1 || page > this.total) return;
        if (type == 1) return;
        this.selPage = page
        this.count = page;
        this.setData(this.allContacts);
        this.pager = this.paging(this.total, this.selPage)
    }

    //页码的显示
    // 上一页
    async  prevPage(page) {
        this.selectPage(page - 1, null);
    }

    //下一页
    async nextPage(page) {
        this.selectPage(page + 1, null)
    }

    //页面跳转
    jump(page) {
        if (page) {
            var page1 = parseInt(page)
            this.selectPage(page1, null)
        }
    }
}
