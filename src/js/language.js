let language_Text = [
    {
        "en": "Change Theme",
        "zh": "切换主题",
    },
    {
        "en": "Light",
        "zh": "白天",
    },
    {
        "en": "Dark",
        "zh": "夜间",
    },
    {
        "en": "Multi Live Page",
        "zh": "多直播标签",
    },
    {
        "en": "Enable Local Storage(unavailable in inPrivate window)",
        "zh": "启用本地缓存",
    },
    {
        "en": "Clean Local Storage!",
        "zh": "清除本地缓存！",
    },
    {
        "en": "App Mode(unavailable as files:// (at least http://127.0.0.1))",
        "zh": "应用模式(以文件形式读取不可用files:// (至少为本地服务器http://127.0.0.1))",
    },
    {
        "en": "Language(reload warning):",
        "zh": "语言(注意会重载首页):",
    }
]
function change_Language(language) {
    document.getElementById('homePage').src = "./"+ language + "/index.html";
    let doms = document.getElementsByClassName('lan');
    let i = 0;
    while(i < doms.length){
        if (doms[i]) {
            doms[i].innerText = language_Text[i][language];
        }
        i++;
    }
}