import {Page, IPageParams, page} from 'common/page';
import  {global} from 'common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IDetailBroadcastPageParams extends IPageParams {
    page: string;
}

@page({
    // 模板
    template: require('./tmpl.html'),
    // 路由参数，写在这里，可以从this.params中获取。
    params: ['id'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    // 这一页的标题
    name: 'main.detail-broadcast'
})

class MainDetail_BroadcastPage extends Page<IDetailBroadcastPageParams> {
    data;
    imageUrl = global.IMG_API_PATH;
    init(timeout: angular.ITimeoutService) {
        // 根据直播记录ID查询直播的详情
        this.remote.getLiveDetailByLiveID(this.params.id)
            .then((res) => {
                this.data = res.data.data;
            });
    }
}
