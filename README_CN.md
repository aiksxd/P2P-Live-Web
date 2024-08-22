### **关于P2P & PeerJS**：
P2P 是一种分布式网络架构，其中每个参与者（也称为节点）充当客户端和服务器的角色。
与传统的客户端-服务器模型不同，P2P 允许直接的节点之间通信，而无需通过中央服务器进行转发。

PeerJS：一个基于 WebRTC 的 JavaScript 库，用于简化 P2P 通信的实现。

![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)

### 更新:
+ 项目分离(FiveOnline项目独立)
+ 修复了房间信息载入，读取错误
+ 修复了封面在新成员加入时丢失的bug
+ 界面调整补充
+ 房间列表更新更加频繁（减少了错误）

### 下个版本的计划:
+ 流媒体渠道拓宽
+ 新建独立的音频通道

## [多房间型(URL->ROOT)](https://aiksxd.github.io/P2PLiveIndex.html)
+ 文件说明：
+ P2PLiveIndex.html 为网站主页（用于传输并展示发起直播的房间信息）
+ P2PLiveHost.html & P2PLiveAudience.html 为附属页面，置于同目录下即可
### 用法：
+ [ 对于观众 ]
1. 联网并使用浏览器读取主页(P2PLiveIndex.html)，(若根节点连接不成功，则填入房间id直接连接)
3. 观众在执行第一步后可以看到该根节点下的所有活跃直播间(列入标准不在于是否推流，而是直播页面的连接情况)
+ [ 对于主播 ]
1. 联网并使用浏览器读取主页(P2PLiveIndex.html)，(若根节点连接不成功，则创建不公开房间 或 填个根节点的ID连接)
2. 点击**去开播**之后点击**共享本地流**

### **注意事项**：
1. 如果建立连接发生在主机开始共享流媒体之前，再次点击刷新按钮会**刷新接收的流媒体**（如不可用则刷新整个页面）
2. 在主播丢失连接时，则无法将主播子节点的信息传递给其他主播子节点
3. 子节点在传递给子子节点时视频质量开始可能模糊，尝试等待即可(一次测试26s后画质同步)
4. 通常，主页会默认尝试连接id"P2P-Live-Web-Default-Id"


## [单文件版本](https://aiksxd.github.io/SingleP2PLiveVersion.html)
### 用法:
1. 将文件在**本地读取**或**直接访问**现成网址等
2. 直播方点击**共享本地流**按钮，并且分享自己的ID给观众
3. 观众与主播的id任意相连，不过需要保持中间不断开，如果中间断开则需更换连接对象

### **注意事项**：
1. **根节点**具有**推流最高优先级**，它会覆盖所有子节点及其子子节点等的直播
2. **直播媒体流只会推送到子节点**，而不像信息通道无论在哪个节点都可以收到信息，故所连接的根节点最好是直播节点或监听器的子节点（即**流媒体单向传递，文本双向传递**）

## 对于**P2P-Live-web**
它采用**节点式传递**，允许数据直接从一个节点传递到另一个节点，这意味着无论连接谁，都可以收到相同的文字互动信息，而且**无需依赖中央服务器**，大大减少网络延迟。

 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

### 常用数组
+ nodesMap[ **消息类型** -> 1, **来源**: 0(child)/1(host), **房间内所有成员ID**: number, **房间类型**, **直播标题**, **直播简介**, **直播封面**, **主办方id**, **主办方子节点**, **根节点id**]

+ child_Nodes[ **消息类型** -> 1, **来源**: 0(child)/1(host), **子节点个数**: number, **房间内的所有id**, **所属id**, **所属名称**, **未启用的扩展接口**, **子节点A的id**, **子节点A的名称**, **子节点A的子节点**, **子节点B的id**....]

+ hereNodes[ **0.dataTypes**: 1, **1.sourceMark**: 0(child), **2.Number Of child Nodes**: number, **3.unused for your extension**, **4.own_Id**, **5.own_Name**, **6.unused for your extension**, **7.here_A_Id**, **8.here_A_name**, **9.here_Nodes_Of_Child_A**, **10.here_B_Id**...]

### 标识
+ 消息类型: 0 -> 互动信息, 1 -> 节点信息收集用, 2 -> 流媒体请求, 3 -> 提醒更换父节点， 4 -> 流媒体呼叫刷新请求
> for game+: 6 -> Game Info, 7 -> Game Chessman, 8 -> Game Player

+ Connection Mark: 0: parent, 1: guest(for the index), 2: bridge(when connect circle), 3: root, 4: indexRoot(for the index)

## 对于**exchange**
**仅用于两端**相互交换流媒体而非传递，要求连接方和接收方都提交流媒体，如果增加第三者，其中一个人的流媒体会被**覆盖**
- [Exchange](https://aiksxd.github.io/exchange.html)

## Issue: 
### 连接无反馈
+ 由于P2P本身的局限性，有些网络之间难以建立P2P连接，不过可以通过桥接都可以连接网络来解决
### 点首页的刷新导致页面蒸发
+ 莫名奇妙的Bug罢了

## **关于本地Peer服务器**：
**PS(如果不想本地运行自行忽略):**
### PeerServer
先装npm，国内cnpm也可以，然后安装peer：
```
npm install peer -g
```
其中-g可选，表示全局安装，安装至用户文件夹，否则当前目录 
然后用下面命令可以启用本地peer服务器(路径等值需要与网页内peerjs统一)
```
peerjs --port 9000 --key peerjs --path /myapp Started PeerServer on ::, port: 9000, path: /myapp
```
### 修改JS引用路径
在head标签中引用远程js路径改为本地的js路径，示例如下
```
<script src="js/peerjs.min.js"></script>

<!--script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script-->
```

