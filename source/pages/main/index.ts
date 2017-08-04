import {Page, IPageParams, page} from "../../common/page";

import './style.styl';

require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));


@page({
    template: require('./tmpl.html')
})

class MainPage extends Page<IPageParams> {
    name:string;
    isClick=false;
    init(){
        this.remote.getDisplayName()
            .then((res)=>{
                this.name=res.data.data;
            })
    }

    isActive(stateName: string | string[]) {
        if (typeof stateName === 'string') {
            return this.uiState.current.name === stateName;
        } else {
            return stateName.filter(name => name === this.uiState.current.name).length > 0;
        }
    }
    navToggle(){
        this.isClick=!this.isClick;
        console.log(this.isClick)
    }
    ifShow(){
        this.isClick=false;
    }
    //退出登录
    signout() {
        this.session.clear();
        this.uiState.go('login');
    }
    /* 封装一个用于提示成功的模态框 */
    successInfoTipModal (msg) {
        let $successModal = $('#J-success-modal');
        $successModal.find('span').text(msg);
        $successModal.fadeIn(1000);
        setTimeout(() => {
            $successModal.fadeOut(1000)
        }, 1500)
    }
}