// 获取当前环境的而语言
function getLanguage () {
    let
        language = 'CN',
        langFromLocal = localStorage.getItem('lang'),
        langFromNavigator = navigator.language;

    if (langFromLocal && langFromLocal.indexOf('en-us') > -1) {
        language = 'EN';
    }
    if (!langFromLocal && langFromNavigator.indexOf('en-us') > -1) {
        language = 'EN';
    }

    return language;
}

export default {
    getLanguage
}
