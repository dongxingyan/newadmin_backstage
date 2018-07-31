import {Page, IPageParams, page} from '../../../../common/page';
import {global} from '../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomInformationPageParams extends IPageParams {
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
    name: 'main.custom-information'
})

class MainCustom_InformationPage extends Page<ICustomInformationPageParams> {
    isActive = 1;
    init() {
        this.initPageStyle();
    }
    initPageStyle () {
        let hash = location.hash,
            hashArr = hash.split('/'),
            pageName = hashArr[hashArr.length - 1];

        switch (pageName) {
            case 'content':
                this.isActive = 1;
                break;
            case 'video':
                this.isActive = 2;
                break;
        }
    }
    // 切换子页面
    changeModule (path, flag) {
        this.isActive = flag;
        this.uiState.go(path);
    }
    signout() {
        this.rootScope.signout()
    }
}
