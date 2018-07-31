import { Page, IPageParams, page } from '../../../../../common/page';
import {global} from '../../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IScreenPageParams extends IPageParams {
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
  title: '机构管理系统',
  name: 'main.custom-hardware.screen'
})

class MainHardware_ScreenPage extends Page<IScreenPageParams> {
  isEditStatus = false;
  tofuInfoList = [];
  realTofuInfoList = []; // 记录没保存的，真实的图片数组
  logoUrl = '';
  add;
  edit;
  logo;
  filePath = global.IMG_API_PATH;

  init(timeout: angular.ITimeoutService) {
    this.initVariableOfObj();
    this.getTofuInfoList();
    this.uploadFile();
  }

  initVariableOfObj () {
    this.add = {
      tofuInfo: '',
      isShowOfTofuSelect: false,
      tofuList: [],
      isShowErrorTip: false,
      errorText: ''
    };
    this.edit = {
      tofuInfoList: [],
      deleteId: [],
      originOfDrag: {},
      destinationOfDrag: {}
    };
    this.logo = {
      url: ''
    }
  }
  // 获取首屏豆腐块列表
  getTofuInfoList () {
    this.remote.getTofuListOfScreen()
      .then(res => {
        let response = res.data;
        if (response.code === '0') {
          let logoUrl = response.data.accountGroup.logoUrl,
              tofuList = response.data.beanCurdCubeScreenList;
          this.realTofuInfoList = tofuList; // 真实数据temp
          this.tofuInfoList = tofuList;
          this.edit.tofuInfoList = tofuList.concat();
          this.logoUrl = logoUrl;
          this.logo.url = logoUrl;
        } else {
          this.rootScope.toggleInfoModal(4, '获取数据失败,请稍后重试')
        }
      })
  }
  // 新增豆腐块 模态框弹出 获取tofu列表
  getAllTofuList () {
    this.add.tofuInfo = {};
    this.add.isShowOfTofuSelect = false;
    this.add.isShowErrorTip = false;
    this.add.errorText = '';

    this.remote.getAllTofuList()
      .then(res => {
        if (res.data.code === '0') {
          let response = res.data.data;
          this.add.tofuList = response;
        }
      })
  }
  // 新增豆腐块 input输入框点击事件
  inputClickOfCreate () {
    let isShowOfTofuSelect = this.add.isShowOfTofuSelect;
    if (!isShowOfTofuSelect) {
      this.add.tofuInfo = {};
    }
    this.add.isShowOfTofuSelect = !isShowOfTofuSelect;
  }
  /* 新增豆腐块 select点击事件 */
  selectTofu (tofu) {
    this.add.tofuInfo = tofu;
    this.add.isShowOfTofuSelect = false;

    this.remote.getDetailsOfTofu({ tofuId: tofu.id})
      .then(res => {
        if (res.data.code === '0') {
          let response = res.data.data;
          this.add.tofuInfo = response.beanCurdCube;
          this.add.tofuInfo.beanCurdCubeName = response.beanCurdCube.name;
          this.add.tofuInfo.detailList = response.beanCurdCubeDtails;
        }
      })
  }
  // 保存 添加的豆腐块
  saveOfAddTofu () {
    let tofuInfo = this.add.tofuInfo;
    tofuInfo.isAdd = true;

    if (!tofuInfo.id || tofuInfo.id == '0') {
      this.add.isShowErrorTip = true;
      this.add.errorText = '请选择豆腐块';
      return false;
    }

    $('#importTofuModal').modal('hide');
    this.edit.tofuInfoList.push(tofuInfo);
  }
  // 删除 豆腐块
  deleteTofu (tofu, index) {
    if (!tofu.isAdd) {
      this.edit.deleteId.push(tofu.id)
    }
    this.edit.tofuInfoList.splice(index, 1)
  }
  // 新建版本 选择文件
  selectFile () {
    $('#J-logo-upload').trigger('click');
  }
  // 新建版本 上传文件
  uploadFile () {
    $('#J-logo-upload').off('change').on('change', (event) => {
      let file = event.target.files[0],
          fileName = file.name,
          fileNameArr = fileName.split('.'),
          formData = new FormData();

      formData.append('file', event.target.files[0]);

      this.remote.uploadFileOfHardware('screen', formData)
        .then(res => {
          if (res.data.code === '0') {
            this.logo.url = res.data.data.filePath;
          }
        })
    })
  }
  // 取消编辑
  editCancel () {
    this.isEditStatus = false;
    this.edit.deleteId = [];
    this.edit.originOfDrag = {};
    this.edit.destinationOfDrag = {};
    this.logo.url = this.logoUrl;
    this.edit.tofuInfoList = this.tofuInfoList;
  }
  // 拖动开始时触发的事件
  dragStart (tofu, index) {
    this.edit.originOfDrag = {
      index: index,
      tofuInfo: tofu
    }
  }
  // 拖动结束时触发的事件
  dragDrop (tofu, index) {
    let tofuInfoList = this.edit.tofuInfoList,
        indexOfOrigin = this.edit.originOfDrag.index,
        infoOfOrigin = this.edit.originOfDrag.tofuInfo;

    tofuInfoList[indexOfOrigin] = tofu;
    tofuInfoList[index] = infoOfOrigin;
  }
  // 编辑取消
  editTofuCancel() {
    console.log(this.tofuInfoList);
    console.log(this.realTofuInfoList);
      this.edit.tofuInfoList = this.realTofuInfoList;
      this.isEditStatus=false
  }
  // 保存修改后的豆腐块列表
  saveEditOfTofuList () {
    let tofuList = this.edit.tofuInfoList,
        deleteId = this.edit.deleteId,
        beanCurdCubeScreenList = [],
        itemOfTofu = {};

    tofuList.forEach(function (item, index) {
      if (!item.isAdd) {
        itemOfTofu.id = item.id;
        itemOfTofu.beanCurdCubeId = item.beanCurdCubeId;
      } else {
        itemOfTofu.id = 0;
        itemOfTofu.beanCurdCubeId = item.id;
      }
      itemOfTofu.sort = index + 1;
      itemOfTofu.accountId = sessionStorage.accountId;
      beanCurdCubeScreenList.push(itemOfTofu);
      itemOfTofu = {};
    })

    let requestData = {
      delIds: deleteId,
      beanCurdCubeScreenList: beanCurdCubeScreenList,
      logoUrl: this.logo.url
    };

    this.remote.editTofuOfScreen(requestData)
      .then(res => {
        this.editCancel();
        if (res.data.code === '0') {
          this.getTofuInfoList();
          this.rootScope.toggleInfoModal(1, '编辑成功');
        } else {
          this.rootScope.toggleInfoModal(4, '编辑失败，请稍后重试');
        }
      })
  }
  signout() {
    this.rootScope.signout()
  }
}
