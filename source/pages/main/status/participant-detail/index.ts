import { Page, IPageParams, page } from 'common/page';
import formatDate from 'utils/format-date';

// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');

// 路由参数的设置
interface IParticipantDetailPageParams extends IPageParams {
    page: string,
    data
}

@page({
    // 模板
    template: require('./tmpl.html'),
    params: ['data'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    name: 'main.participant-detail'
})

class MainParticipant_DetailPage extends Page<IParticipantDetailPageParams> {
    id;
    meetingRoomNum;
    participantName;        // 参会者名称
    connectTime;             // 连接时间
    participantDuration;  // 持续时间
    systemLocation;         // 系统位置
    role;                    // 角色
    isPresenting;           // 是否在演示
    isMuted;                 // 是否静音
    protocol;               // 协议
    bandwidth;              // 带宽
    vendor;                 // 终端来源
    remoteAddress;         // 远程IP
    remotePort;            // 远程端口
    callQuality;           // 通话质量
    mediaList;              // 媒体流信息列表

    init(timeout: angular.ITimeoutService) {
        this.getRouteParams();  // 获取路由跳转 传过来的参数
        this.getMediaDetail();  // 获取媒体流详情列表
    }

    getRouteParams () {
        let
            params = JSON.parse(this.params.data),
            {
                id,
                meetingRoomNum,
                participantName,
                connectTime,
                participantDuration,
                systemLocation,
                role,
                presenting,
                muted,
                protocol,
                bandwidth,
                vendor,
                remoteAddress,
                remotePort,
                callQuality
            } = params;

        callQuality = this.transferCallQuality(callQuality);

        this.id = id;
        this.meetingRoomNum = meetingRoomNum;
        this.participantName = participantName;
        this.connectTime = formatDate.timestampToDate(connectTime);
        this.participantDuration = participantDuration;
        this.systemLocation = systemLocation;
        this.role = role;
        this.isPresenting = presenting;
        this.isMuted = muted;
        this.protocol = protocol;
        this.bandwidth = bandwidth;
        this.vendor = vendor;
        this.remoteAddress = remoteAddress;
        this.remotePort = remotePort;
        this.callQuality = callQuality;
    }

    getMediaDetail () {
        this.remote.getMediaInfo({ meetingRoomNum: this.meetingRoomNum, id: this.id })
            .then((res) => {
                if (res.data.code === '0')
                    this.mediaList = res.data.data;
            })
    }

    formatConnectTime (timestamp) {
        return formatDate.timestampToDate(timestamp)
    }

    transferCallQuality (callQuality) {
        let result = '';

        switch (callQuality) {
            case '0_unknown':
                result = this.translate.instant('ADMIN_STATUS_PARTICIPANT_QUALITY_UNKNOWN')
                break
            case '1_good':
                result = this.translate.instant('ADMIN_STATUS_PARTICIPANT_QUALITY_GOOD')
                break
            case '2_ok':
                result = this.translate.instant('ADMIN_STATUS_PARTICIPANT_QUALITY_OK')
                break
            case '3_bad':
                result = this.translate.instant('ADMIN_STATUS_PARTICIPANT_QUALITY_BAD')
                break
            case '4_Terrible':
                result = this.translate.instant('ADMIN_STATUS_PARTICIPANT_QUALITY_TERRIBLE')
                break
            default:
                result = this.translate.instant('ADMIN_STATUS_PARTICIPANT_QUALITY_UNKNOWN')
        }

        return result
    }
}