import {Page, IPageParams, page} from '../../../../../common/page';
import {global} from '../../../../../common/global';
import * as wangEditor from  '../../../../../../node_modules/wangeditor/dist/js/wangEditor.js'
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomInformationContentPageParams extends IPageParams {
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
    name: 'main.custom-information.content'
})

class MainCustom_InformationContentPage extends Page<ICustomInformationContentPageParams> {
    informationContent = "";
    visible = false;//新增内容弹框
    visible1 = false;//编辑内容弹框
    allContents;//列表中的所有信息
    selectedId; //选中的id
    add = {titleLength:"",abstractLength: ""};
    edit = {titleLength:"",abstractLength: ""};
    sort="";//顺序
    inputTitle = ""; //标题
    queryTitle = ""; //查询时输入的标题
    abstracts = ""; //摘要
    fileType = "";
    imageUrl = global.IMG_API_PATH;
    documentName; //文档名字
    documentUrl;//文档地址
    linkUrl;//链接地址
    videoUrl; //视频库地址
    contentUrl = ""; //视频地址或者文档地址
    videoId = ""; //上传的视频ID
    graphicContent = ""; //图文内容
    coverImage;
    selectedType;
    linkAddress = true;//默认选择连接地址
    videoAddress = false; //从视频库中选择
    groupList = [];//视频库分组
    currentIndex = 0;//当前所在的索引
    currentGroup;//当前所在分组
    videoListAll = []; //当前分组中的所有视频
    videoList = [];//当前分组的转码视频
    chooseVideo; //在视频库中选中的视频
    addVideoName; //新增视频从视频库中选中的某个视频的videoname
    content = "";//发送的图文或者链接内容

    init(timeout: angular.ITimeoutService) {
        // 初始化对象变量
        this.getEnterpriseInfo();
        //新增弹框中的富文本编辑器
        var editor = new wangEditor("editor");
        editor.config.menus = [
            'img',
            'fullscreen'
        ];
        editor.config.pasteFilter = false;
        editor.config.uploadImgUrl = `${global.API_PATH}/v1/admin/common/wangEditor2Upload`;
        editor.config.uploadImgFileName = 'file';
        // 配置自定义参数（举例）
        editor.config.uploadParams = {
            token: sessionStorage.getItem('token'),
            businessId: sessionStorage.getItem('accountId'),
            businessType: 'enterpriseInfo'
        };
        // 设置 headers（举例）
        editor.config.uploadHeaders = {
            'Accept' : 'text/x-json'
        };
        editor.create()

        //编辑页面的富文本框
        var editor1 = new wangEditor("editor1");
        editor1.config.menus = [
            'img',
            'fullscreen'
        ];
        editor.config.pasteText = true
        editor1.config.pasteFilter = false;
        editor1.config.uploadImgUrl = `${global.API_PATH}/v1/admin/common/wangEditor2Upload`;
        editor1.config.uploadImgFileName = 'file';
        // 配置自定义参数（举例）
        editor1.config.uploadParams = {
            token: sessionStorage.getItem('token'),
            businessId: sessionStorage.getItem('accountId'),
            businessType: 'enterpriseInfo'
        };
        // 设置 headers（举例）
        editor1.config.uploadHeaders = {
            'Accept' : 'text/x-json'
        };
        editor1.create();

        var self =  this;
        $('#inputTitle').bind('input propertychange', function() {
            var textObj = $(this);
            var text = textObj.val();
            self.add.titleLength = text.length;
            self.scope.$apply();
        });
        //编辑内容标题输入数字
        $('#abstract').bind('input propertychange', function() {
            var textObj = $(this);
            var text = textObj.val();
            self.add.abstractLength = text.length;
            self.scope.$apply();
        });
        $('#inputTitle1').bind('input propertychange', function() {
            var textObj = $(this);
            var text = textObj.val();
            self.edit.titleLength = text.length;
            self.scope.$apply();
        });
        //编辑内容标题输入数字
        $('#abstract1').bind('input propertychange', function() {
            var textObj = $(this);
            var text = textObj.val();
            self.edit.abstractLength = text.length;
            self.scope.$apply();
        });
    }
    // 获取和查询企业信息栏的内容
    getEnterpriseInfo() {
        this.remote.getEnterpriseInfo(this.queryTitle,"")
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.allContents= res.data['data'];
                        // 获取定制化信息
                        // 判断是否有新版本

                        // 判断是否正在发布中
                    }
                }
            })
            .catch(error => {
                this.rootScope.toggleInfoModal(4, error.toString())
            })
    }
    chooseFile(name){
        $('#'+name).trigger('click');
    }
    addListenerfileChange(name) {
        $('#'+name).off('change').on('change', (event) => {
            let file = event.target.files[0];
            if (!file) {
                return false;
            }
            // 上传图片
            let picFileForm = new FormData(),
                accountId = sessionStorage.getItem('accountId');

            picFileForm.append('file', file);
            this.remote.customUploadPicture(accountId, picFileForm)
                .then(response => {
                    if (response.data['code'] === '0') {
                        if(name == 'J-information-input-file'){
                            this.coverImage = response.data['data'].filePath;
                        }
                        if(name == 'J-information-input-PDF'){
                            this.documentName = file.name;
                            this.documentUrl = response.data['data'].filePath;
                        }
                        $('#' + name).val('');
                    }
                }).catch(error => {
                this.rootScope.toggleInfoModal(4, error.data.responseText);
            })
        })
    }

    //新增企业信息栏内容
    newBuilding(){
        this.visible = true;
    //    清空内容
        this.sort = "";
        this.inputTitle = "";
        this.abstracts = "";
        this.coverImage = "";
        this.selectedType = "";
        this.documentName = "";
        this.graphicContent = "";
        this.linkAddress = true;
        this.videoAddress = false;
        this.chooseVideo = {};
        this.linkUrl = "";
        this.videoUrl = "";
        this.addVideoName = "";
        $("#inputTitle").val("");
        $("#abstract").val("");
        this.add = {};
        $("#editor").html('<p><br></p>')
    }
    //保存新增的企业信息栏内容
    saveInforamtion(){
        switch (this.selectedType){
            case "1":{
                this.contentUrl = this.documentUrl;
                this.content = this.documentName;
                break;
            }
            case "2":{
                if(this.linkAddress){
                    this.contentUrl = this.linkUrl;
                    this.videoId = "";
                    break;
                }else{
                    this.contentUrl = this.videoUrl;
                    break;
                }

            }
            case "3":{
                this.graphicContent = $("#editor").html();
                this.content = this.graphicContent;
            }
        }
        if(!(this.sort+'')||(this.sort+'').indexOf('-')>0){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_ORDER'));
            return false;
        }
        if(!this.inputTitle){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_TITLE'));
            return false;
        }
        if(!this.abstracts){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP36'));
            return false;
        }
        if(!this.coverImage){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP37'));
            return false;
        }
        if(!this.selectedType){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP38'));
            return false;
        }
        if(this.selectedType==1&&!this.contentUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP39'));
            return false;
        }
        if(this.selectedType==2&&this.linkAddress&&!this.linkUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_ADDRESS'));
            return false;
        }
        if(this.selectedType==2&&this.linkAddress&&this.linkUrl){
            let type1 = this.linkUrl.substring(this.linkUrl.length-4,this.linkUrl.length);
            let type2 = this.linkUrl.substring(this.linkUrl.length-5,this.linkUrl.length);
            if(type1 != '.mp4' && type2 != '.m3u8'){
                this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP40'));
                return false;
            }
        }
        if(this.selectedType==2&&this.videoAddress&&!this.videoUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP41'));
            return false;
        }
        if(this.selectedType==3&&!$("#editor").text()&&$("#editor").html().indexOf('<img')== -1){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP42'));
            return false;
        }
        else{
            let requestParam = {
                sort: this.sort,
                title: $("#inputTitle").val(),
                abstracts:$("#abstract").val(),
                coverUrl: this.coverImage,
                contentType: this.selectedType,
                contentUrl: this.contentUrl,
                videoId: this.videoId,
                content: this.content,
            };

            this.remote.updInformationCustomized(requestParam)
                .then(response => {
                    if (response.data['code'] === '0') {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS15'));
                        this.getEnterpriseInfo();
                    } else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP20'));
                    }
                    this.visible = false;
                })
                .catch(error => {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP20'));
                })
        }
        };


    //编辑企业信息栏内容
    editContent(id){
        this.remote.getEnterpriseInfo("",id)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        let data= res.data['data'];
                        switch (data.contentType){
                            case 1:{
                                this.documentUrl=data.contentUrl
                                if(this.documentUrl){
                                    this.documentName = data.content;
                                }
                                break;
                            }
                            case 2:{
                                if(data.videoId){
                                    this.videoId = data.videoId;
                                    this.videoAddress = true;
                                    this.linkAddress =  false;
                                    this.videoUrl = data.contentUrl;
                                    this.addVideoName = data.videoName;
                                    this.linkUrl = "";
                                    break;
                                }
                                else{
                                    this.videoAddress = false;
                                    this.linkAddress =  true;
                                    this.linkUrl = data.contentUrl;
                                    this.videoUrl = "";
                                    this.addVideoName = "";
                                    break;
                                }
                            }
                            case 3:{
                                $("#editor1").html(data.content)
                            }
                        }
                        this.visible1 = true;
                        this.selectedId = data.id;
                        this.sort = data.sort;
                        this.inputTitle = data.title;
                        this.abstracts = data.abstracts;
                        this.coverImage = data.coverUrl;
                        this.selectedType = data.contentType.toString();
                        this.graphicContent = data.content;
                    }
                }
            })


    }

    // 保存修改的企业信息栏内容
    saveEditContent(){
        switch (this.selectedType){
            case "1":{
                this.contentUrl = this.documentUrl;
                this.content = this.documentName;
                break;
            }
            case "2":{
                if(this.linkAddress){
                    this.contentUrl = this.linkUrl;
                    this.videoId = "";
                    break;
                }else{
                    this.contentUrl = this.videoUrl;
                    break;
                }
            }
            case "3":{
                this.graphicContent = $("#editor1").html();
                this.content = this.graphicContent;
                console.log(this.graphicContent)
            }
        }
        if(!(this.sort+'')||(this.sort+'').indexOf('-')>0){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_ORDER'));
            return false;
        }
        if(!this.inputTitle){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_TITLE'));
            return false;
        }
        if(!this.abstracts){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP36'));
            return false;
        }
        if(!this.coverImage){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP37'));
            return false;
        }
        if(this.selectedType==1&&!this.contentUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP39'));
            return false;
        }
        if(this.selectedType==2&&this.linkAddress&&!this.linkUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_INPUT_ADDRESS'));
            return false;
        }
        if(this.selectedType==2&&this.linkAddress&&this.linkUrl){
            let type1 = this.linkUrl.substring(this.linkUrl.length-4,this.linkUrl.length);
            let type2 = this.linkUrl.substring(this.linkUrl.length-5,this.linkUrl.length);
            if(type1 != '.mp4' && type2 != '.m3u8'){
                this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP40'));
                return false;
            }
        }
        if(this.selectedType==2&&this.videoAddress&&!this.videoUrl){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP41'));
            return false;
        }
        if(this.selectedType==3&&!$("#editor1").text()&&$("#editor1").html().indexOf('<img')== -1){
            this.rootScope.toggleInfoModal(3,this.translate.instant('ADMIN_WARN_TIP42'));
            return false;
        }
        else{
            let requestParam = {
                id: this.selectedId,
                sort: this.sort,
                title: $("#inputTitle1").val(),
                abstracts:$("#abstract1").val(),
                coverUrl: this.coverImage,
                contentType: this.selectedType,
                contentUrl: this.contentUrl,
                videoId: this.videoId,
                content: this.content
            }

            this.remote.saveEditContent(requestParam)
                .then(response => {
                    if (response.data['code'] === '0') {
                        this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS4'));
                        this.getEnterpriseInfo();
                    } else {
                        this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP18'));
                    }
                    this.visible1 = false;
                })
                .catch(error => {
                    this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP18'));
                })
        }

    }

    //删除企业信息栏内容
    deleteContent (id){
        this.selectedId = id;
    }

    //确定删除某个企业信息栏
    sureDelete (){
        this.remote.sureDeleteInformation(this.selectedId)
        .then(response => {
            if (response.data['code'] === '0') {
                $('#deleteModal').modal('hide');
                this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS1'));
                this.getEnterpriseInfo();
            } else {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP19'));
            }
        })
        .catch(error => {
            this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP19'));
        })

    }

    //从视频库中选择文件
    //获取视频库分组列表
    getGroupList(){
        let language
        if(localStorage.getItem('lang')=="en-us"){
            language='en';
        }else{
            language = "";
        }
        this.chooseVideo = {};
        this.remote.getGroupList(language)
            .then((res)=> {
                if (res.status === 200) {
                    if (res.data['code'] === '0') {
                        this.groupList= res.data['data'];
                        this.groupList.forEach(function (item) {
                            item.videoList=item.videoList.filter(function (val) {
                                return val.transcodeStatus == 1
                            })
                        })
                    }
                }
            })
    }
    //当前所在的分组
    chooseGroup(index,item){
        this.currentIndex = index;
        this.currentGroup = item;
        if(item.videoList){
            this.videoList = item.videoList.filter(function (value) {
                return value.transcodeStatus == 1;
            });
        }

    }
    //从视频库中选中某个视频
    choosedVideo(video, index) {
    this.chooseVideo = {
        id: video.id,
        videoUrl: video.sourceVideoUrl,
        sourceVideoUrl: video.sourceVideoUrl,
        videoName: video.videoName,
        index: index
        };
    }
    //确定选中某个视频
    confirmChoose() {
        this.videoUrl = this.chooseVideo.sourceVideoUrl;
        this.videoId = this.chooseVideo.id;
        this.addVideoName = this.chooseVideo.videoName;
        $('#contentChoseVideoModal').modal('hide');
    }

    cancel () {
        this.visible = false;
        this.visible1 = false;
    }

}
