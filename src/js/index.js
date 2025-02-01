let last_Index = 0;
let language = 'en'

switch (navigator.language) {
    case 'zh-CN':
        language = "zh";
        change_Language(language);
        break;
    default:
        document.getElementById('homePage').src = "./"+ language + "/index.html";
        break;
}

function changeMenu(index) {
    let sidebar = document.getElementsByClassName('sidebar')[0];
    let menus = sidebar.getElementsByTagName("svg");
    let contents = document.getElementsByClassName('content')[0];
    if (index < 0) {
        index = menus.length + index;
        if (index < 0) {
            index = 0;
            alert("Error aim menu");    // debug
        }
    }
    contents = contents.getElementsByTagName("div");
    if (!menus[last_Index]) {
        last_Index = 0;
    } else {
        contents[last_Index].classList.add("covert");
        menus[last_Index].classList.remove("active");
    }
    if (!menus[index]) {
        popIndex = 0;
    }
    last_Index = index;
    contents[index].classList.remove("covert");
    menus[index].classList.add("active");
}

function add_Extension(exist, svg, text) {
    let index = '';
    switch (exist) {
        case 1:
            let len = document.getElementsByClassName('liveMenu').length;
            let newDom = document.getElementsByClassName('liveMenu')[len - 1].cloneNode(true);
            let newIframe = document.getElementById('livePage').cloneNode(true);
            newIframe.id = newIframe.id + len;
            newIframe.src = "";
            let newContentDiv = document.createElement('div');
            newContentDiv.appendChild(newIframe);
            newContentDiv.classList.add("iframeContainer", "covert");

            newDom.setAttribute('onclick', "changeMenu("+ (len + 1) + ")");
            newDom.classList.remove('active');  //
            document.getElementsByClassName('content')[0].getElementsByTagName('div')[len - 1].insertAdjacentElement('afterend', newContentDiv);
            document.getElementsByClassName('liveMenu')[len - 1].insertAdjacentElement('afterend', newDom);
            
            if (len < 2) {  // old len(hasnot updated)
                document.getElementsByClassName('liveMenu')[len].classList.add('covert');
            } else {
                document.getElementsByClassName('liveMenu')[len - 1].classList.remove('covert');
            }
            index = len;
            break;
        default:
            break;
    }
    return index;
}

function change_App_Theme(
    index,
    theme_color,
    sidebar_color,
    sidebar_ui_color,
    sidebar_font_color,
    sidebar_active_color
) {  // string index
    // --sidebar_color: rgb(243,243,243);    /* #fae5a0; */
    // --sidebar_ui_color: rgb(174,221,129);     /* rgb(193, 238, 31); */
    // --sidebar_font_color: rgb(21,26,34);
    // --sidebar_active_color: rgb(107,194,53);
    // --window_width: 100vh;
    // --window_height: 100vh;
    if (use_Local_Storage && index !== undefined) {
        localStorage.themeIndex = index;
    }
    switch (index) {
        case "1":   // dark
            theme_color = 'rgb(28,33,40)';
            sidebar_color = 'rgb(28,33,40)';
            sidebar_ui_color = 'rgb(46,46,46)';
            sidebar_font_color = 'rgb(209,215,224)';
            sidebar_active_color = 'rgb(128, 128, 128)';
            break;
        default:  // default white
            theme_color = theme_color || 'rgb(243,243,243)';
            sidebar_color = sidebar_color || 'rgb(216, 224, 209)';
            sidebar_ui_color = sidebar_ui_color || 'rgb(174,221,129)';
            sidebar_font_color = sidebar_font_color || 'rgb(21,26,34)';
            sidebar_active_color = sidebar_active_color || 'rgb(107,194,53)';
            break;
    }
    document.documentElement.style.setProperty('--theme-color', theme_color);
    document.documentElement.style.setProperty('--sidebar-color', sidebar_color);
    document.documentElement.style.setProperty('--sidebar-ui-color', sidebar_ui_color);
    document.documentElement.style.setProperty('--sidebar-font-color', sidebar_font_color);
    document.documentElement.style.setProperty('--sidebar-active-color', sidebar_active_color);
    theme_Index = index;
    let iframeWindow = document.getElementById('homePage').contentWindow;
    iframeWindow.postMessage([1, theme_Index], window.location.origin);
    iframeWindow = document.getElementById('livePage').contentWindow;
    iframeWindow.postMessage([1, theme_Index], window.location.origin);
    let i = 1;
    while (i < (document.getElementsByClassName('livePages').length)) {
        let iframeWindow = document.getElementById('livePage' + i).contentWindow;
        iframeWindow.postMessage([1, theme_Index], window.location.origin);
        i++;
    }
}

window.addEventListener('message', (e)=>{
    if (app_Mode) {
        let index = '';
        if (document.getElementById('multiLivePage').checked) {
            index = add_Extension(1);
            changeMenu(index);
        } else {
            changeMenu(-2);     // original live menu
        }
        // console.log(e.data +"\n"+ index);  // debug
        document.getElementById("livePage" + index).src = "./"+ language +"/"+ e.data;
    }
},false);

document.getElementById('multiLivePage').addEventListener('click', () => {
    if (!document.getElementById('multiLivePage').checked) {
        let len = document.getElementsByClassName('liveMenu').length;
        if (len > 1) {
            document.getElementsByClassName('liveMenu')[len - 1].classList.remove('covert');
        }
    }
});

function switch_App_Mode() {
    if (document.getElementById('appMode').checked) {
        app_Mode = true;
    } else {
        app_Mode = false;
    }
    let currentUrl = window.location.href;
    let iframeWindow = document.getElementById('homePage').contentWindow;
    iframeWindow.postMessage([0, 1, app_Mode], currentUrl);   // setting iframe Enable app_Mode
}

if (app_Mode) {
    if (!document.getElementById('appMode').checked) {
        document.getElementById('appMode').click();
    }
}

function switch_Enable_Local_Storage() {
    if (document.getElementById('useLocalStorage').checked) {
        use_Local_Storage = true;
    } else {
        use_Local_Storage = false;
    }
    let currentUrl = window.location.href;
    let iframeWindow = document.getElementById('homePage').contentWindow;
    iframeWindow.postMessage([0, 0, use_Local_Storage], currentUrl);   // setting iframe Enable_Local_Storage
}
if (use_Local_Storage) {
    if (!document.getElementById('useLocalStorage').checked) {
        document.getElementById('useLocalStorage').click();
    }

    if(localStorage.themeIndex !== undefined){
        change_App_Theme(localStorage.themeIndex);
        document.getElementById('themeController').value = localStorage.themeIndex;
    }
}