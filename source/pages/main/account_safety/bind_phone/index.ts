import {Page, IPageParams, page} from "../../../../common/page";
// webpack的配置，不用管
require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));
// 引入样式
require('./style.styl');
// 路由参数的设置
interface IAccountSafetyPageParams extends IPageParams {
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
    name: 'main.bind-phone'
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
class MainAccount_SafetyPage extends Page<IAccountSafetyPageParams> {
    newPhone; // newPhone
    authCode; // 验证码
    pictureCode; // 图片验证码
    errorTips = {};
    disabled = false;
    codeTipVisibly = false;
    rules;
    count = 60;
    pictureUrl;
    second ={count:this.count};

    init(timeout: angular.ITimeoutService){
        this.rules = {
            newPhone: (value, callback) => {
                if(!value) {
                    callback(new Error(this.translate.instant('ADMIN_WARN_TIP31')))
                } else if (!/^0?(13|14|15|17|18|19)[0-9]{9}$/.test(value)) {
                    callback(new Error(this.translate.instant('ADMIN_ERROR_TIP14')))
                } else {
                    callback()
                }
            },
            authCode: (value, callback) => {
                value ? callback() : callback(new Error(this.translate.instant('ADMIN_WARN_TIP32')))
            },
            pictureCode: (value, callback) => {
                value ? callback() : callback(new Error(this.translate.instant('ADMIN_INPUT_VERIFY')))
            }
        }
        this.changePictureCode();
        this.addValidateEvent(this.rules);
    }

    // 更改图片验证码
    changePictureCode() {
        // 改变时间戳
        this.pictureUrl = `${this.global.API_PATH}getCaptchaImage?timestamp=${new Date().getTime()}`;
    }

    // 获取手机验证码
    getAuthCode() {
        // 验证手机 是否ok
        this.validateField(this.rules, ['newPhone', 'pictureCode'], (valid) => {
            if (valid) {
                this.reqValidatePicCodePromise().then((result) => {
                  // 获取手机验证码
                  this.remote.sendPhoneCode({
                      countryCode: 86,
                      phoneNumber: this.newPhone
                  }).then(res => {
                      if(res.data.code === '0') {
                          this.count--;
                          this.second ={count:this.count};
                          let timer = setInterval(() => {
                              this.count--;
                              this.second ={count:this.count};
                              if(this.count === 0){
                                  this.codeTipVisibly = false;
                                  this.disabled = false;
                                  clearInterval(timer);
                                  this.count = 60;
                              }
                          }, 1000)
                          this.codeTipVisibly = true;
                          this.disabled = true;
                      } else if(res.data.code === '7') {
                          this.errorTips['newPhone'] = this.translate.instant('ADMIN_WARN_TIP33')
                      } else if(res.data.code === '5') {
                          this.errorTips['newPhone'] = this.translate.instant('ADMIN_ERROR_TIP24')
                      } else if(res.data.code === '-2') {
                          this.errorTips['newPhone'] = this.translate.instant('ADMIN_ERROR_TIP25')
                      } else {
                          this.errorTips['newPhone'] = this.translate.instant('ADMIN_ERROR_TIP31');
                      }
                  })
                }).catch((result) => {
                  this.errorTips['pictureCode'] = this.translate.instant('ADMIN_ERROR_TIP26');
                  return;
                })
            }
        })
    }

    // 最终修改手机号 点击确定

    reqValidatePicCodePromise() {
      // 校验 图片验证码
      return new Promise((resolve, reject) => {
        $.ajax({
        crossDomain: true,
        xhrFields: {withCredentials: true},
        type: 'POST',
        url: this.global.API_PATH + '/checkCaptcha',
        data: {
            timestamp: '',
            code: this.pictureCode
        },
        dataType: 'JSON',
        success: (result) => {
            if (result == true) {
                // this.reqAlterPhone();
                resolve(result)
            } else {
                reject(result)
                // this.errorTips['pictureCode'] = '图片验证码错误，请重新获取'
            }
        },
        catch: (error) => {
          console.warn(error);
        }
        })
      })

    }

    alterPhone() {
        // 校验 图片验证码
        this.validate(this.rules, (valid) => {
            if(valid) {
              this.reqValidatePicCodePromise().then((result) => {
                this.reqAlterPhone();
              }).catch((result) => {
                this.errorTips['pictureCode'] = this.translate.instant('ADMIN_ERROR_TIP26');
                return;
              })
            }
        })
    }

    // 验证图片验证码ok 后，修改手机
    reqAlterPhone() {
        let reqData = {
            countryCode: 86,
            mobile: this.newPhone,
            code: this.authCode
        }
        this.remote.alterAndBindPhone(reqData).then(res => {
            // 处理错误机制
            if (res.data.code === '0') {
                this.rootScope.toggleInfoModal(1, this.translate.instant('ADMIN_SUCCESS10'))
                setTimeout(() => {
                  this.uiState.go('main.account-safety');
                },1000)
            } else if(res.data.code === '8') {
                this.errorTips['authCode'] = this.translate.instant('ADMIN_ERROR_TIP26')
            } else {
                this.rootScope.toggleInfoModal(4, this.translate.instant('ADMIN_ERROR_TIP27'))
            }
        })
    }

    addValidateEvent(rules) {
        for (let [key, validFun] of Object.entries(rules)) {
            document.querySelector(`input[name='${key}']`).addEventListener('blur', () => {
                validFun(this[key], (err) => {
                    this.errorTips[key] = err ? err.message : '';
                })
            })
        }
    }

    validate(rules, valid) {
        let result = true;
        for (let [key, validFun] of Object.entries(rules)) {
            validFun(this[key], (err) => {
                if(err) {
                    this.errorTips[key] = err.message
                    result = false
                }
            })
        }
        valid(result);
    }

    async validateField(rules, fieldArr, valid) {
        let result = true;
        for (let field of fieldArr.values()) {
          await rules[field](this[field], (err) => {
              if(err) {
                  result = false
                  this.errorTips[field] = err.message
              }
          })
        }
        valid(result);
    }

    close() {
    }
    signout() {
        this.rootScope.signout()
    }
}
