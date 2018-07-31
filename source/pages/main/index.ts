import { Page, IPageParams, page } from 'common/page';
import './style.styl';

require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));

let defaultSysLogo = require('static/images2/nav-logo.png');

@page({
    template: require('./tmpl.html')
})

class MainPage extends Page<IPageParams> {
    title:'';
    name: string;
    isClick = false;
    currentLan = localStorage.getItem('lang').toLowerCase().indexOf('en-us') > -1 ? 'en' : 'cn';
    systemLogo;
    infoType = 0;
    infoText = '';
    notificationType = 0;
    notificationTitle = '';
    notificationText = '';
    /* 子菜单是否展开 */
    subNav= {
        liveRecord: false,
        statistics: false
    }

    init() {
        // 这个里面不要写逻辑，只写方法的调用
        this.commonComponents();
        this.setCustomInfo();
    }
    // 切换语言
    chooseLang(type){
        if (type) {
            let langStr = type.substring(0, 2);

            this.translate.use(type);
            localStorage.setItem('lang', type);

            this.currentLan = langStr;
            this.uiState.reload();
        }
    }

    // 定制化信息设置
    setCustomInfo() {
        //根据域名查询是否显示定制化图片
        let domain = document.domain;
        this.remote.getCustomImgByDomain(domain).then(res => {
            let
                data = res.data.data || [],
                host = this.global.IMG_API_PATH;

            if (data) {
                this.systemLogo =
                    data.systemLogo ?
                        `${host}${data.systemLogo}` :
                        `${defaultSysLogo}`;

                // 这里直接操作DOM了 需要优化
                if (data.ico) {
                    document.querySelector("link[rel='icon']").setAttribute('href', `${ host }${ data.ico }`);
                }

                document.querySelector('title').innerText =
                    data.name ?
                        data.name :
                        this.translate.instant('ADMIN_SYSTEM_NAME');
            }
        })
    }
    /**
     * 菜单点击 相关事件
     * @param stateName
     * @returns {boolean}
     */
    isActive(stateName: string | string[]) {
        if (typeof stateName === 'string') {
            return this.uiState.current.name === stateName;
        } else {
            return stateName.filter(name => name === this.uiState.current.name).length > 0;
        }
    }
    // 含子菜单 菜单点击效果
    navToggle(name) {
        let theValueOfName = this.subNav[name];
        if (theValueOfName) {
            this.subNav[name] = false;
            return false;
        }

        let arrOfSubNavKey = Object.keys(this.subNav);

        arrOfSubNavKey.forEach((item) => {
            this.subNav[item] = false;
        })

        this.subNav[name] = true;
    }
    ifShow() {
        this.isClick = false;
    }

    // 退出登录
    signout() {
        this.session.clear();
        this.uiState.go('login');
    }
    // 公共组件
    commonComponents () {
        // 消息提示
        this.rootScope.toggleInfoModal = (type, info) => {
            this.infoText = info;
            this.infoType = type;
            setTimeout(() => {
                this.infoType = 0;
                this.infoText = '';
            }, 1500)
        }
        // 消息通知
        this.rootScope.toggleNotificationModal = (type, title, info) => {
            this.notificationType = type;
            this.notificationTitle = title;
            this.notificationText = info;
            setTimeout(() => {
                this.notificationType = 0;
            }, 1500)
        }
    }
}
