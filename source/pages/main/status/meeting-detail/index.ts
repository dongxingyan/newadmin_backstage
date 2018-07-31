import {Page, IPageParams, page} from 'common/page';

// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');

// 路由参数的设置
interface IMeetingDetailPageParams extends IPageParams {
    page: string,
    data
}

@page({
    // 模板
    template: require('./tmpl.html'),
    params: ['data'],
    // 依赖注入，在init函数的参数表中可以获取。
    requires: ['$timeout'],
    name: 'main.meeting-detail'
})

class MainMeeting_DetailPage extends Page<IMeetingDetailPageParams> {
    // 会议总览
    meetingRoomNum;
    conferenceDuration;
    locked;
    guestsMuted;
    detailInfoList;

    init(timeout: angular.ITimeoutService) {
        this.getRouteParams();  // 获取路由跳转 传过来的参数
        this.getParticipantDetail();// 获取参会者详情列表
    }

    getRouteParams () {
        let
            params = JSON.parse(this.params.data),
            {
                meetingRoomNum,
                conferenceDuration,
                locked,
                guestsMuted
            } = params;

        this.meetingRoomNum = meetingRoomNum;
        this.conferenceDuration = conferenceDuration;
        this.locked = locked;
        this.guestsMuted = guestsMuted;
    }

    getParticipantDetail () {
        this.remote.getParticipantsInfo({ meetingRoomNum: this.meetingRoomNum })
            .then((res) => {
                if (res.data.code === '0')
                    this.detailInfoList = res.data.data;
            })
    }

    // 跳转至参会者详情页面
    jumpParticipantDetail (item) {
        let {
            id,
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
            callQuality } = item;

        this.uiState.go('main.participant-detail', { data: JSON.stringify({
            id,
            meetingRoomNum: this.meetingRoomNum,
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
        }) });
    }
}