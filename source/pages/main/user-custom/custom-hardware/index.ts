import { Page, IPageParams, page } from '../../../../common/page';
import {global} from '../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomHardwarePageParams extends IPageParams {
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
  name: 'main.custom-hardware'
})

class MainCustom_HardwarePage extends Page<ICustomHardwarePageParams> {
  isActive = 1;
  init(timeout: angular.ITimeoutService) {
    this.rootScope.titleConetent.title="定制化";
    this.rootScope.titleConetent.titleEn="CUSTOMIZATION";
    this.initPageStyle();
  }
  initPageStyle () {
    let hash = location.hash,
        hashArr = hash.split('/'),
        pageName = hashArr[hashArr.length - 1];

    switch (pageName) {
      case 'apk':
        this.isActive = 1;
            break;
      case 'tofu':
        this.isActive = 2;
        break;
      case 'screen':
        this.isActive = 3;
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
