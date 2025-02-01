### **关于P2P & PeerJS**：
P2P 是一种分布式网络架构，其中每个参与者（也称为节点）充当客户端和服务器的角色。
与传统的客户端-服务器模型不同，P2P 允许直接的节点之间通信，而无需通过中央服务器进行转发。

[PeerJS](https://peerjs.com/)：一个基于 WebRTC 的 JavaScript 库，用于简化 P2P 通信的实现。

![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)

它采用**节点式传递**，允许数据直接从一个节点传递到另一个节点，这意味着无论连接谁，都可以收到相同的文字互动信息，而且**无需依赖中央服务器**，大大减少网络延迟。

 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

### 更新:
+ 新功能：
+ 会议功能(与独立音频功能合并)更新
+ tauri PC端程序分支
+ 更多自定义界面控件，展开关闭控制面板
+ 丰富程序反馈文本提示
+ app模式 (网页端默认不启用，app默认启用)
+ 提交内容增加缓存（默认启用）
+ 部分UI，配色优化

### 调整
+ 停用原有的网页全屏按钮
+ 流传输还原回旧版并更新，同时修复了旧版的问题
+ 根节点改名为网络名称(群组编号，更容易理解)
+ nodesMap推送不再有差别
+ 修复了一些历史遗留bug

## [在线版本 -> https://aiksxd.github.io/PeerApps/PeerLive/P2PLiveIndex.html](https://aiksxd.github.io/PeerApps/PeerLive/P2PLiveIndex.html)
### 用法：
1. 使用浏览器/应用程序在有网络的情况下加载主页(index.html)
> [如果无法连接到网络名称，直接输入**房间ID** / 使用**不公开**选项创建房间]
![Step-1](https://github.com/aiksxd/material/blob/main/img/Live-Step-1.png)

+ [ 对于观众 ]
2. 观众在执行第一步后可以看到该根节点下的所有活跃直播间(列入标准不在于是否推流，而是直播页面的连接情况)
![Host-Step-2](https://github.com/aiksxd/material/blob/main/img/Host-Step-2.png)

+ [ 对于主播 ]
2. 点击**创建房间**之后点击**共享本地流**，选择合适的方式共享流媒体
![Audience-Step-2](https://github.com/aiksxd/material/blob/main/img/Audience-Step-2.png)

### **SRS支持**：
1. 运行srs服务器并添加webRTC支持(以下选一种)
> + windows/linux推荐直接下载运行
> [下载安装](https://github.com/ossrs/srs/releases)
> + Windows 创建并运行 srs-rtmp2rtc.bat
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
> ```bat
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
![Host-Step-3](https://github.com/aiksxd/material/blob/main/img/Host-Step-3-zh.png)

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