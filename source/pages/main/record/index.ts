import { global } from 'common/global';
import { Page, IPageParams, page } from 'common/page';
import formatDate from 'utils/format-date';

// 引入样式
require('./style.styl');

// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));

// 路由参数的设置
interface IRecordPageParams extends IPageParams {
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
    name: 'main.record'
})

class MainRecordPage extends Page<IRecordPageParams> {
    recordPageSize = 10;
    recordCurrent = 1;
    recordTotalCount = 0;
    recordInfo
    timeout
    recordVisible = false;
    recordVideoPlayVisible = false;
    deleteFileName
    videoUrl
    previewURLPrefix = global.PREVIEW_API_PATH;

    init(timeout: angular.ITimeoutService) {
        this.getRecordList();
    }

    // 获取录制列表
    getRecordList () {
        // 获取录制列表的总记录数
        this.remote.getTotalOfRecord()
            .then((res) => {
                let resultList = res.data;
                let resCode = resultList.code;
                if (resCode === '0') {
                    this.recordTotalCount = Number(res.data.data);
                    let recordTotal = Math.ceil(this.recordTotalCount / this.recordPageSize);
                }
            });
        // 获取录制列表
        this.remote.getRecordList(this.recordPageSize, this.recordCurrent)
            .then((res) => {
                let resCode = res.data.code;
                let resMsg = res.data.msg;
                if (resCode === '0') {
                    this.recordInfo = res.data.data;
                } else {
                    // alert(resMsg);
                }
            });
    }
    // 触发删除模态框
    toggleDeleteModal(deleteName) {
        this.deleteFileName = deleteName;
        this.recordVisible = true;
    }
    // 触发视频播放模态框
    toggleVideoPlayModal(videoUrl) {
        this.videoUrl = videoUrl;
        this.recordVideoPlayVisible = true;
    }
    // 停止播放视频
    stopPlay() {
        $('video').get(0).pause();
    }
    // 删除某条录制记录
    saveDeleteRecord () {
        this.remote.deleteRecordByID(this.deleteFileName)
            .then((res) => {
                let resCode = res.data.code;
                let resMsg = res.data.msg;
                if (resCode == '0') {
                    $('#deleteRecordModal').modal('hide');
                    this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS1'));
                    this.getRecordList();
                } else {
                    // alert(resMsg);
                }
            });
    }
    // utc时间转换为当前时区所对应的时间
    formatLocaleTime (date) {
        return formatDate.formatLocaleTime(date);
    }
}
