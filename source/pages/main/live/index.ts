import { global }                  from 'common/global';
import { Page, IPageParams, page } from 'common/page';

// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));

// 引入样式
require('./style.styl');

// 路由参数的设置
interface ILivePageParams extends IPageParams {
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
    name: 'main.live'
})
class MainLivePage extends Page<ILivePageParams> {
    liveName: string;
    livePageSize = 10;        // 直播每页显示的条数
    liveCurrent = 1;         // 直播当前页码 默认为1
    liveTotalCount = 0;     // 直播记录总条数
    liveInfo

    timeout
    previewURLPrefix = global.PREVIEW_API_PATH;
    deleteLiveId;

    init(timeout: angular.ITimeoutService) {
        this.getLiveList();
    }
    // 获取直播列表
    getLiveList() {
        let requestData = {
            name: this.liveName,
            pageNum: this.liveCurrent,
            count: this.livePageSize
        };

        this.remote.getLiveList(requestData)
            .then((res) => {
                let
                    response   = res.data,
                    resultCode = response.code;

                if (resultCode == '0') {
                    let resultData = response.data;

                    this.liveInfo = resultData.resultList;
                    this.liveTotalCount = resultData.totalSize;
                }
            });

    }
    // 设置要修改的直播的ID
    setUpdateLiveID(updLiveID) {
        sessionStorage.setItem('updLiveID', updLiveID);
    }
    // 回车事件 根据直播名称搜索直播列表
    enterEvent($event) {
        if ($event.which === 13) {
            this.getLiveList();
        }
    }
    //选中要删除的直播活动
    deleteLiveItem(id) {
        this.deleteLiveId = id;
    }
    //确定删除直播活动
    sureDelete() {
        this.remote.deleteLiveByID(this.deleteLiveId)
            .then((res) => {
                let resCode = res.data.code;
                if (resCode == '0') {
                    $('#deleteLiveModal').modal('hide');
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS1'));
                    this.getLiveList();
                } else {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP19'));
                }
            });
    }
    // 格式化时间，时间戳转换成标准格式的时间
    formatDate (timeStamp) {
        if (timeStamp) {
            let
                time   = new Date(timeStamp),
                year   = String(time.getFullYear()),
                month  = String(time.getMonth() + 1),
                day    = String(time.getDate()),
                hour   = String(time.getHours()),
                minute = String(time.getMinutes()),
                second = String(time.getSeconds());

            if (month.length < 2) month   = `0${month}`;
            if (day.length < 2) day       = `0${day}`;
            if (hour.length < 2) hour     = `0${hour}`;
            if (minute.length < 2) minute = `0${minute}`;
            if (second.length < 2) second = `0${second}`;

            return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
        }
    }
}
