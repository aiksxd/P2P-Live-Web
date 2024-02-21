- [English doc](README.md)

# P2P-Live-Web
注：由于项目无人问津，所有消息2~3周回复一次
## [单直播间型](https://aiksxd.github.io/P2PLiveWebCN.html)
### 用法:
1. 将文件在**本地读取**或**直接访问**以下网址等
2. 直播方点击**共享本地流**按钮，并且分享自己的ID给观众
3. 观众与主播的id任意相连，不过需要保持中间不断开，如果中间断开则需更换连接对象

## [e.g.多房间型(URL->ROOT)](https://aiksxd.github.io/e.g.P2PRootMonitorCN.html)
改版示例：
+ e.g.P2PLiveindex.html 为网站主页（用于展示准备发起直播的房间，并为之提供入口）
+ e.g.P2PRootMonitor.html 为网站根节点（根节点为监听器，负责获取发起直播的所有ID，并递交给主页）
+ e.g.P2PLiveHost & Guest.html 为附属页面，置于同目录下即可
### 用法：
1. 访问主页(根节点页面有超链接)，**填入根节点的ID**并按下**连接**按钮
2. 直播方点击**去开播**之后点击**共享本地流**
3. 观众在执行第一步后可以看到该根节点下的所有活跃直播间(列入标准不在于是否推流，而是直播页面的连接情况)
### 拓展：
1. 如增加房间列表的样式，可以增加直播间页面(e.g.P2PLiveHost)中`guest.on('data', (data) => {`中`guest.send([peer.id, null, null, 0, 1]);`中的参数，**注意：第索引为4的第五个参数勿动！**
2. 优化连接方法，自行解析**nodesMap数组**(包含所有节点信息)(注：**e.g.版本未测试**，**主播节点**的nodesMap包含**所有嵌套节点信息**，而**根节点nodeMaps**=hostsPeers(**不含子子节点**)，如果不喜欢现有的nodesMap数组收集节点信息建议**重构recorder()方法**)，根据主播设备配置推荐采用**围绕主播多个二叉树式**连接法

## **注意事项**：
1. **根节点**具有**推流最高优先级**，它会覆盖所有子节点及其子子节点等的直播
2. **直播媒体流只会推送到子节点**，而不像信息通道无论在哪个节点都可以收到信息，故所连接的根节点最好是直播节点或监听器的子节点（即**流媒体单向传递，文本双向传递**）
3. 如果建立连接发生在主机开始共享流媒体之前，再次点击Connect按钮会**刷新接收的流媒体**
4. 该文件是发与**接收结合为一体**的，且仅依靠前端，这意味着任何人的权限是对等的，如果投入开发或不安全环境，需要对内容进行封装并设置权限分类
5. 在主播丢失连接时，则无法将主播子节点的信息传递给其他主播子节点
6. 子节点在递交给子子节点时视频质量开始可能模糊，尝试等待即可(一次测试26s后画质同步)

### PS：但是桌面流默认由**MediaDevices.getDisplayMedia()**获取
这意味着**大多移动端**都无法发起直播而**只能接收媒体流和文本信息**，且需要在本地开发环境或https下才能正常工作，如有需要可**自行修改getLocalStream()函数**

## 对于**P2P-Live-web**
它采用**节点式传递**，允许数据直接从一个节点传递到另一个节点，这意味着无论连接谁，都可以收到相同的文字互动信息，而且**无需依赖中央服务器**，大大减少网络延迟。

 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

## 对于**exchange**
**仅用于两端**相互交换流媒体而非传递，要求连接方和接收方都提交流媒体，如果增加第三者，其中一个人的流媒体会被**覆盖**
- [e.g.Exchange](https://aiksxd.github.io/e.g.exchange.html)

## Issue: 
### 连接无反馈
+ 由于P2P本身的局限性，有些网络之间难以建立P2P连接，不过可以通过桥接都可以连接网络来解决
+ 关于获取所有节点连接状况：尽管节点网络数据发送已经做完了，但是由于本人能力有限，还没有写好解析数组的函数
但你仍然可以在任意节点的**浏览器内置的控制台**抓取**nodesMap**数组，其中包含从根节点到子节点的所有连接id与关系，其结构为：
`[thisID, [childsIDs], null, 1]`
+ **thisID**首个为**根节点**
+ **childsIDs**首个为根节点的**子节点（若子节点无子节点则为id值，若有则为格式相同的嵌套数组）**
+ null用于区分信息通道
+ 1表示该网络信息来源为根节点(每当新节点加入都会沿线路传输到根节点，根节点汇总后发布再传递至各个节点，汇总过程中该值为0)

## 其他
+ **关于P2P**：
P2P 是一种分布式网络架构，其中每个参与者（也称为节点）充当客户端和服务器的角色。
与传统的客户端-服务器模型不同，P2P 允许直接的节点之间通信，而无需通过中央服务器进行转发。

![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)

+ **关于PeerJS**：
PeerJS：PeerJS 是一个基于 WebRTC 的 JavaScript 库，用于简化 P2P 通信的实现。

简化的 API：PeerJS 提供了简单易用的 API，使开发者能够快速实现 P2P 连接和数据传输。
它抽象了复杂的 WebRTC 细节，使开发过程更加简便。
>
## **关于本地Peer服务器**：
**PS(ignore it if you don't run peerjs server locally如果不想本地运行自行忽略):**
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

