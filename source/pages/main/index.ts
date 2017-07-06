import {Page, IPageParams, page} from "../../common/page";

import './style.styl';

require.keys().filter(x => /^\.\/[^\/]+(\/index)?\.(js|ts)$/.test(x)).forEach(x => require(x));


@page({
    template: require('./tmpl.html')
})

class MainPage extends Page<IPageParams> {
    name:string;
    isClick
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
    //退出登录
    signout() {
                    this.session.clear();
                    this.uiState.go('login');

    }

}