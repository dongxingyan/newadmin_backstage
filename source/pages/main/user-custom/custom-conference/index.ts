import { Page, IPageParams, page } from '../../../../common/page';
import {global} from '../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ICustomConferencePageParams extends IPageParams {
  page: string;
  id;
}

@page({
  // 模板
  template: require('./tmpl.html'),
  // 路由参数，写在这里，可以从this.params中获取。
  params: ['id'],
  // 依赖注入，在init函数的参数表中可以获取。
  requires: ['$timeout'],
  // 这一页的标题
  title: '机构管理系统',
  name: 'main.custom-conference'
})

class MainCustom_ConferencePage extends Page<ICustomConferencePageParams> {
  imgUrl = this.global.IMG_API_PATH;
  imgType: '';
  updateForm: {
    id: '',
    backgroundLogo: '',     // 背景LOGO
    startPageUrl: '',     // 启动等待图
    backgroundUrl: '',  // 默认背景图
    leftCallUrl: ''  // 左侧呼叫图
  };

  init(timeout: angular.ITimeoutService) {
    this.getConferenceInfo();
    this.addListenerFileChange();
  }

  // 获取会议相关信息
  getConferenceInfo () {
    this.remote.getConferenceListInfo()
        .then((res)=> {
          if (res.status === 200) {
            if (res.data.code === '0') {
              let resData = res.data.data;
              this.updateForm = {
                id: resData.id,
                backgroundLogo: resData.backgroundLogo,
                backgroundUrl: resData.backgroundUrl,
                startPageUrl: resData.startPageUrl,
                leftCallUrl: resData.leftCallUrl
              }
            } else {
              this.rootScope.toggleInfoModal(4, res.data.message);
            }
          }
        })
        .catch(error => {
          this.rootScope.toggleInfoModal(4, error.toString())
        })
  }
  // 退出登录
  signout() {
    this.rootScope.signout()
  }
  // 点击 上传图片按钮
  uploadClick (type) {
    this.imgType = type;
    // 弹出文件上传对话框
    $('#J-conference-upload').trigger('click');
  }
  // 监听 上传图片change事件
  addListenerFileChange () {
    let self = this;
    $('#J-conference-upload').off('change').on('change', function (event) {
      self.uploadImg(event);
    })
  }
  // 上传图片
  uploadImg (event) {
    let files = event.target.files[0],
        accountId = sessionStorage.getItem('accountId'),
        formData = new FormData();

    formData.append('file', files);
    this.remote.customUploadPicture(accountId, formData)
    .then((res)=> {
        if (res.status === 200) {
          if (res.data.code === '0') {
            this.rootScope.toggleInfoModal(1, '上传成功');
            this.previewImg(res.data.data.filePath);
          } else {
            this.rootScope.toggleInfoModal(4, '上传失败，请稍后重试');
          }
        }
      })
        .catch(error => {
          this.rootScope.toggleInfoModal(4, error.toString())
        })
  }
  // 显示图片
  previewImg (filePath) {
    let imgType = this.imgType;
    this.updateForm[imgType] = filePath;
  }
  // 修改保存
  conferenceSave () {
    let requestData = this.updateForm;
    this.remote.updateConferenceInfo(requestData)
        .then((res)=> {
          if (res.status === 200) {
            if (res.data.code === '0') {
              this.rootScope.toggleInfoModal(1, '修改成功');
            } else {
              this.rootScope.toggleInfoModal(1, '修改失败，请稍后重试');
            }
          }
        })
        .catch(error => {
          this.rootScope.toggleInfoModal(4, error.toString())
        })
  }
}
