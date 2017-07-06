import {Page, IPageParams, page} from "../../../common/page";
import {global} from "../../../common/global";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ILiveRecordingPageParams extends IPageParams {
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
    title: '机构管理系统',
    name: 'main.live-recording'
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
class MainLive_RecordingPage extends Page<ILiveRecordingPageParams> {
    name = 'hello order manager';
    page: number;
    // 直播相关参数
    liveName: string;
    liveClass = true;
    livePageSize = 10;        // 直播每页显示的条数
    liveCurrent = 1;         // 直播当前页码 默认为1
    livePager: any[] = [];
    liveTotalCount = 0;     // 直播记录总条数
    liveTotalPage = 0;      // 直播的总页数
    liveSkipCount;          // 跳转至多少页
    searchLiveName = '';    // 要搜索的直播名称
    liveInfo

    // 录制相关参数
    recordPageSize = 10;
    recordClass = false;
    recordCurrent = 1;
    recordPager: any[] = [];
    recordTotalCount = 0;
    recordTotalPage = 0;
    recordSkipCount;
    recordInfo

    order: any[] = [];
    info = [];

    next
    timeout

    recordVisible = false;
    recordVideoPlayVisible = false;
    recordFeedbackContent = '确定删除吗？';
    deleteFileName
    videoUrl
    previewURLPrefix = global.PREVIEW_API_PATH;

    init(timeout: angular.ITimeoutService) {
        this.timeout = timeout;
        this.getLiveList();
        this.getRecordList();
        // 清除掉创建直播时存在sessionStorage中的图片
        sessionStorage.removeItem('updImgURL');
    }
    /* 全局方法 */

    //退出登录
    signout() {
        this.session.clear();
        this.uiState.go('login');

    }

    // 切换选项卡js控制
    tabToSwitch(navName) {
        var that = this;
        if (navName.trim() === 'live') {
            that.liveClass = true;
            that.recordClass = false;
        } else {
            that.liveClass = false;
            that.recordClass = true;
        }
    }

    /* 直播相关方法 */
    // 获取直播列表
    getLiveList () {
        let that = this;
        // 获取直播列表
        this.remote.getLiveList(that.liveName, that.livePageSize, that.liveCurrent)
         .then((res) => {
             let response = res.data;
             let resultCode = response.code;
             if (resultCode === "0") {
                 let totalSize = response.data.totalSize;
                 let resultList = response.data.resultList;
                 for (let i = 0; i < resultList.length; i++) {
                     let resultListItem = resultList[i];
                     if (resultListItem.startTime) {
                         resultListItem.startTime = that.formatDate(resultListItem.startTime);
                     } else {
                         resultListItem.startTime = '——';
                     }
                     if (resultListItem.endTime) {
                         resultListItem.endTime = that.formatDate(resultListItem.endTime);
                     } else {
                         resultListItem.endTime = '——';
                     }
                 }
                 that.liveInfo = resultList;  // 获取直播数据列表

                 that.liveTotalPage = Math.ceil(totalSize / that.livePageSize);  // 计算总页数
                 that.liveTotalCount = totalSize;    // 设置直播总条数
                 that.livePager = that.livePaging(this.liveTotalPage);
             }
         });

    }
    // 设置要修改的直播的ID
    setUpdateLiveID (updLiveID) {
        sessionStorage.setItem('updLiveID', updLiveID);
    }
    // 按照名称搜索直播列表
    searchLiveListByName (event) {
        let that = this;
        let searchName = that.searchLiveName;
        let currentName = $(event.target).prev().val();

        that.liveName = currentName;

        if (searchName == currentName) {
            that.getLiveList();
        } else {
            that.liveCurrent = 1;
            that.searchLiveName = currentName;
            that.getLiveList();
        }
    }
    // 直播下一页
    async nextLivePage() {
        let that = this;
        let maxPage = await that.liveTotalPage;
        let page= parseInt(that.liveCurrent);
        console.log(page)
        if (page < maxPage) {
            that.liveCurrent += 1;
        }
        that.getLiveList();
    }
    // 直播上一页
    async prevLivePage() {
        let that = this;
        let maxPage = that.liveTotalPage
        let page = parseInt(that.liveCurrent);
        if (page > 1) {
            that.liveCurrent -= 1;
        } else {
            that.liveCurrent = 1;
        }
        that.getLiveList();
    }
    // 直播 分页设置显示
    livePaging(total) {
        let that = this;
        // 小于十页全显示
        // if (total <= 10) {
        let arr = [];
        for (var i = 0; i < total; i++) {
            arr[i] = i + 1;
        }
        return arr.map(x => ({
            type: 0,
            value: x,
            isCurrent: x === that.liveCurrent
        }))
        // }
        // 大于十页部分显示
        /**
         * 有些问题 放着下次研究 目前是全显示
         else {
            // 当前页号小于等于5
            if (that.liveCurrent <= 4) {
                return [1, 2, 3, 4, 5].map<{type,value?,isCurrent?}>(x => ({
                    type: 0,
                    value: x,
                    isCurrent: x === that.liveCurrent
                }))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
            // 当前页号是最后5页之一
            else if (that.liveCurrent > total - 4) {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([total - 4, total - 3, total - 2, total - 1, total].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === that.liveCurrent
                    })))
            }
            // 其它情况
            else {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([that.liveCurrent - 2, that.liveCurrent - 1, that.liveCurrent, that.liveCurrent + 1, that.liveCurrent + 2].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === that.liveCurrent
                    })))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
        }
         */
    }

    /* 录播相关方法 */
    // 获取录制列表
    getRecordList () {
        let that = this;
        // 获取录制列表的总记录数
        that.remote.getTotalOfRecord()
            .then((res) => {
                let resultList = res.data;
                let resCode = resultList.code;
                if (resCode === "0") {
                    this.recordTotalCount = res.data.data;
                    let recordTotal = Math.ceil(this.recordTotalCount/this.recordPageSize);
                    this.recordTotalPage = recordTotal;
                    this.recordPager = this.recordPaging(recordTotal);
                }
            });
            // 获取录制列表
            this.remote.getRecordList(that.recordPageSize, that.recordCurrent)
                .then((res) => {
                    let resCode = res.data.code;
                    let resMsg = res.data.msg;
                    if (resCode === "0") {
                        this.recordInfo = res.data.data;
                    } else {
                        // alert(resMsg);
                    }
                });
    }
    // 把UTC时间转换为本地时间
    formatLocaleTime (UTCTime) {
        if (!UTCTime) {
            return '——';
        }
        // 获取当前时区差值
        var timeOffset = new Date().getTimezoneOffset() * 60000;
        // 得到接口返回的时间戳
        var timeStamp = new Date(UTCTime.substring(0, 19).replace(/-/g, "/")).getTime();
        // 二者做差 得到本地时间
        var localTime = timeStamp - timeOffset;
        // 把计算完的时间戳转换成标准时间
        var formatTimeString = new Date(localTime);

        // 先把时间字符串转换称日期格式
        var year = formatTimeString.getFullYear() + '';
        var month = (formatTimeString.getMonth() + 1) + '';
        var date = formatTimeString.getDate() + '';
        var hours = formatTimeString.getHours() + '';
        var minutes = formatTimeString.getMinutes() + '';
        var seconds = formatTimeString.getSeconds() + '';

        // 格式化每个日期节点的个数
        if (month.length === 1) month = '0' + month;
        if (date.length === 1) date = '0' + date;
        if (hours.length === 1) hours = '0' + hours;
        if (minutes.length === 1) minutes = '0' + minutes;
        if (seconds.length === 1) seconds = '0' + seconds;

        // 拼接称最终返回的时间
        return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    }
    // 录制下一页
    async nextRecordPage() {
        let that = this;
        let maxPage = await that.recordTotalPage;
        let page = parseInt(that.recordCurrent);
        console.log(page)
        if (page < maxPage) {
            that.recordCurrent += 1;
        }
        that.getRecordList();
    }
    // 录制上一页
    async prevRecordPage() {
        let that = this;
        let maxPage = that.recordTotalPage;
        let page = parseInt(that.recordCurrent);
        if (page > 1) {
            that.recordCurrent -= 1;
        } else {
            that.recordCurrent = 1;
        }
        that.getRecordList();
    }
    // 录制 分页设置显示
    recordPaging(total) {
        let that = this;
        // 小于十页全显示
        // if (total <= 10) {
        let arr = [];
        for (var i = 0; i < total; i++) {
            arr[i] = i + 1;
        }
        return arr.map(x => ({
            type: 0,
            value: x,
            isCurrent: x === that.recordCurrent
        }))
        // }
        // 大于十页部分显示
        /**
         * 有些问题 放着下次研究 目前是全显示
         else {
            // 当前页号小于等于5
            if (that.liveCurrent <= 4) {
                return [1, 2, 3, 4, 5].map<{type,value?,isCurrent?}>(x => ({
                    type: 0,
                    value: x,
                    isCurrent: x === that.liveCurrent
                }))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
            // 当前页号是最后5页之一
            else if (that.liveCurrent > total - 4) {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([total - 4, total - 3, total - 2, total - 1, total].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === that.liveCurrent
                    })))
            }
            // 其它情况
            else {
                return [
                    {type: 0, value: 1, isCurrent: false},
                    {type: 1}
                ]
                    .concat([that.liveCurrent - 2, that.liveCurrent - 1, that.liveCurrent, that.liveCurrent + 1, that.liveCurrent + 2].map(x => ({
                        type: 0,
                        value: x,
                        isCurrent: x === that.liveCurrent
                    })))
                    .concat([
                        {type: 1},
                        {type: 0, value: total, isCurrent: false}
                    ])
            }
        }
         */
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
        console.warn('停止播放视频')
        $('video').get(0).pause();
    }
    // 删除某条录制记录
    saveDeleteRecord() {
        let that = this;
        that.remote.deleteRecordByID(that.deleteFileName)
            .then((res) => {
                let resCode = res.data.code;
                let resMsg = res.data.msg;
                if (resCode === "0") {
                    that.recordVisible = false;
                    that.getRecordList();
                } else {
                    // alert(resMsg);
                }
            });
    }
    // 格式化时间，时间戳转换成标准格式的时间
    formatDate (timeStamp) {
        let time = new Date(timeStamp);

        let year = time.getFullYear();
        let month = time.getMonth() + 1;
        let day = time.getDate();
        let hour = time.getHours();
        let minute = time.getMinutes();
        let second = time.getSeconds();

        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (minute < 10) {
            minute = '0' + minute;
        }
        if (second < 10) {
            second = '0' + second;
        }
        
        return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }
}