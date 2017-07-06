import * as angular from 'angular';
import {global} from "../global";
import IHttpService = angular.IHttpService;
import IHttpPromise = angular.IHttpPromise;

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
    "message": string,
    "data": {
        "id": number,
        "name": string,
        "remark": string,
        "isActive": number,
        "schemeId": number,
        "maxSimultaneous": number,
        "autoChangePasswd": number,
        "liveFlag": number,
        "recordFlag": number,
        "allowStreams": number,
        "orgManagerName": string,
        "orgManagerPassword": string
    },
    "code": string
}
interface ITotalCountResponse {
    "message": string,
    "data": {
        "count": string
    },
    "code": string
}
interface IGetDeviceAccountResponse {
    "message": string,
    "data": {
        "count": string
    },
    "code": string
}
interface IGetUserAccountResponse {
    "message": string,
    "data": {
        "count": string
    },
    "code": string
}
//会议室管理页面
interface IRoomManageResponse {
    "message": string,
    "data": {
        "count": string
        length;

    },
    "code": string
}
interface IMeetingRoomResponse {
    code: string//0
    message: string//成功
    data: {
        Id
        meetingRoomNum//会议室号
        oranId//机构id
        departId//部门id
        name//名称
        themeId//主题id
        themeName//主题名称
        themeUuid//主题uuid
        capacity//容量
        hostPassword//主持人密码
        guestPassword//参会者密码
        description//描述
        expirationDate//过期时间
        hostView//开会模式
        allowGuestFlag//允许参会者标记
        startTime//开始时间
        pexipDescription//pexip描述
        roomNumType//房间号类型
    }
}
interface IGetRoominfoByIdResponse{
    "message" : "成功",
    "data" : {
        "id" ,
        "meetingRoomNum" ,
        "organId",
        "accountId",
        "name" ,
        "themeId",
        "themeName",
        "themeUuid",
        "capacity",
        "hostPassword",
        "guestPassword" ,
        "expirationDate" ,
        "hostView",
        "allowGuestFlag",
        "startTime",
        "pexipDescription",
        "autoChangePasswd",
        "vmrType"
    },
    "code"
}
interface IGetAliasResponse{
    message,
    code,
    data:{
        id,
        meetingRoomNum,
        alias

    }
}
interface ISubmitRoominfoByIdResponse{
    "message" : "成功",
    "code" ,
}
//会议管理页面
interface IMeetingManageResponse {
    code//0
    message// 成功
    data: {
        id
        length
        meetingRoomNum// 会议室号
        password// 密码
        organId// 机构id
        beginTime// 开始时间
        duration//持续时间
        endTime// 结束时间
        meetingName// 会议室名称
        sendName// 发送名字
        sendMail//发送邮箱
        sendPhone//发送手机号
        receveInner// 收到输入
        receiveOut// 收到输出
        mailStatus//邮件状态
        personList// 人的列表
    }
}

interface IDeleteMeetingResponse {
    code//0
    message// 成功
}

interface IGetTeamsResponse {
    code//0
    message// 成功
    data: {
        id
        orgId
        tName
        account
    }
}

interface IGetPersonResponse {
    code//0
    message// 成功
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
    code//0
    message// 成功
    data
}

interface IGetVmrsDetailResponse {
    code//0
    message// 成功
    data: {
        capacity
        guestPassword
    }
}

interface IGetNewMeetingResponse {
    code//0
    message// 成功
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
    code: 0
    message//成功
    data: {
        count//数量
    }
}
interface IDevicesResponse {
    code//0
    message//成功
    data: {
        id
        organId//机构id
        orgName//机构名称
        departId//部门id
        accountNum//设备编号
        accountAlias//设备别名
        displayName//这个字段已弃用
        description//描述
        pexipName//peixip账号
        pexipPassword//pexip密码
        deviceProtocol//设备协议
        pexipDescription//pexip描述
        startTime//开始时间
        expirationDate//到期时间
        length;
    }
}


//用户账号页面
interface IUserAccountResponse {
    code: string;
    message: string;//成功
    data: {
        Id
        orgName//机构名
        organId//机构id
        departId//部门id
        accountNum//设备名
        accountAlias//设备别名
        displayName//这个字段已弃用
        userName//用户名
        password//密码
        pexipName//pexip账号
        pexipPassword//pexip密码
        description//描述
        deviceProtocol//设备协议
        userEmail//用户邮箱
        userTel//用户电话
        expirationDate//过期时间
        startTime//开始时间
        pexipDescription//pexip描述
    }
}

interface IGetDeptsResponse {
    message
    data:{
        id,
        parentId,
        departName,
        organId
    }
    code
}

interface IGetUsersResponse {
    message
    data:{
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
    code//0
    message//成功
    data: {
        Id
        orgId//机构id
        orgName//机构名称
        teamId//分组id
        tName//分组名称
        cName
        phoneNum//手机号
        email//邮箱
        remark//描述
        length
    }
}

// 直播活动列表的接口
interface IRecordListResponse {
    code    // ? 目前知道的是0表示成功
    msg     // ?
    data: {
        endTime     // 结束时间
        fileName    // 文件名称
        id           // 直播id
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
    code    // [0|2|3|999]
    message     // [成功|无效token|没有权限|服务器内部错误]

    data: {
        totalSize   // 数据总条数
        message
        resultList: {
            id       // 直播记录ID
            title   // 直播名称
            meetingRoomNum  // 会议室号
            startTime   // 开始时间
            endTime // 结束时间
            status  //状态(0-未开始 1-已开始 2-已结束)
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

export class RemoteService {
    static $inject = ['$http'];

    constructor(public http: IHttpService) {
        initConnection(http);
    }

    request<T>(callback: () => IHttpPromise<T>) {
        return callback();
    };

    login(username, password) {
        return this
            .request<ILoginResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/admin-login?';
                console.log("正在发送请求", username, password);
                return this.http.get<ILoginResponse>(url, {
                    params: {
                        username: username,
                        password: password,
                    }
                })
            })
    };

    codeCheck(checkCode) {
        return $.ajax({
            crossDomain: true,
            xhrFields: {withCredentials: true},
            type: "post",
            url: global.API_PATH + 'checkCaptcha',
            data: {
                timestamp: '',
                code: checkCode
            },
            dataType: "json"
            // this
            // .request<ILoginResponse>(() => {

            //         let url = global.API_PATH + 'checkCaptcha';
            //         return this.http.post<ILoginResponse>(url,"timestamp=&code="+checkCode,{
            //             headers:{
            //                 'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
            //             }
            //         })
            //     })
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
                console.log("正在发送请求", userId, webToken);
                return this.http.delete<ISignOutResponse>(url)
            })
    }

    //状态总览部分
    //所属机构
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

    getDepts(){
        return this.request<IGetDeptsResponse>(()=>{
            let url=global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/depts?token=' + sessionStorage.getItem('token')
                return this.http.get<IGetDeptsResponse>(url,{})
        })
    }
    getUsers(id?){
        return this.request<IGetUsersResponse>(()=>{
            let url=global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users/'+id+'?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetUsersResponse>(url,{})
        })
    }
    editUserById(id,data){
        return this.request<IGetUsersResponse>(()=>{
            let url=global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users/'+id+'?token=' + sessionStorage.getItem('token')
            return this.http.put<IGetUsersResponse>(url,data)
        })
    }

    //会议室管理页面的接口请求
    roomManage() {
        return this
            .request<IRoomManageResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs?token=' + sessionStorage.getItem('token')
                return this.http.get<IRoomManageResponse>(url, {
                    params: {
                    }
                })
            })
    }

    getRoominfoById(id){
        return this.request<IGetRoominfoByIdResponse>(()=>{
            let url=global.API_PATH+'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs/' + id + '?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetRoominfoByIdResponse>(url,{})
        })
    }
    getAlias(id){
        return this.request<IGetAliasResponse>(()=>{
            let url=global.API_PATH+'/v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs/' + id + '/alias?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetAliasResponse>(url,{})
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
    getRoominfoByNum(num){
        return this.request<IGetRoominfoByIdResponse>(()=>{
            let url=global.API_PATH+'v1/orgs/' + sessionStorage.getItem('orgId') +  '/meetingRoomNum/' + num + '?token=' + sessionStorage.getItem('token')
            return this.http.get<IGetRoominfoByIdResponse>(url,{})
        })
    }
    //提交编辑会议室信息
    submitRoomInfo(id,data){
        return this.request<ISubmitRoominfoByIdResponse>(()=>{
            let url=global.API_PATH+'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs/' + id + '?token=' +sessionStorage.getItem('token')
            return this.http.put<ISubmitRoominfoByIdResponse>(url,data)
        })
    }

    //会议管理页面的接口请求
    getMeetingManage() {
        return this
            .request<IMeetingManageResponse>(() => {
                let contentType: "application/json"
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetings?token=' + sessionStorage.getItem('token')
                return this.http.get<IMeetingManageResponse>(url, {
                    params: {}
                })
            })
    }

    deleteMeeting(meetingId) {
        return this.request<IDeleteMeetingResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetings/' + meetingId + '?token=' + sessionStorage.getItem('token')
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
    getNewMeeting(sendemail, data) {
        return this.request<IGetNewMeetingResponse>(() => {
            let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/meetings?token=' + sessionStorage.getItem('token') + '&flag=' + sendemail;
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

    editDevices(id,data) {
        return this
            .request<IDevicesResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/devices/'+id+'?token=' + sessionStorage.getItem('token')
                return this.http.put<IDevicesResponse>(url, data)
            })
    }

    //硬件管理页面的接口请求


    //用户账号页面的接口请求
    userAccount() {
        return this
            .request<IUserAccountResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/users?token=' + sessionStorage.getItem('token')
                return this.http.get<IUserAccountResponse>(url, {
                    params: {}
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
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/team/'+id+'?token=' + sessionStorage.getItem('token');
                return this.http.delete<IGetTeamsResponse>(url, {})
            })
    }

    deletePerson(id) {
        return this
            .request<IGetTeamsResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/person/'+id+'?token=' + sessionStorage.getItem('token');
                return this.http.delete<IGetTeamsResponse>(url, {})
            })
    }



    // 获取直播活动列表的接口请求
    getLiveList(liveName, pageSize, pageNum) {
        return this
            .request<ILiveListResponse>(() => {
                let url = global.API_PATH + 'v1/streaming/' + sessionStorage.getItem('orgId') + '/liveList?token=' + sessionStorage.getItem('token')
                return this.http.post<ILiveListResponse>(url, {
                    'name': liveName,
                    'pageNum': pageNum,
                    'count': pageSize
                })
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

    // 根据机构ID获取客户会议室列表
    getRoomListByOrgID() {
        return this
            .request<IRoomListResponse>(() => {
                let url = global.API_PATH + 'v1/orgs/' + sessionStorage.getItem('orgId') + '/vmrs?token=' + sessionStorage.getItem('token') + '&org_id=' + sessionStorage.getItem('orgId')
                return this.http.get<IRoomListResponse>(url, {
                    params: {}
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

    // 上传图片
    uploadPic(picFileForm) {
        $.ajax({
            type: 'post',
            url: global.API_PATH + 'v1/streaming/live/uploadPic?orgId=' + sessionStorage.getItem('orgId') + '&token=' + sessionStorage.getItem('token'),
            processData: false,
            contentType: false,
            data: picFileForm,
            success: function (response) {
                let resCode = response.code;
                if (resCode === "0") {
                    sessionStorage.setItem('updImgURL', response.data.picUrl);
                } else {
                    alert('图片上传失败');
                }
            },
            error: function () {
                alert('图片上传失败');
            }
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
}
export let name = 'app.remote';
angular.module(name, [])
    .service('RemoteService', RemoteService);