import { Page, IPageParams, page } from '../../../../../common/page';
import {global} from '../../../../../common/global';
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface ITofuPageParams extends IPageParams {
  page: string;
  id;
}

@page({
  // 模板;
  template: require('./tmpl.html'),
  // 路由参数，写在这里，可以从this.params中获取。
  // params: ['id'],
  // 依赖注入，在init函数的参数表中可以获取。
  requires: ['$timeout'],
  // 这一页的标题
  title: '机构管理系统',
  name: 'main.custom-hardware.tofu'
})

class MainHardware_TofuPage extends Page<ITofuPageParams> {
  tofuList = [];
  apkList = [];
  apkId = '0';
  isAllSelect = false;
  pageId = 1;
  pageSize = '10';
  queryId = '0';
  totalSize = 0;
  belongList;
  type = '0';
  filePath = global.IMG_API_PATH;
  isShowOfBelongSelect = false;
  isShowOfTypeSelect = false;
  contentOfSearch = '';
  maxSize = 7;
  indexOfAddTofu;
  delete;
  create;
  edit;
  content;

  init(timeout: angular.ITimeoutService) {
    this.initVariableOfObj();
    this.getTofuInfoList();
    this.getApkInfoList();
    this.uploadFile();
    this.uploadContentFile();
    this.addContentFile();
    this.clearData();
  }
  // 初始化对象变量
  initVariableOfObj () {
    this.delete = {
      deleteId: 0,
      deleteType: 0   // 0: 初始值；1: 删除单个豆腐块；2: 删除多个豆腐块
    };
    this.create = {
      apkName: '',
      isShowOfApkSelect: false,
      apkList: null,
      apkId: '0',
      indexOfAddTofu: 0,
      tofuName: '',
      addTofuList: [
        { title: '', subtitle: '', sort: 1, url: ''}
      ],
      isShowErrorTip: false,
      errorText: ''
    };
    this.edit = {
      index: -1,
      isShowOfApkSelect: false,
      apkList: null,
      apkId: 0,
      id: 0,
      apkName: '',
      tofuName: '',
      status: 1,
      isShowErrorTip: false,
      errorText: ''
    };
    this.content = {
      contentList: null,
      tofuId: 0,
      edit: {
        sort: 0,
        title: '',
        subTitle: '',
        status: '1',
        url: '',
        id: 0,
        isShowErrorTip: false,
        errorText: ''
      },
      add: {
        sort: '',
        title: '',
        subTitle: '',
        status: '1',
        url: '',
        isShowErrorTip: false,
        errorText: ''
      }
    };
  }
  // 全选操作
  isSelectAll () {
    let isAllSelect = this.isAllSelect,
        tofuList = this.tofuList;
    // 全部选中
    if (!isAllSelect) {
      tofuList.forEach(function (item, index) {
        item.isSelect = 1;
      })
    } else {    // 全部不选中
      tofuList.forEach(function (item, index) {
        item.isSelect = 0;
      })
    }
    this.isAllSelect = !isAllSelect;
  }
  // 点击列表每一项 对其判断是否是全选或非全选状态
  isAllSelectOfItemClick (tofu) {
    let apkList = this.tofuList;
    tofu.isSelect = tofu.isSelect ^ 1;

    for (var i = 0; i < apkList.length; i++) {
      if (!apkList[i].isSelect) {
        this.isAllSelect = false;
        return false;
      }
    }
    this.isAllSelect = true;
  }
  // 获取tofu列表
  getTofuInfoList () {
    let contentOfSearch = this.contentOfSearch,
        type = this.type,
        requestData = {
          start: this.pageId,
          size: this.pageSize,
          name: contentOfSearch,
          apkId: this.apkId
        };

    this.remote.getTofuListInfo(requestData)
        .then(res => {
          if (res.data.code === '0') {
            let response = res.data.data;
            this.totalSize = response.totalSize;
            response.resultList.forEach(function (item, index) {
              item.isSelect = 0;
            });
            this.isAllSelect = false;
            this.tofuList = response.resultList;
          } else {
            this.rootScope.toggleInfoModal(4, '获取数据失败，请稍后重试');
          }
        })
  }
  // 获取apk信息列表
  getApkInfoList () {
    this.remote.getApkInfoList()
        .then(res => {
          if (res.data.code === '0') {
            this.create.apkList = res.data.data;
            this.edit.apkList = res.data.data;
            this.apkList = res.data.data;
          }
        })
  }
  // select 点击事件
  clickOfItemSelect (id, name, type) {
    this.queryId = id;
    this.contentOfSearch = name;
    this[type] = false;
  }

  // 点击全选旁边的删除按钮 触发，
  deleteManyOpen () {
    let validIndex= this.tofuList.findIndex((item) => item.isSelect === 1 && item.type === 3)
    if (validIndex !== -1) {
        this.delete.deleteType=2
        $('#tofuDeleteModal').modal('show')
    }
  }

  /* 删除 */
  deleteTofus () {
    let requestParam = [],
        deleteType = this.delete.deleteType,
        deleteId = this.delete.deleteId,
        tofuList = this.tofuList;

    if (deleteType === 1) {
      requestParam.push(deleteId)
    } else if (deleteType === 2) {
      tofuList.forEach(function (item, index) {
        if (item.isSelect === 1 && item.type === 3) {
          requestParam.push(item.id);
        }
      })
    }

    this.remote.deleteTofus(requestParam)
        .then(res => {
          $('#tofuDeleteModal').modal('hide');
          let resData = res.data;

          if (resData.code === '0') {
            this.rootScope.toggleInfoModal(1, '删除豆腐块成功');
            this.getTofuInfoList();
          } else if (resData.code === '21') {
            this.rootScope.toggleInfoModal(4, resData.message);
          } else {
            this.rootScope.toggleInfoModal(4, '删除豆腐块失败, 请稍后重试');
          }
        })
  }
  /* 新增 */
  selectApk (name, id, type) {
    this[type].apkName = name;
    this[type].apkId = id;
    this[type].isShowOfApkSelect = false;
  }
  inputClickOfCreate (type) {
    let isShowOfApkSelect = this[type].isShowOfApkSelect;
    if (!isShowOfApkSelect) {
      this[type].apkName = '';
      this[type].apkId = 0;
    }
    this[type].isShowOfApkSelect = !isShowOfApkSelect;
  }
  // 选择豆腐块 图片
  selectFile (index) {
    this.indexOfAddTofu = index;
    $('#J-create-tofu-upload').trigger('click');
  }
  // 上传豆腐块图片
  uploadFile () {
    $('#J-create-tofu-upload').off('change').on('change', (event) => {
      let file = event.target.files[0],
          fileName = file.name,
          fileNameArr = fileName.split('.'),
          formData = new FormData();

      formData.append('file', event.target.files[0]);

      this.remote.uploadFileOfHardware('tofu', formData)
          .then(res => {
            if (res.data.code === '0') {
              let index = this.indexOfAddTofu;
              this.create.addTofuList[index].url = res.data.data.filePath;
            }
          })
    })
  }
  // 移除豆腐块
  removeTofuOfCreate (index) {
    this.create.addTofuList.splice(index, 1);
  }
  // 添加新的豆腐块
  addTofuOfCreate () {
    let lengthOfTofu = this.create.addTofuList.length;
    this.create.addTofuList.push({ title: '', subtitle: '', sort: lengthOfTofu+1, url: ''})
  }
  // 保存新添加的豆腐块
  saveOfAddTofu () {
    let apkId = this.create.apkId,
        tofuName = this.create.tofuName,
        addTofuList = this.create.addTofuList;

    if (!apkId || apkId === '0') {
      this.create.errorText = '请选择关联APK';
      this.create.isShowErrorTip = true;
      return false;
    }
    if (!tofuName) {
      this.create.errorText = '请填写豆腐块名称';
      this.create.isShowErrorTip = true;
      return false;
    }

    for (let i = 0; i < addTofuList.length; i++) {
      if (!addTofuList[i].title) {
        this.create.errorText = '请填写豆腐块标题';
        this.create.isShowErrorTip = true;
        return false;
      }
      if (!addTofuList[i].subtitle) {
        this.create.errorText = '请填写豆腐块副标题';
        this.create.isShowErrorTip = true;
        return false;
      }
      if (!addTofuList[i].url) {
        this.create.errorText = '请上传图片';
        this.create.isShowErrorTip = true;
        return false;
      }
    }

    let requestData = {
      apkId: apkId,
      name: tofuName,
      detailList: addTofuList
    };

    this.remote.addTofu(requestData)
      .then(res => {
        $('#tofuCreateModal').modal('hide');
        let resData = res.data;

        if (resData.code === '0') {
          this.rootScope.toggleInfoModal(1, '新建豆腐块成功');
          this.getTofuInfoList();
        } else {
          this.rootScope.toggleInfoModal(4, '新建豆腐块失败, 请稍后重试');
        }
      })
  }
  createModalShow () {
    this.create.apkName = '';
    this.create.isShowOfApkSelect = false;
    this.create.apkId = 0;
    this.create.indexOfAddTofu = 0;
    this.create.tofuName = '';
    this.create.isShowErrorTip = false;
    this.create.errorText = '';
    this.create.addTofuList = [
      { title: '', subtitle: '', sort: 1, url: ''}
    ];
  }
  /* 编辑 */
  editModalShow (tofu, index) {
    this.edit.index = index;
    this.edit.type = tofu.type;
    this.edit.tofuName = tofu.name;
    this.edit.apkName = tofu.apkName;
    this.edit.apkId = tofu.apkId.toString();
    this.edit.id = tofu.id;
    this.edit.status = tofu.status.toString();
    this.edit.isShowErrorTip = false;
    this.edit.errorText = '';
  }
  saveOfEditTofu () {
    let apkId = this.edit.apkId,
        tofuName = this.edit.tofuName,
        apkName = this.edit.apkName,
        id = this.edit.id,
        index = this.edit.index,
        status = this.edit.status;

    if (!apkId || apkId === '0') {
      this.edit.errorText = '请选择关联APK';
      this.edit.isShowErrorTip = true;
      return false;
    }
    if (!tofuName) {
      this.edit.errorText = '请填写豆腐块名称';
      this.edit.isShowErrorTip = true;
      return false;
    }

    let requestData = {
      apkId: apkId,
      name: tofuName,
      status: status,
      id: id
    };

    this.remote.updateTofu(requestData)
      .then(res => {
        $('#tofuEditModal').modal('hide');
        let resData = res.data;

        if (resData.code === '0') {
          this.rootScope.toggleInfoModal(1, '修改豆腐块成功');
          this.tofuList[index].name = tofuName;
          this.tofuList[index].apkName = apkName;
          this.tofuList[index].apkId = apkId;
          this.tofuList[index].status = status;
        } else {
          this.rootScope.toggleInfoModal(4, '修改豆腐块失败, 请稍后重试');
        }
      })
  }
  /* 内容管理 */
  getContentOfTofu (tofuId) {
    this.content.tofuId = tofuId;
    let requestData = {
      id: tofuId
    };

    this.remote.getContentOfTofu(requestData)
      .then(res => {
        if (res.data.code === '0') {
          this.content.contentList = res.data.data.beanCurdCubeDtails;
        }
      })
  }
  // 内容管理 编辑模态框弹出
  contentEditModalShow (content) {
    this.content.edit.id = content.id;
    this.content.edit.sort = content.sort;
    this.content.edit.title = content.title;
    this.content.edit.subTitle = content.subtitle;
    this.content.edit.status = content.status.toString();
    this.content.edit.url = content.url;
  }
  selectContentFile () {
    $('#J-content-edit-upload').trigger('click');
  }
  uploadContentFile () {
    $('#J-content-edit-upload').off('change').on('change', (event) => {
      let file = event.target.files[0],
          fileName = file.name,
          fileNameArr = fileName.split('.'),
          formData = new FormData();

      formData.append('file', event.target.files[0]);

      this.remote.uploadFileOfHardware('tofu', formData)
        .then(res => {
          if (res.data.code === '0') {
            this.content.edit.url = res.data.data.filePath;
          }
        })
    })
  }
  // 内容管理 编辑保存
  saveContentEdit () {
    let id = this.content.edit.id,
        sort = this.content.edit.sort,
        title = this.content.edit.title,
        subTitle = this.content.edit.subTitle,
        status = this.content.edit.status,
        url = this.content.edit.url,
        tofuId = this.content.tofuId;

    if (!sort) {
      this.content.edit.errorText = '请填写顺序';
      this.content.edit.isShowErrorTip = true;
      return false;
    }
    if (!/^[1-9]\d*$/.test(sort)) {
      this.content.edit.errorText = '顺序必须为大于0的数字';
      this.content.edit.isShowErrorTip = true;
      return false;
    }
    if (!title) {
      this.content.edit.errorText = '请填写标题';
      this.content.edit.isShowErrorTip = true;
      return false;
    }
    if (!subTitle) {
      this.content.edit.errorText = '请填写副标题';
      this.content.edit.isShowErrorTip = true;
      return false;
    }
    if (!url) {
      this.content.edit.errorText = '请上传首屏内容图';
      this.content.edit.isShowErrorTip = true;
      return false;
    }

    let requestData = {
      id: id,
      sort: sort,
      title: title,
      subtitle: subTitle,
      status: status,
      url: url
    };

    this.remote.updateContent(requestData, tofuId)
      .then(res => {
        $('#contentEditModal').modal('hide');

        if (res.data.code === '0') {
          this.getContentOfTofu(tofuId);
        }
      })
  }
  // 内容管理 新增模态框弹出
  contentAddModalShow () {
    this.content.add.sort = '';
    this.content.add.title = '';
    this.content.add.subTitle = '';
    this.content.add.status = 1;
    this.content.add.url = '';
  }
  selectAddContentFile () {
    $('#J-content-add-upload').trigger('click');
  }
  addContentFile () {
    $('#J-content-add-upload').off('change').on('change', (event) => {
      let file = event.target.files[0],
          fileName = file.name,
          fileNameArr = fileName.split('.'),
          formData = new FormData();

      formData.append('file', event.target.files[0]);

      this.remote.uploadFileOfHardware('tofu', formData)
        .then(res => {
          if (res.data.code === '0') {
            this.content.add.url = res.data.data.filePath;
          }
        })
    })
  }
  // 内容管理 新增保存
  saveContentAdd () {
    let sort = this.content.add.sort,
        title = this.content.add.title,
        subTitle = this.content.add.subTitle,
        status = this.content.add.status,
        url = this.content.add.url,
        tofuId = this.content.tofuId;

    if (!sort) {
      this.content.add.errorText = '请填写顺序';
      this.content.add.isShowErrorTip = true;
      return false;
    }
    if (!/^[1-9]\d*$/.test(sort)) {
      this.content.add.errorText = '顺序必须为大于0的数字';
      this.content.add.isShowErrorTip = true;
      return false;
    }
    if (isNaN(sort)) {
      this.content.add.errorText = '顺序需为数字';
      this.content.add.isShowErrorTip = true;
      return false;
    }
    if (!title) {
      this.content.add.errorText = '请填写标题';
      this.content.add.isShowErrorTip = true;
      return false;
    }
    if (!subTitle) {
      this.content.add.errorText = '请填写副标题';
      this.content.add.isShowErrorTip = true;
      return false;
    }
    if (!url) {
      this.content.add.errorText = '请上传首屏内容图';
      this.content.add.isShowErrorTip = true;
      return false;
    }

    let requestData = {
      sort: sort,
      title: title,
      subtitle: subTitle,
      status: status,
      url: url
    };

    this.remote.addContent(requestData, tofuId)
      .then(res => {
        $('#contentAddModal').modal('hide');

        if (res.data.code === '0') {
          this.getContentOfTofu(tofuId);
        }
      })
  }
  // 删除内容
  deleteContent (id) {
    let tofuId = this.content.tofuId,
        requestData = {
          tofuId: tofuId,
          contentId: id
        };

    this.remote.deleteContent(requestData)
      .then(res => {
        if(res.data.code === '0') {
          this.getContentOfTofu(tofuId);
        }
      })
  }
  // 清空模态框数据
  clearData () {
    $('#contentAddModal').on('hide.bs.modal', (e) => {
      this.content.add = {
        sort: 0,
        title: '',
        subTitle: '',
        status: '1',
        url: '',
        isShowErrorTip: false,
        errorText: ''
      }
    })
  }
  signout() {
    this.rootScope.signout()
  }
}
