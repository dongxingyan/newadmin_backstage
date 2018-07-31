import { Page, IPageParams, page } from '../../../common/page';
import * as laydate from 'layui-laydate/dist/laydate';
import 'layui-laydate/dist/theme/default/laydate.css';
import { global } from '../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IBox_ManagePageParams extends IPageParams {
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
  name: 'main.box-manage'
})

class MainBox_ManagePage extends Page<IBox_ManagePageParams> {
  pageId = 1;
  pageSize = 10;
  totalSize = 0;
  maxSize = 7;
  keyword = '';
  boxList = [];

  init(timeout: angular.ITimeoutService) {
    timeout(()=>{
      this.initTimepicker();
    },50)
    this.getBoxInfoList();
  }

  // 获取盒子信息列表
  getBoxInfoList () {
    let
        date = $('#J-buy-date').val(),
        requestData = {
          start: this.pageId,
          size: this.pageSize,
          keyword: this.keyword,
          time: date ? `${ date } 00:00:00` : '',
          token: sessionStorage.getItem('token')
        };

    this.remote.getBoxInfoList(requestData)
        .then((res)=> {
          if (res.status === 200) {
            if (res.data.code === '0') {
              let resData = res.data.data;
              this.totalSize = resData.totalSize;
              this.boxList = resData.resultList;
            } else {
              this.rootScope.toggleInfoModal(4, res.data.message);
            }
          }
        })
        .catch(error => {
          this.rootScope.toggleInfoModal(4, error.toString())
        })
  }
  // 初始化时间控件
  initTimepicker () {
    let start = {
      elem: '#J-buy-date',
      lang: localStorage.getItem('lang').indexOf('en-us') > -1 ? 'en': '',
      format: 'yyyy-MM-dd',
      isclear: false,
      istoday: false,
      fixed: false
    };
    laydate.render(start);
  }
}
