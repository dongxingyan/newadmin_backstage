import * as angular from 'angular';
import {global} from "../global";
import IHttpService = angular.IHttpService;
import IHttpPromise = angular.IHttpPromise;

import {StatusService} from './api/status';

let dependences = [];
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => {
    let _m = require<any>(x);
    if (_m && _m.name)
        dependences.push(_m.name)
});
dependences = dependences.filter(x => x);
import {initConnection} from "./connection";
import {SessionService} from "../session";
import {count} from "rxjs/operator/count";

interface ILoginResponse {
    message: string,
    token: string,
    data: {
        org_id: string
    }
    code: string
}
interface IGetDisplayNameResponse {
    message: string,
    data: string,
    code: string
}
interface ISignOutResponse {
    code: number,
    msg: string,
}
//状态预览页面
interface IGetDepartmentResponse {
    message: string,
    data: {
        id: number,
        name: string,
        remark: string,
        isActive: number,
        schemeId: number,
        maxSimultaneous: number,
        autoChangePasswd: number,
        liveFlag: number,
        recordFlag: number,
        allowStreams: number,
        orgManagerName: string,
        orgManagerPassword: string,
        isCustomized: number;
    },
    code: string
}
interface ITotalCountResponse {
    message: string,
    data: {
        count: string
    },
    code: string
}
interface IGetDeviceAccountResponse {
    message: string,
    data: {
        count: string
    },
    code: string
}
interface IGetUserAccountResponse {
    message: string,
    data: {
        count: string
    },
    code: string
}
interface IGetAllDurationResponse {
    message: string,
    data: {
        meetingRoomNum: string,
        data: {
            length
        }
        length: string,
    },
    code: string
}
interface IGetActiveConfeResponse {
    code
    msg
    data: {
        meetingRoomNum
        conferenceDuration
        accountName
        isLocked
        guestsMuted
        participantCount
    }
}
interface IGetParticipantsInfoResponse {
    code
    msg
    data: {
        id
        participantName
        participantDuration
        connectTime
        systemLocation
        signallingNode
        mediaNode
        role
        isPresenting
        isMuted
        currentPacketLoss
        totalPacketLoss
        protocol
        bandwidth
        vendor
        remoteAddress
        remotePort
        callQuality
    }
}
interface IGetMediaInfoResponse {
    code
    msg
    data: {
        type
        startTime
        node
        txCodec
        txBitrate
        txResolution
        txPacketsSent
        txPacketsLost
        txJitter
        rxCodec
        rxBitrate
        rxResolution
        rxPacketsReceived
        rxPacketsLost
        rxJitter
    }
}

interface IGetAllConferenceTime {
    message: string,
    data: {
        meetingRoomNum,
        data,
        totalTime: string,
    }
    code: string
}
//会议室管理页面
interface IRoomManageResponse {
    message: string,
    data: {
        count: string
        length;

    },
    code: string
}
interface IMeetingRoomResponse {
    code: string //0
    message: string //成功
    data: {
        Id
        meetingRoomNum //会议室号
        oranId //机构id
        departId //部门id
        name //名称
        themeId //主题id
        themeName //主题名称
        themeUuid //主题uuid
        capacity //容量
        hostPassword //主持人密码
        guestPassword //参会者密码
        description //描述
        expirationDate //过期时间
        hostView //开会模式
        allowGuestFlag //允许参会者标记
        startTime //开始时间
        pexipDescription //pexip描述
        roomNumType //房间号类型
    }
}
interface IGetRoominfoByIdResponse {
    message,
    data: {
        id,
        meetingRoomNum,
        organId,
        accountId,
        name,
        themeId,
        themeName,
        themeUuid,
        capacity,
        hostPassword,
        guestPassword,
        description,
        expirationDate,
        allowGuestFlag,
        startTime
        autoChangePasswd
        isThemeCustomized
    },
    code
}
interface IGetAliasResponse {
    message,
    code,
    data: {
        id,
        meetingRoomNum,
        alias

    }
}
interface ISubmitRoominfoByIdResponse {
    message,
    code,
}
//会议管理页面
interface IMeetingManageResponse {
    code //0
    message // 成功
    data: {
        id
        length
        meetingRoomNum // 会议室号
        password // 密码
        organId // 机构id
        beginTime // 开始时间
        duration //持续时间
        endTime // 结束时间
        meetingName // 会议室名称
        sendName // 发送名字
        sendMail //发送邮箱
        sendPhone //发送手机号
        receveInner // 收到输入
        receiveOut // 收到输出
        mailStatus //邮件状态
        personList // 人的列表
    }
}
interface IDeleteMeetingResponse {
    code //0
    message // 成功
}
interface IGetTeamsResponse {
    code //0
    message // 成功
    data: {
        id
        orgId
        tName
        account
        length
    }
}
interface IGetPersonResponse {
    code //0
    message // 成功
    data: {
        id
        orgId
        teamId
        tName
        cName
        phoneNum
        email
        startNum
        count
        length
    }
}
interface IGetVmrsResponse {
    code //0
    message // 成功
    data
}
interface IGetVmrsDetailResponse {
    code //0
    message // 成功
    data: {
        capacity
        guestPassword
    }
}
interface IGetNewMeetingResponse {
    code //0
    message // 成功
    data: {
        organId
        meetingRoomNum
        meetingName
        sendName
        sendMail
        sendPhone
        receiveOut
        personList
        beginTime
        endTime
    }
}
//硬件管理页面的接口
interface IDeviceCountResponse {
    code
    message //成功
    data: {
        count //数量
    }
}
interface IDevicesResponse {
    code //0
    message //成功
    data: {
        id
        organId //机构id
        orgName //机构名称
        departId //部门id
        accountNum //设备编号
        accountAlias //设备别名
        displayName //这个字段已弃用
        description //描述
        pexipName //peixip账号
        pexipPassword //pexip密码
        deviceProtocol //设备协议
        pexipDescription //pexip描述
        startTime //开始时间
        expirationDate //到期时间
        length
    }
}
//用户账号页面
interface IUserAccountResponse {
    code
    message
    data: {
        Id
        orgName //机构名
        organId //机构id
        departId //部门id
        accountNum //设备名
        accountAlias //设备别名
        displayName //这个字段已弃用
        userName //用户名
        password //密码
        pexipName //pexip账号
        pexipPassword //pexip密码
        description //描述
        deviceProtocol //设备协议
        userEmail //用户邮箱
        userTel //用户电话
        expirationDate //过期时间
        startTime //开始时间
        pexipDescription //pexip描述
    }
}
interface IGetDeptsResponse {
    message
    data: {
        id,
        parentId,
        departName,
        organId
    }
    code
}
interface IGetUsersResponse {
    message
    data: {
        id,
        organId,
        departId,
        accountNum,
        accountAlias,
        displayName,
        userName,
        password,
        userEmail,
        userTel,
        description,
        pexipName,
        pexipPassword
    }
    code
}
//会议统计页面
interface IQueryResponse {
    message
    data
    code
}
//通讯录页面的接口
interface IAddressListResponse {
    code //0
    message //成功
    data: {
        Id
        orgId //机构id
        orgName //机构名称
        teamId //分组id
        tName //分组名称
        cName
        phoneNum //手机号
        email //邮箱
        remark //描述
        length
    }
}
// 直播活动列表的接口
interface IRecordListResponse {
    code // ? 目前知道的是0表示成功
    msg // ?
    data: {
        endTime // 结束时间
        fileName // 文件名称
        id // 直播id
        list
        liveEndTime
        liveStartTime
        liveStatus
        meetingRoomNum
        orgId
        recordStatus
        rtmpUrl
        startTime
    }
}
// 录制活动列表的接口
interface ILiveListResponse {
    code // [0|2|3|999]
    message // [成功|无效token|没有权限|服务器内部错误]
    data: {
        totalSize // 数据总条数
        message
        resultList: {
            id // 直播记录ID
            title // 直播名称
            meetingRoomNum // 会议室号
            startTime // 开始时间
            endTime // 结束时间
            status //状态(0-未开始 1-已开始 2-已结束)
            length
        }
    }
}
// 根据机构ID获取会议室列表
interface IRoomListResponse {
    code
    message
    data: {
        id
        meetingRoomNum
        oranId
        departId
        name
        themeId
        count
    }
}
// 根据直播id获取直播详情
interface ILiveDetailResponse {
    code
    msg
    data: {
        id
        title
        meetingRoomNum
        startTime
        endTime
        status
        vmrNum
        description
        authority
        definition
        authCode
        imgUrl
    }
}
// 使用统计页面
// 定义会议室使用次数接口 返回数据 对应的格式
interface IUseCountConferenceResponse {
    code
    message
    data: {
        timeline: {
            time,
            totalCount
        }
        vmrDetail: {
            vmrNum
            vmrCount
        }
    }
}
// 定义最高并发数接口 返回数据 对应的格式
interface IUseCountSimultaneousResponse {
    code
    message
    data: {
        timeline: {
            time
            simultaneous
        }
        vmrDetail: {
            simultaneous
            vmrNum
        }
    }
}
// 定义会议时长接口 返回数据 对应的格式
interface IUseCountDurationResponse {
    code
    message
    data: {
        conference: {
            duration
            time
        }
        participant: {
            duration
            time
        }
    }
}
// 定义导出报表接口 返回数据 对应的格式
interface IOutputChartResponse {
    code
    message
    data: {
        url
    }
}
// 直播统计页面
// 定义获取直播统计相关数据接口 返回数据 对应的格式
interface ILiveCountResponse {
    code
    message
    data: {
        browser: [{
            name
            value
        }]
        device: [{
            name
            value
        }]
        region: [{
            name
            value
        }]
        timeline: [{
            time
            traffic
            simultaneous
        }]
    }
}
// 定义直播导出报表接口 返回数据 对应的格式
interface ILiveOutputChartResponse {
    code
    message
    data: {
        url
    }
}
// 定义获取直播列表接口 返回数据 对应的格式
interface ILiveListResponse {
    code
    message
    data: {
        liveId
        title
    }
}
export class RemoteService {
    static $inject = ['$http'];

    constructor(public http: IHttpService) {
        initConnection(http);
    }

    request<T>(callback: () => IHttpPromise<T>) {
        return callback();
    };

    login(options) {
        return this
            .request<ILoginResponse>(() => {
                let url = global.API_PATH + 'v1/user/login';
                return this.http<ILoginResponse>({
                    method: 'post',
                    url: url,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    transformRequest: function (data) {
                        return $.param(data);
                    }, data: options
                });

            })
    };

    //获取管理员显示名称
    getDisplayName() {
        return this
            .request<IGetDisplayNameResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/get-displayname?token=' + sessionStorage.getItem('token');
                return this.http.get<IGetDisplayNameResponse>(url, {
                    params: {}
                })
            })
    }

    signout(userId, webToken) {
        return this
            .request<ISignOutResponse>(() => {
                let url = global.API_PATH + '/v1/backend/' + sessionStorage.getItem('userId') + '/sessions?' + 'webToken=' + sessionStorage.getItem('token')
                return this.http.delete<ISignOutResponse>(url)
            })
    }

    //状态总览部分
    // 所属机构
    getDepartment() {
        return this
            .request<IGetDepartmentResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '?token=' + sessionStorage.getItem('token')
                return this.http.get<IGetDepartmentResponse>(url, {
                    params: {
                        // verificationStatus: verificationStatus,
                        // page: page,
                        // pageSize: pageSize,
                        // webToken: sessionStorage.getItem('token')
                    }
                })
            })
    }

    //会议室总数
    totalCount() {
        return this
            .request<ITotalCountResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs-count?token=' + sessionStorage.getItem('token')
                return this.http.get<ITotalCountResponse>(url, {
                    params: {}
                })
            })
    }

    //设备账号
    getDeviceAccount() {
        return this
            .request<IGetDeviceAccountResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/devices-count?token=' + sessionStorage.getItem('token')
                return this.http.get<IGetDeviceAccountResponse>(url, {
                    params: {}
                })
            })
    }

    //用户账号
    getUserAccount() {
        return this
            .request<IGetUserAccountResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users-count?token=' + sessionStorage.getItem('token')
                return this.http.get<IGetUserAccountResponse>(url, {
                    params: {}
                })
            })
    }

    //获取所有的会议时长信息
    getAllDuration() {
        return this
            .request<IGetAllDurationResponse>(() => {
                let url = global.API_PATH + "v1/orgs/" + sessionStorage.getItem("orgId") + "/getAllDuration?token=" + sessionStorage.getItem("token");
                return this.http.get<IGetAllDurationResponse>(url, {})
            })
    }

    //获取所有的会议次数信息
    getAllConferenceTime() {
        return this
            .request<IGetAllConferenceTime>(() => {
                let url = global.API_PATH + "v1/orgs/" + sessionStorage.getItem("orgId") + "/getAllConferenceTime?token=" + sessionStorage.getItem("token");
                return this.http.get<IGetAllConferenceTime>(url, {})
            })
    }

    // 获取实时会议信息
    getActiveConferences() {
        return this
            .request<IGetActiveConfeResponse>(() => {
                let
                    path = global.API_PATH,
                    accountId = sessionStorage.getItem('accountId'),
                    token = sessionStorage.getItem('token'),
                    url = `${ path }v1/admin/accounts/${ accountId }/activeConferences?token=${ token }`;

                return this.http.get<IGetActiveConfeResponse>(url, {
                    params: {}
                })
            })
    }

    // 获取参会者信息
    getParticipantsInfo(options) {
        return this
            .request<IGetParticipantsInfoResponse>(() => {
                let
                    path = global.API_PATH,
                    accountId = sessionStorage.getItem('accountId'),
                    token = sessionStorage.getItem('token'),
                    number = options.meetingRoomNum,
                    url = `${ path }v1/admin/accounts/${ accountId }/activeConferences/${ number }/participants?token=${ token }`;

                return this.http.get<IGetParticipantsInfoResponse>(url, {
                    params: {}
                })
            })
    }

    // 获取参会者媒体信息
    getMediaInfo(options) {
        return this
            .request<IGetMediaInfoResponse>(() => {
                let
                    path = global.API_PATH,
                    accountId = sessionStorage.getItem('accountId'),
                    token = sessionStorage.getItem('token'),
                    number = options.meetingRoomNum,
                    id = options.id,
                    url = `${ path }v1/admin/accounts/${ accountId }/activeConferences/${ number }/participants/${ id }/media?token=${ token }`;

                return this.http.get<IGetMediaInfoResponse>(url, {
                    params: {}
                })
            })
    }

    getDepts() {
        return this.request<IGetDeptsResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/depts?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetDeptsResponse>(url, {})
        })
    }

    getUsers(id?) {
        return this.request<IGetUsersResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users/' + id + '?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetUsersResponse>(url, {})
        })
    }

    editUserById(id, data) {
        return this.request<IGetUsersResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users/' + id + '?token=' + sessionStorage.getItem('token')
            return this.http.put<IGetUsersResponse>(url, data)
        })
    }

    //会议室管理页面的接口请求
    roomManage(options) {
        return this
            .request<IRoomManageResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs?token=' + sessionStorage.getItem('token')
                return this.http.get<IRoomManageResponse>(url, {
                    params: options
                })
            })
    }

    getRoominfoById(id) {
        return this.request<IGetRoominfoByIdResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs/' + id + '?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetRoominfoByIdResponse>(url, {})
        })
    }

    getAlias(id) {
        return this.request<IGetAliasResponse>(() => {
            let url = global.API_PATH + '/v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs/' + id + '/alias?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetAliasResponse>(url, {})
        })
    }

    getSelectableThemes() {
        return this.request(() => {
            let accountId = sessionStorage.accountId;
            let token = sessionStorage.token;
            let language = localStorage.lang == 'cn-cn' ? 'cn' : 'en'
            let url = `${global.API_PATH}v1/admin/accounts/${accountId}/info/themes?selectAccountId=${accountId}&type=meeting&token=${token}&language=${language}`;
            return this.http.get(url, {})
        })
    }

    //获取会议室对应的容量和入会密码
    getvmrsDetail(vmrNum) {
        return this.request<IGetVmrsDetailResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/vmrs/getmrMes?meetingRoomNum=' + vmrNum + '&token=' + sessionStorage.getItem('token')
            return this.http.get<IGetVmrsDetailResponse>(url, {})
        })
    }

    //通过会议室号查询相关信息
    getRoominfoByNum(num) {
        return this.request<IGetRoominfoByIdResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetingRoomNum/' + num + '?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetRoominfoByIdResponse>(url, {})
        })
    }

    //提交编辑会议室信息
    submitRoomInfo(options) {
        return this.request<ISubmitRoominfoByIdResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs/' + options.id + '?token=' + sessionStorage.getItem('token')
            return this.http.put<ISubmitRoominfoByIdResponse>(url, options)
        })
    }

    //会议管理页面的接口请求
    getMeetingManage(options) {
        return this
            .request<IMeetingManageResponse>(() => {
                let contentType: "application/json"
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetings?token=' + sessionStorage.getItem('token')
                return this.http.get<IMeetingManageResponse>(url, {
                    params: options
                })
            })
    }

    deleteMeeting(meetingId, lang) {
        return this.request<IDeleteMeetingResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetings/' + meetingId + '?token=' + sessionStorage.getItem('token') + '&language=' + lang;
            return this.http.delete<IDeleteMeetingResponse>(url, {})
        })
    }

    //新建会议页面的接口请求
    getTeam() {
        return this
            .request<IGetTeamsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/teams?token=' + sessionStorage.getItem('token');
                return this.http.get<IGetTeamsResponse>(url, {})
            })
    }

    getPerson(teamid) {
        return this
            .request<IGetPersonResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/persons?token=' + sessionStorage.getItem('token') + '&teamId=' + teamid;
                return this.http.get<IGetPersonResponse>(url, {})
            })
    }

    getVmrs(startTime, endTime) {
        return this
            .request<IGetVmrsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/usablevmrs/?beginTime=' + startTime + '&endTime=' + endTime + '&token=' + sessionStorage.getItem('token')
                return this.http.get<IGetVmrsResponse>(url, {})
            })
    }

    //点击新建会议
    getNewMeeting(sendemail, data, language) {
        return this.request<IGetNewMeetingResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetings?token=' + sessionStorage.getItem('token') + '&flag=' + sendemail + '&language=' + language;
            return this.http.post<IGetNewMeetingResponse>(url, {
                organId: sessionStorage.getItem('orgId'),
                meetingRoomNum: data.meetingRoomNum,
                meetingName: data.meetingName,
                sendName: data.sendName,
                sendMail: data.sendMail,
                sendPhone: data.sendPhone,
                receiveOut: data.receiveOut,
                personList: data.personList,
                beginTime: data.beginTime,
                endTime: data.endTime,
            })
        })
    }

    //新建会议页面的接口请求结束

    //硬件管理页面的接口请求
    getDeviceCount() {
        return this
            .request<IDeviceCountResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/devices-count?token=' + sessionStorage.getItem('token')
                return this.http.get<IDeviceCountResponse>(url, {
                    params: {}
                })
            })
    }

    getDevices() {
        return this
            .request<IDevicesResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/devices?token=' + sessionStorage.getItem('token')
                return this.http.get<IDevicesResponse>(url, {
                    params: {}
                })
            })
    }

    editDevices(id, data) {
        return this
            .request<IDevicesResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/devices/' + id + '?token=' + sessionStorage.getItem('token')
                return this.http.put<IDevicesResponse>(url, data)
            })
    }

    //硬件管理页面的接口请求

    //用户账号页面的接口请求
    userAccount(options) {
        return this
            .request<IUserAccountResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users?token=' + sessionStorage.getItem('token')
                return this.http.get<IUserAccountResponse>(url, {
                    params: options
                })
            })
    }

    //会议统计页面的接口请求
    query(startTime, endTime) {
        return this
            .request<IQueryResponse>(() => {
                let url = global.API_PATH + 'cloudpServer/v1/orgs/' + sessionStorage.getItem("orgId") + '/countAllHistory?token=' + sessionStorage.getItem("token") + '&startTime=' + startTime + '&endTime=' + endTime;
                return this.http.get<IQueryResponse>(url, {})
            })
    }

    //通讯录页面的接口请求
    getAllPersons(pageNum?, count?, teamId?) {
        return this
            .request<IAddressListResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/persons?token=' + sessionStorage.getItem('token')
                return this.http.get<IAddressListResponse>(url, {
                    params: {
                        pageNum: pageNum,
                        count: count,
                        teamId: teamId

                    }
                })
            })
    }

    //添加人员
    addPerson(data) {
        return this
            .request<IAddressListResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/person?token=' + sessionStorage.getItem('token')
                return this.http.post<IAddressListResponse>(url, data)
            })
    }

    modifyPerson(data) {
        return this
            .request<IAddressListResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/person?token=' + sessionStorage.getItem('token')
                return this.http.put<IAddressListResponse>(url, data)
            })
    }

    //添加分组
    addTeam(data) {
        return this
            .request<IGetTeamsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/team?token=' + sessionStorage.getItem('token');
                return this.http.post<IGetTeamsResponse>(url, data)
            })
    }

    //修改分组
    editTeam(data) {
        return this
            .request<IGetTeamsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/team?token=' + sessionStorage.getItem('token');
                return this.http.put<IGetTeamsResponse>(url, data)
            })
    }

    deleteTeam(id) {
        return this
            .request<IGetTeamsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/team/' + id + '?token=' + sessionStorage.getItem('token');
                return this.http.delete<IGetTeamsResponse>(url, {})
            })
    }

    deletePerson(id) {
        return this
            .request<IGetTeamsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/person/' + id + '?token=' + sessionStorage.getItem('token');
                return this.http.delete<IGetTeamsResponse>(url, {})
            })
    }

    // 获取直播活动列表的接口请求
    getLiveList(options) {
        return this
            .request<ILiveListResponse>(() => {
                let
                    url = `${ global.API_PATH }v1/streaming/${ sessionStorage.getItem('orgId')}/liveList?token=${ sessionStorage.getItem('token')}`;

                return this.http.post<ILiveListResponse>(url, options)
            })
    }

    // 获取录制列表的接口请求
    getRecordList(pageNum, pageSize) {
        return this
            .request<IRecordListResponse>(() => {
                let url = global.API_PATH + 'v1/streaming/file/orgId/' + sessionStorage.getItem('orgId') + '?token=' + sessionStorage.getItem('token') + '&pageNum=' + pageSize + '&pageCount=' + pageNum
                return this.http.get<IRecordListResponse>(url, {
                    params: {}
                })
            })
    }

    // 获取录制列表的总记录数
    getTotalOfRecord() {
        return this
            .request<IRecordListResponse>(() => {
                let url = global.API_PATH + 'v1/streaming/streams/' + sessionStorage.getItem('orgId') + '/?token=' + sessionStorage.getItem('token')
                return this.http.get<IRecordListResponse>(url, {
                    params: {}
                })
            })
    }

    // 删除某条录制记录
    deleteRecordByID(deleteFileName) {
        return this
            .request<IRecordListResponse>(() => {
                let url = global.API_PATH + 'v1/streaming/file/orgId/' + sessionStorage.getItem('orgId') + '?token=' + sessionStorage.getItem('token') + '&fileName=' + deleteFileName
                return this.http.delete<IRecordListResponse>(url, {
                    params: {}
                })
            })
    }

    // 删除某条直播活动记录
    deleteLiveByID(id) {
        return this
            .request<IRecordListResponse>(() => {
                let url = global.API_PATH + 'v1/streaming/bookLive/' + id
                return this.http.delete<IRecordListResponse>(url, {
                    params: {
                        id: id,
                        token: sessionStorage.getItem('token')
                    }
                })
            })
    }

    // 根据机构ID获取客户会议室列表
    getRoomListByOrgID(options) {
        return this
            .request<IRoomListResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs?token=' + sessionStorage.getItem('token') + '&org_id=' + sessionStorage.getItem('orgId')
                return this.http.get<IRoomListResponse>(url, {
                    params: options
                })
            })
    }

    // 创建直播活动
    createLiveActivity(createLiveInfo) {
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/streaming/' + sessionStorage.getItem('orgId') + '/bookLive?token=' + sessionStorage.getItem('token')
                return this.http.post<ILiveListResponse>(url, createLiveInfo);
            })
    }

    // 根据直播ID获取直播详情
    getLiveDetailByLiveID(liveID) {
        return this
            .request<ILiveDetailResponse>(() => {
                let url = global.API_PATH + 'v1/streaming/' + sessionStorage.getItem('orgId') + '/liveList/' + liveID + '?token=' + sessionStorage.getItem('token')
                return this.http.get<ILiveDetailResponse>(url, {
                    params: {}
                })
            })
    }

    // 录制直播 上传文件
    uploadPic(fileData) {
        let uploadUrl = `${global.API_PATH}v1/streaming/live/uploadPic?orgId=${sessionStorage.getItem('orgId')}&token=${sessionStorage.getItem('token')}`;
        return this.request(() => {
            return this.http.post(uploadUrl, fileData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        })
    }

    // 修改直播活动
    updateLiveActivity(liveID, updateLiveInfo) {
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/streaming/' + sessionStorage.getItem('orgId') + '/live/' + liveID + '?token=' + sessionStorage.getItem('token');
                return this.http.put<ILiveListResponse>(url, updateLiveInfo);
            })
    }

    /* 使用统计 相关接口 */
    // 获取会议相关数据
    getConferenceCount(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/conferenceCount';
                return this.http.get<IUseCountConferenceResponse>(url, {
                    params: requestData
                });
            })
    }

    // 获取并发相关数据
    getSimultaneousCount(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/simultaneous';
                return this.http.get<IUseCountSimultaneousResponse>(url, {
                    params: requestData
                });
            })
    }

    // 获取会议时长相关数据
    getDurationCount(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/duration';
                return this.http.get<IUseCountDurationResponse>(url, {
                    params: requestData
                });
            })
    }

    // 获取用于导出报表的url
    getURLOfOutputChart(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/exportConferenceData';
                return this.http.get<IOutputChartResponse>(url, {
                    params: requestData
                });
            })
    }

    /* 直播统计 相关接口 */
    // 获取直播统计相关数据
    getLiveCountData(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/live';
                return this.http.get<ILiveCountResponse>(url, {
                    params: requestData
                });
            })
    }

    // 获取直播用于导出报表的url
    getLiveURLOfOutputChart(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/exportLiveData';
                return this.http.get<ILiveOutputChartResponse>(url, {
                    params: requestData
                });
            })
    }

    // 获取指定时间段的直播列表
    getLiveListByCondition(requestData) {
        requestData.token = sessionStorage.getItem('token');
        return this
            .request(() => {
                let url = global.API_PATH + 'v1/stats/org/' + sessionStorage.getItem('orgId') + '/liveList';
                return this.http.get<ILiveListResponse>(url, {
                    params: requestData
                });
            })
    }

    //获取定制化信息
    getCustomizedInfo() {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = global.API_PATH + 'v1/admin/accounts/' + sessionStorage.getItem('accountId') + '/info';
            return this.http.get(url, {
                params: {
                    token: token
                }
            });
        });
    }

    // 获取后台管理系统定制化信息
    getAdminCustomInfo() {
        let token = sessionStorage.getItem('token');
        let accountId = sessionStorage.getItem('accountId');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${accountId}/info/adminCustomized`;
            return this.http.get(url, {
                params: {
                    token,
                    accountId
                }
            });
        });
    }

    // 获取meeting系统定制化信息
    getMeetingCustomInfo() {
        let token = sessionStorage.getItem('token');
        let accountId = sessionStorage.getItem('accountId');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${accountId}/info/meetingCustomized`;
            return this.http.get(url, {
                params: {
                    token,
                    accountId
                }
            });
        });
    }

    // 获取 iOS客户端定制化信息
    getIOSCustomInfo() {
        let token = sessionStorage.getItem('token');
        let accountId = sessionStorage.getItem('accountId');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${accountId}/info/iOSMobileCustomized`;
            return this.http.get(url, {
                params: {
                    token,
                    accountId
                }
            });
        });
    }

    // 获取 Android客户端定制化信息
    getAndroidCustomInfo() {
        let token = sessionStorage.getItem('token');
        let accountId = sessionStorage.getItem('accountId');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${accountId}/info/androidMobileCustomized`;
            return this.http.get(url, {
                params: {
                    token,
                    accountId
                }
            });
        });
    }

    // 获取 pc定制化信息
    getPCCustomInfo() {
        let token = sessionStorage.getItem('token');
        let accountId = sessionStorage.getItem('accountId');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${accountId}/info/desktopCustomized`;
            return this.http.get(url, {
                params: {
                    token,
                    accountId
                }
            });
        });
    }

    // 修改后台管理系统定制化信息
    updAdminCustomized(requestParam) {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${sessionStorage.getItem('accountId')}/info/adminCustomized/${requestParam.id}?token=${token}`;
            return this.http.put(url, requestParam);
        })
    }

    // 修改meeting系统定制化信息
    updMeetingCustomized(requestParam) {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${sessionStorage.getItem('accountId')}/info/meetingCustomized/${requestParam.id}?token=${token}`;
            return this.http.put(url, requestParam);
        })
    }

    // 修改iOS定制化信息
    updIOSCustomized(requestParam) {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${sessionStorage.getItem('accountId')}/info/iOSMobileCustomized/${requestParam.id}?token=${token}`;
            return this.http.put(url, requestParam);
        })
    }

    // 修改Android定制化信息
    updAndroidCustomized(requestParam) {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${sessionStorage.getItem('accountId')}/info/androidMobileCustomized/${requestParam.id}?token=${token}`;
            return this.http.put(url, requestParam);
        })
    }

    // 修改PC定制化信息
    updPCCustomized(requestParam) {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = `${global.API_PATH}v1/admin/accounts/${sessionStorage.getItem('accountId')}/info/desktopCustomized/${requestParam.id}?token=${token}`;
            return this.http.put(url, requestParam);
        })
    }

    // 打包发布
    publishInstallPackage(type) {
        let token = sessionStorage.getItem('token');
        return this.request(() => {
            let url = `${global.API_PATH}v1/customization/accounts/${sessionStorage.getItem('accountId')}/publish?token=${token}&type=${type}`;
            return this.http.post(url);
        })
    }

    // 定制化图片上传
    customUploadPicture(id, fileData) {
        let token = sessionStorage.getItem('token'),
            uploadUrl = `${global.API_PATH}v1/admin/common/upload?token=${token}&businessId=${id}&businessType=customized`;

        return this.request(() => {
            return this.http.post(uploadUrl, fileData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        })
    }

    // 根据域名获取管理端配置
    getCustomImgByDomain(domain) {
        return this.request(() => {
            let url = global.API_PATH + 'v1/customization/admin/domain';
            return this.http.get(url, {
                params: {
                    domain: domain
                }
            });
        });
    }

    // 硬件管理
    getBoxInfoList(options) {
        return this.request(() => {
            let url = `${ global.API_PATH }v1/admin/accounts/${ sessionStorage.getItem('accountId') }/boxes`;
            return this.http.get(url, {
                params: options
            });
        });
    }

    // 企业视讯
    getConferenceListInfo() {
        return this.request(() => {
            let url = `${ global.API_PATH }v1/admin/accounts/${ sessionStorage.getItem('accountId') }/info/conferenceCustomized?token=${ sessionStorage.getItem('token')}`;
            return this.http.get(url, {
                params: {}
            });
        });
    }

    updateConferenceInfo(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/info/conferenceCustomized/${options.id}?token=${token}`;

            return this.http.put(url, options);
        });
    }

    // apk 管理
    getApkListInfo(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/apks?token=${token}`;
            return this.http.get(url, {
                params: options
            });
        });
    }

    // 上下线
    upOrDownline(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/apks/${options.id}?token=${token}`;

            return this.http.put(url, {});
        });
    }

    // 新增apk
    addAPK(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/apks?token=${token}`;
            return this.http.post(url, options);
        })
    }

    // 修改apk
    updateAPK(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/apks?token=${token}`;

            return this.http.put(url, options)
        })
    }

    // 删除apk
    deleteApks(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/delApks?token=${token}`;
            return this.http.post(url, options);
        })
    }

    // 获取apk版本信息
    getApkVersionInfo(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/apks/${options.apkId}/version?token=${token}`;

            return this.http.get(url, {
                params: options
            });
        });
    }

    // 硬件管理上传文件接口
    uploadFileOfHardware(type, file) {
        let token = sessionStorage.getItem('token'),
            accountId = sessionStorage.getItem('accountId'),
            uploadUrl = `${global.API_PATH}v1/admin/common/upload?token=${token}&businessId=${accountId}&businessType=${type}`;

        return this.request(() => {
            return this.http.post(uploadUrl, file, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        })
    }

    // 新增apk版本
    addApkVersion(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/apks/version?token=${token}`;

            return this.http.post(url, options);
        })
    }

    // 修改apk版本
    updateApkVersion(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/apks/version?token=${token}`;

            return this.http.put(url, options)
        })
    }

    // 删除apk版本
    deleteApkVersion(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/apks/version?id=${options.id}&token=${token}`;

            return this.http.delete(url)
        })
    }

    // 豆腐块相关接口
    // 获取豆腐块列表
    getTofuListInfo(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/beanCurdCubes?token=${token}`;

            return this.http.get(url, {
                params: options
            });
        });
    }

    // 新增豆腐块
    addTofu(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/beanCurdCubes?token=${token}`;

            return this.http.post(url, options);
        })
    }

    // 修改豆腐块
    updateTofu(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/beanCurdCubes?token=${token}`;

            return this.http.put(url, options)
        })
    }

    // 删除豆腐块
    deleteTofus(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/delBeanCurdCubes?token=${token}`;
            return this.http.post(url, options);
        })
    }

    // 获取apk信息列表
    getApkInfoList() {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}?token=${token}`;

            return this.http.get(url);
        });
    }

    // 获取内容图管理列表
    getContentOfTofu(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/beanCurdCubes/${ options.id }/details?token=${token}`;

            return this.http.get(url);
        });
    }

    // 新增内容
    addContent(options, id) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/beanCurdCubes/${id}/details?token=${token}`;

            return this.http.post(url, options);
        })
    }

    // 修改内容
    updateContent(options, id) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/beanCurdCubes/${id}/details?token=${token}`;

            return this.http.put(url, options)
        })
    }

    // 删除内容
    deleteContent(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/beanCurdCubes/${options.tofuId}/details/${options.contentId}?token=${token}`;

            return this.http.delete(url, options)
        })
    }

    // 首屏管理
    // 获取豆腐块
    getTofuListOfScreen() {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/beanCurdCubeScreen?token=${token}`;

            return this.http.get(url);
        });
    }

    // 获取所有豆腐块
    getAllTofuList() {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/allBeanCurdCubes?token=${token}`;

            return this.http.get(url);
        });
    }

    // 获取豆腐块详情
    getDetailsOfTofu(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/beanCurdCubes/${options.tofuId}/details?token=${token}`;

            return this.http.get(url);
        });
    }

    // 保存 编辑后的豆腐块
    editTofuOfScreen(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/accounts/${accountId}/beanCurdCubeScreens?token=${token}`;

            return this.http.post(url, options);
        })
    }

    //获取企业信息墙定制化全部内容
    getEnterpriseInfo(title, id) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/enterpriseInformations/${id}?token=${token}&title=${title}`;

            return this.http.get(url);
        });
    }

//  增加企业信息栏内容
    updInformationCustomized(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/enterpriseInformations?token=${token}`;

            return this.http.post(url, options);
        });
    }

//  保存编辑企业信息栏内容
    saveEditContent(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/enterpriseInformations?token=${token}`;

            return this.http.put(url, options);
        });
    }

    //删除某条企业信息栏的内容
    sureDeleteInformation(id) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/enterpriseInformations/${id}?token=${token}`;

            return this.http.delete(url);
        });
    }

//  获取视频库分组列表
    getGroupList(lang) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/videoGroupAndVideos?token=${token}&language=${lang}`;
            return this.http.get(url);
        });
    }

//  添加视频库中视频分组
    addVideoGroup(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/videoGroups?token=${token}`;
            return this.http.post(url, options);
        });
    }

//  获取视频分组
    getVideoGroups() {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/videoGroups?token=${token}`;
            return this.http.get(url);
        });
    }

//  保存本地上传的视频
    saveLocalVideo(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/enterpriseVideos?token=${token}`;
            return this.http.post(url, options);
        });
    }

    //修改视频名称
    modifyVideoName(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/enterpriseVideos?token=${token}`;
            return this.http.put(url, options)
        })
    }

    //修改视频所在分组
    moveGroup(options, targetId) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/moveEnterpriseVideos?token=${token}&targetGroupId=${targetId}`;
            return this.http.put(url, options)
        })
    }

    //  删除视频
    sureDeleteVideo(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/delEnterpriseVideos?token=${token}`;
            return this.http.put(url, options)
        })
    }

    //  重命名分组名称
    renameGroup(options) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/videoGroups ?token=${token}`;
            return this.http.put(url, options)
        })
    }

    //  删除视频分组
    deleteVideoGroup(groupId) {
        return this.request(() => {
            let accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }v1/admin/accounts/${accountId}/videoGroups/${groupId}/?token=${token}`;
            return this.http.delete(url)
        })
    }

    //企业信息墙视频上传
    customUploadVideo(id, fileData) {
        let token = sessionStorage.getItem('token'),
            uploadUrl = `${global.API_PATH}v1/admin/common/upload?token=${token}&businessId=${id}&businessType=enterpriseInfo`;

        return this.request(() => {
            return this.http.post(uploadUrl, fileData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
        })
    }

    // 获取账号安全状态
    getUserStatus() {
        return this.request(() => {
            let userId = sessionStorage.getItem('userId'),
                token = sessionStorage.getItem('token'),
                url = `${ global.API_PATH }/v1/admin/users/${userId}/userStatus?token=${token}`;

            return this.http.get(url);
        });
    }

    // 修改登录名
    alterUsername(options) {
        return this.request(() => {
            let userId = sessionStorage.getItem('userId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}/v1/admin/users/${userId}/updateUsername?token=${token}&newUsername=${options.newUsername}`;
            return this.http.put(url, options)
        })
    }

    // 获取邮箱验证码
    sendEmailCode(options) {
        return this.request(() => {
            let userId = sessionStorage.getItem('userId'),
                token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}v1/admin/user/${userId}/sentEmailCode?token=${token}`;
            return this.http.post(url, options)
        })
    }

    // 发送手机验证码
    sendPhoneCode(options) {
        return this.request(() => {
            let token = sessionStorage.getItem('token'),
                url = `${global.API_PATH}/v1/trial/smsAll?token=${token}`;
            return this.http.post(url, options)
        })
    }

    // 校验邮箱
    checkEmail({email}) {
        return this.request(() => {
            let token = sessionStorage.getItem('token'),
                userId = sessionStorage.getItem('userId'),
                url = `${global.API_PATH}v1/admin/checkEmail?token=${token}&email=${email}`;
            return this.http.get(url)
        })
    }

    // 修改和绑定邮箱
    alterAndBindEmail(options) {
        return this.request(() => {
            let token = sessionStorage.getItem('token'),
                userId = sessionStorage.getItem('userId'),
                url = `${global.API_PATH}v1/admin/user/${userId}/bindEmail?token=${token}`
            return this.http.put(url, options)
        })
    }

    // 修改和绑定手机号
    alterAndBindPhone(options) {
        return this.request(() => {
            let token = sessionStorage.getItem('token'),
                userId = sessionStorage.getItem('userId'),
                url = `${global.API_PATH}/v1/admin/user/${userId}/bindPhone?token=${token}`
            return this.http.post(url, options)
        })
    }
}

export let name = 'app.remote';
angular.module(name, [])
    .service('RemoteService', RemoteService);
