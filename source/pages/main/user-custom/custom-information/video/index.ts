import {Page, IPageParams, page} from '../../../../../common/page';
import {global} from '../../../../../common/global';
import '../../../../../../node_modules/ng-file-upload'
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomInformationVideoPageParams extends IPageParams {
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
    name: 'main.custom-information.video'
})

class MainCustom_InformationVideoPage extends Page<ICustomInformationVideoPageParams> {
    newlyGroup = false;
    visible = false;
    isAllSelect = false;//是否全选
    isDetailGroup = false;//是否选中了某个具体的分组
    currentIndex = 0;//当前所在的索引
    currentGroup;//当前所在分组
    fileType;//上传的文件类型
    imageUrl = global.IMG_API_PATH;
    uploadVideo = {}; //上传的视频
    inputVideoName; //输入的视频名称
    groupName = "";//添加分组时输入的分组名称
    selectedGroup //选中的分组名称
    videoUrl; //上传的视频的地址
    groupList = [];//视频库分组
    videoGroup = [];//视频分组
    videoList = [];//当前分组的所有视频
    itemVideo;//当前编辑的视频
    currentPlayVideo ={};//当前播放的视频
    modifyName;//修改后的视频名称
    newGroupName;//修改后的分组名称
    videoIds=[];//需要移动分组的id
    upload;
    init(timeout: angular.ITimeoutService) {
        // 初始化对象变量
        this.getGroupList();
        this.addListenerfileChange();
    }

    //获取视频库分组列表
    getGroupList(){
        let language
        if(localStorage.getItem('lang')=="en-us"){
            language='en';
        }else{
            language = "";
        }
        this.remote.getGroupList(language)
            .then((res)=> {
                if (res.status === 200) {
                    // this.currentIndex = 0;
                    // this.isDetailGroup = false;
                    if (res.data['code'] === '0') {
                        this.groupList= res.data['data'];
                        this.currentGroup = this.groupList[this.currentIndex];
                        this.videoList = this.groupList[this.currentIndex].videoList;
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString())
            })
    }

    //当前所在的分组
    chooseGroup(index,item){
        this.newlyGroup = false;
        this.currentIndex = index;
        this.currentGroup = item;
        this.videoList = item.videoList;
        this.isAllSelect = true;
        this.isSelectAll();
        if(!item.id){
            this.isDetailGroup = false;
        }
        else{
            this.isDetailGroup = true;
        }
    }

    //获取视频分组列表
    getVideoGroups(){
        this.remote.getVideoGroups()
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.videoGroup= res.data['data'];
                    }
                }
            })
    }


    // 本地上传视频弹框
    localUpload(){
        this.visible = true;
        this.videoUrl = "";
        this.uploadVideo = {};
        this.inputVideoName = "";
        this.selectedGroup =  "";
        this.getVideoGroups();
    }

    //保存上传的本地视频
    saveLocalVideo(){
        let requestParams={
            videoName: this.inputVideoName,
            videoGroupId: this.selectedGroup?this.selectedGroup:0,
            videoUrl: this.videoUrl,
            accountId: sessionStorage.getItem('accountId'),
        }
        if(!this.videoUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP41'));
            return false;
        }
        if(!this.inputVideoName){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_VIDEO_NAME'));
            return false;
        }
        else{
            this.visible =  false;
            this.remote.saveLocalVideo(requestParams)
                .then((res)=> {
                    if (res.status === 200) {
                        if (res.data['code'] === '0') {
                            this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS16'))
                            this.videoGroup= res.data['data'];
                            this.getGroupList();
                        }
                    }
                })
                .catch(error => {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP36'))
                })
        }

    }

    //全选
    isSelectAll(){
        if(!this.isAllSelect&&this.videoList){
            this.videoList.forEach(function (item,index) {
                item.isSelect = 1;
            })
        }
        else if(this.isAllSelect&&this.videoList){
            this.videoList.forEach(function (item, index) {
                item.isSelect = 0;
            })
        }
        this.isAllSelect = !this.isAllSelect
    }

    // 点击列表每一项 对其判断是否是全选或非全选状态
    isAllSelectOfItemClick (item) {
        item.isSelect = item.isSelect ^ 1;
        for (var i = 0; i < this.videoList.length; i++) {
            if (!this.videoList[i].isSelect) {
                this.isAllSelect = false;
                return false;
            }
        }
        this.isAllSelect = true;
    }

    //重命名分组名称
    renameGroup(item){
        this.newGroupName = item.name;
    }
    //保存修改的分组名称
    sureRename(){
        if(!this.newGroupName){
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP43'));
            // $('#renameGroupModal').modal('hide');
            return false;
        }
        let requestParams={
            id: this.currentGroup.id,
            name: this.newGroupName,

        }
        this.remote.renameGroup(requestParams)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        $('#renameGroupModal').modal('hide');
                        this.getGroupList();
                        this.isAllSelect = true;
                        this.isSelectAll();
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_MODIFY_FAIL'))
            })
    }

    //删除分组
    deleteGroup(){
        this.remote.deleteVideoGroup(this.currentGroup.id)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.currentIndex = 0;
                        this.isDetailGroup = false;
                        $('#deleteGroupModal').modal('hide');
                        this.getGroupList();
                        this.isAllSelect = true;
                        this.isSelectAll();
                    }
                }
            })
            // .catch(error => {
            //     this.rootScope.toggleInfoModal(4, error.toString())
            // })
    }

    //编辑视频名称弹框
    editVideo(item){
        this.itemVideo = item;
        this.modifyName = item.videoName;
    }

    //保存修改的视频名称
    sureModify(){
        if(!this.modifyName){
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP44'));
            return false;
        }
        let requestParams={
            id: this.itemVideo.id,
            videoName: this.modifyName
        }
        this.remote.modifyVideoName(requestParams)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        $('#editVideoModal').modal('hide');
                        this.getGroupList();
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_MODIFY_FAIL'))
            })
    }

    //移动分组弹框
    moveVideo(item){
        this.videoIds = [];
        if(item){
            this.videoIds.push(item.id);
            if(item.videoGroupId){
                this.selectedGroup = item.videoGroupId;
            }else{
                this.selectedGroup = "";
            }
        }else{
            for(var i=0;i<this.videoList.length;i++){
                if(this.videoList[i].isSelect ==1){
                    this.videoIds.push(this.videoList[i].id)
                    if(this.videoList[i].videoGroupId==0){
                        this.selectedGroup = "";
                    }else{
                        this.selectedGroup =this.videoList[i].videoGroupId;
                    }
                }
            }
            if(this.currentIndex == 0&&this.videoIds.length>1){
                this.selectedGroup = "";
            }
            if(this.videoIds.length>0){
                $('#moveVideoModal').modal();
            }else{
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP45'));
                return ;
            }
        }
        this.getVideoGroups();
        // this.selectedGroup = "";
    }
    //保存修改的分组
    sureMove(){
        this.isAllSelect = true;
        this.isSelectAll();
        if(!this.selectedGroup){
            this.selectedGroup = 0;//未分组
        }
        this.remote.moveGroup(this.videoIds,this.selectedGroup)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS17'))
                        this.getGroupList();
                    }
                }
                $('#moveVideoModal').modal('hide');
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_MOVE_FAIL'))
            })
    }

    //删除视频弹框
    deleteVideo(id){
        this.videoIds = [];
        if(id){
            this.videoIds.push(id);
        }else{
            for(var i=0;i<this.videoList.length;i++){
                if(this.videoList[i].isSelect ==1){
                    this.videoIds.push(this.videoList[i].id)
                }
            }
            if(this.videoIds.length>0){
                $('#deleteVideoModal').modal();
            }else{
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_WARN_TIP46'));
                return ;
            }
        }
    }

    //确定删除视频
    sureDelete(){
        this.remote.sureDeleteVideo(this.videoIds)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.getGroupList();
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS1'));
                        this.isAllSelect = true;
                        this.isSelectAll();
                    }
                }
                $('#deleteVideoModal').modal('hide');
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP19'))
            })
    }


    // 新建分组弹框
    newGroup(){
        this.groupName = "";
        this.newlyGroup = true;
    }

    //确定添加分组
    addGroup(){
        if(!this.groupName){
            this.rootScope.toggleInfoModal(3, this.translate.instant('ADMIN_WARN_TIP43'));
            return false;
        }
        let requestParam = {
            name:this.groupName
        }
        this.remote.addVideoGroup(requestParam)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.currentIndex = 0;
                        this.isDetailGroup = false;
                        this.getGroupList();
                    }
                }
                this.newlyGroup = false;
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP20'))
            })

    }

    chooseFile(imgType){
        var self = this
        if(this.upload){
            this.stopUpload();
            setTimeout(function () {
                self.uploadVideo.progress = 0;
                self.uploadVideo.isShow = false;
            },500)
        }
        self.uploadVideo.isShow = false;
        $("#J-information-input-video").val("");
        this.fileType = imgType;
        $('#J-information-input-video').trigger('click');
        this.videoUrl = "";
        this.uploadVideo.progress = 0;
        this.uploadVideo.name = "";
    }

    addListenerfileChange() {
        var self = this;
        $('#J-information-input-video').off('change').on('change', (event) => {
            let file = event.target.files[0];
            if (!file) {
                return false;
            }
            self.uploadVideo.name = file.name;
            // this.uploadVideo.filename = file.name;
            self.uploadVideo.load = 0;
            self.uploadVideo.total = parseInt(file.size/1024/1000);
            // 上传图片
            let picFileForm = new FormData(),
                accountId = sessionStorage.getItem('accountId'),
                token = sessionStorage.getItem('token'),
                uploadUrl = global.API_PATH+'v1/admin/common/upload?token='+token+'&businessId='+accountId+'&businessType=enterpriseInfo',
                ot = new Date().getTime(),//上传开始时间
                oloaded = 0; //已经上传的文件大小
            picFileForm.append('file', file);
            this.upload = this.Upload.upload({
                url: uploadUrl,
                method: 'POST',
                file:file,
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
                }).progress(function (evt) {
                let speed,
                    bspeed,
                    resttime,
                    units,
                    perload,
                    progressPercentage = parseInt(100 * evt.loaded / evt.total),
                    nt = new Date().getTime(),
                    pertime = (nt-ot)/1000;
                    ot = new Date().getTime();
                    self.uploadVideo.isShow = true;
                    self.uploadVideo.load = parseInt(evt.loaded/(1024*1000));
                    self.uploadVideo.progress = progressPercentage;
                    if(evt.loaded < evt.total){
                        perload = evt.loaded - oloaded; //计算该分段上传的文件大小，单位b
                        oloaded = evt.loaded;//重新赋值已上传文件大小，用以下次计算
                        if(perload != 0) {
                            speed = perload/pertime;//单位b/s
                            bspeed = speed;
                            units = 'b/s';//单位名称
                            if(speed/1024>1){
                                speed = speed/1024;
                                units = 'k/s';
                            }
                            if(speed/1024>1){
                                speed = speed/1024;
                                units = 'M/s';
                            }
                            speed = speed.toFixed(1);
                            //剩余时间
                            if(evt.loaded != evt.total) {
                                resttime = ((evt.total-evt.loaded)/bspeed).toFixed(1);
                                self.uploadVideo.speed = speed;
                                self.uploadVideo.units = units;
                                self.uploadVideo.resttime = resttime;
                            }
                        }
                    }
                //上传完毕
                if(evt.loaded == evt.total) {
                    self.uploadVideo.speed = 0;
                    self.uploadVideo.resttime = 0;
                }

            }).success(function (res) {
                if(res.code === '0'){
                    self.videoUrl = res.data.filePath;
                    $("#J-information-input-video").val("");
                }
            }).error(function () {
            })
        })
            // this.remote.customUploadVideo(accountId, picFileForm)
            //     .then(response => {
            //         if (response.data['code'] === '0') {
            //             this.rootScope.toggleInfoModal(1, '上传成功');
            //             this[this.fileType] = response.data['data'].filePath;
            //             this.videoName = file.name;
            //
            //         } else {
            //             this.rootScope.toggleInfoModal(4, response.data['message']);
            //         }
            //     }).catch(error => {
            //     this.rootScope.toggleInfoModal(4, error.data.responseText);
            // })
        // })
    }

    //停止上传视频
    stopUpload(){
        this.upload.abort();
    }

    //播放视频
    playVideo(item){
        $('#videoPlayModal').modal();
        this.currentPlayVideo.name =  item.videoName;
        this.currentPlayVideo.videoUrl = this.imageUrl+ item.sourceVideoUrl;
    }
    //停止视频播放
    stopVideo(){
        let myVideo = $("#video");
        myVideo.trigger('pause')
    }

    //关闭新建分组弹框
    cancel(){
        this.newlyGroup = false;
        this.visible = false;
    }

    signout() {
        this.rootScope.signout()
    }
}
