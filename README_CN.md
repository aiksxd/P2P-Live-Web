### **关于PeerJS**：
![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)
![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)
[PeerJS](https://peerjs.com/)：一个基于 WebRTC 的 JavaScript 库，用于简化 P2P 通信的实现。

## [在线版本 -> https://aiksxd.github.io/PeerApps/PeerLive/index.html](https://aiksxd.github.io/PeerApps/PeerLive/index.html)

### 用法：
1. 使用浏览器/应用程序在有网络的情况下加载主页(index.html)
> [如果无法连接到网络名称，直接输入**房间ID** / 使用**不公开**选项创建房间]
![Step-1](https://s21.ax1x.com/2025/02/01/pEZUrJ1.png)

+ [ 对于观众 ]
2. 观众在执行第一步后可以看到该根节点下的所有活跃直播间(列入标准不在于是否推流，而是直播页面的连接情况)
![Audience-Step-2](https://s21.ax1x.com/2025/02/01/pEZUyz6.png)

+ [ 对于主播 ]
2. 点击**创建房间**之后点击**共享本地流**，选择合适的方式共享流媒体
![Host-Step-2](https://s21.ax1x.com/2025/02/01/pEZUsRx.png)

### **SRS支持**：
1. 运行srs服务器并添加webRTC支持(以下选一种)
> + windows/linux推荐直接下载运行
> [SRS安装链接](https://github.com/ossrs/srs/releases)
> + windowsSRS&OBS一键安装脚本 推荐新手下载使用并安装
> [一键安装脚本链接](https://github.com/aiksxd/P2P-Live-Web/releases/download/v13/Window-Peerlive_0.1.0_x64-setup.exe)
> + bat脚本
> [srs-rtmp2rtc.bat脚本链接](https://github.com/aiksxd/P2P-Live-Web/blob/main/srs-rtmp2rtc.bat)
> + 当然你可以在Windows中自行创建并运行 srs-rtmp2rtc.bat，您可以直接复制以下文本并粘贴至记事本上并更改名为srs-rtmp2rtc.bat
> ```bat
> for /f "tokens=2*" %%i in ('REG QUERY "HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\App Paths\srs\ins_dir"') do set srs_home=%%j
> 
> echo %srs_home%
> 
> for %%I in ("%srs_home%") do set srs_disk=%%~dI
> 
> cd %srs_home%
> @%srs_disk%
> 
> objs\srs.exe -c conf\rtmp2rtc.conf
> cmd
> ```
> + docker:
> Windows: 
> ```cmd
> docker run --rm -it -p 1935:1935 -p 1985:1985 -p 8080:8080 --env CANDIDATE=127.0.0.1 -p 8000:8000/udp registry.cn-hangzhou.aliyuncs.com/ossrs/srs:5 ./objs/srs -c conf/rtmp2rtc.conf`
> ```
> Linux/Android(termux):
> ```sh
> export CANDIDATE="127.0.0.1"
> docker run --rm --env CANDIDATE=$CANDIDATE \
>   -p 1935:1935 -p 8080:8080 -p 1985:1985 -p 8000:8000/udp \
>   ossrs/srs:4 \
>   objs/srs -c conf/rtmp2rtc.conf
> ```

2. 向目标地址推rtmp协议流（例如rtmp://localhost/live/livestream），拉取时在共享本地流SRS功能区域的密钥位置填入"密钥"并点分享按钮(第一个是SRS服务器地址，默认localhost。第二个是推流时填入的密钥，需要手动填写)
3. 特别注意，推流时设置选择**硬件编码器**，并且把**B帧**功能关闭，否则会出现丢帧情况！！
![Host-Step-3](https://github.com/zilinkids/P2P-MDmaterial/blob/main/Host-Step-3-zh.png)

### **注意事项**：
1. 如果建立连接发生在主机开始共享流媒体之前，再次点击刷新按钮会**刷新接收的流媒体**（如不可用则刷新整个页面）
2. 在主播丢失连接时，则无法将主播子节点的信息传递给其他主播子节点
3. 子节点在传递给子子节点时视频质量开始可能模糊，尝试等待即可(一次测试26s后画质同步)


### 拓展相关：内置数组
+ nodesMap[ **0消息类型** -> 1, **1来源**: 0(child)/1(host), **2房间内所有成员ID**: number, **3房间类型**, **4直播标题**, **5直播简介**, **6直播封面**, **7主办方id**, **8主办方name**, **9主办方子节点**, **10根节点id**, **11会议信息**]

+ child_Nodes[ **消息类型** -> 1, **来源**: 0(child)/1(host), **子节点个数**: number, **房间内的所有id**, **所属id**, **所属名称**, **未启用的扩展接口**, **子节点A的id**, **子节点A的名称**, **子节点A的子节点**, **子节点B的id**....]

+ hereNodes[ **0.dataTypes**: 1, **1.sourceMark**: 0(child), **2.Number Of child Nodes**: number, **3.unused for your extension**, **4.own_Id**, **5.own_Name**, **6.unused for your extension**, **7.here_A_Id**, **8.here_A_name**, **9.here_Nodes_Of_Child_A**, **10.here_B_Id**...]

+ iframeWindow.postMessage[ **0.dataTypes**: 0(switch setting value)/1(change theme), **1.sourceMark**: value]

+ `conferee_Map = [[0, ...],[0, ...],[0, ...],[0, ...]];     // [indexs], [ids], [names], [stream.id] ; [0:up to now only has taken up position, 1...:conferee]`

### 标识
+ 消息类型: 0 -> 互动信息, 1 -> 节点信息收集用, 2 -> 流媒体请求, 3 -> 提醒更换父节点, 4 -> 流媒体呼叫刷新请求, 5 -> 会议相关

+ Connection Mark: 0: parent, 1: guest(for the index), 2: bridge(when connect circle), 3: root, 4: indexRoot(for the index)

## Issue: 
### 连接无反馈
+ 由于P2P本身的局限性，有些网络之间难以建立P2P连接，不过有时可以通过桥接都可以连接网络来解决

## **关于本地Peer服务器(其他方面)**：
### PeerServer
先装npm，国内cnpm也可以，然后安装peer：
```
npm install peer -g
```
其中-g可选，表示全局安装，安装至用户文件夹，否则仅当前目录
然后用下面命令可以启用本地peer服务器(路径等值需要与网页内peerjs统一)
```
peerjs --port 9000 --key peerjs --path /myapp Started PeerServer on ::, port: 9000, path: /myapp
```
然后在各个更改peer所用源（config注释示例）
