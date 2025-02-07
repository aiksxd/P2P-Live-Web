- [中文文档](README_CN.md)
### **About P2P & PeerJS**:
P2P is a distributed network architecture where each participant (also known as a node) acts as both a client and a server
Unlike the traditional client-server model, P2P allows direct communication between nodes without the need for relay through a central server

[PeerJS](https://peerjs.com/): A JavaScript library based on WebRTC for simplifying P2P communication implementation
![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)
![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

## [Online Version-> https://aiksxd.github.io/PeerApps/PeerLive/index.html](https://aiksxd.github.io/PeerApps/PeerLive/index.html)

### Instructions:
1. Use browser/app to load the homepage(index.html) with available Internet,
> [if can't connect to a network name, directly enter by **room ID** / Create room with **pravite** option]
![Step-1](https://github.com/aiksxd/material/blob/main/img/Live-Step-1.png)

+ [For Host]
2. Clicks **Create Room** and then clicks **Stream Source** button in room setting to set your stream
![Host-Step-2](https://github.com/aiksxd/material/blob/main/img/Host-Step-2.png)

+ [For Audiences]
2. After completing step one, audience members can view all active rooms, click it and click **auto Join**(or input room ID for directly jumping to room page)
![Audience-Step-2](https://github.com/aiksxd/material/blob/main/img/Audience-Step-2.png)

### **SRS support**：
1. run srs with webRTC support(**1. Only choose one of them**)
> + windows/linux local app
> [Download SRS app to run then go to 2.](https://github.com/ossrs/srs/releases)
> + If you know Chinese, you can try using the windowsSRS&OBS one-click installation script
> [One-click installation script link](https://github.com/aiksxd/P2P-Live-Web/releases/download/v13/Window-Peerlive_0.1.0_x64-setup.exe)
> + bat script
> [srs-rtmp2rtc.bat script link](https://github.com/aiksxd/P2P-Live-Web/blob/main/srs-rtmp2rtc.bat)
> + Of course you can create and run srs-rtmp2rtc.bat yourself in Windows. You can directly copy the following text and paste it into Notepad and change the name to srs-rtmp2rtc.bat
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

2. push **rtmp** stream，pull in web of **Stream Source** button with the key of stream and click the button of **share SRS Media Stream** in the zone of SRS api(localhost is the address of server, next void one is the key of stream which you need to input)
3. NOTICE!: When setting up the stream, choose the hardware encoder and disable the B-frame function; otherwise, frame drops may occur!!
![Host-Step-3](https://github.com/aiksxd/material/blob/main/img/Host-Step-3-en.png)

### **Considerations**:
1. If the connection is established before the host starts sharing the media stream, clicking the button again will **refresh the received media stream**(or refresh web)
2. In the event of the host losing connection, the information from the host's child nodes will not be transmitted to other host's child nodes
3. Video quality may initially be blurry when passed from child nodes to sub-child nodes; waiting for synchronization may resolve this (quality synchronization observed after 26 seconds in a test)
4. By default, index request the id of "P2P-Live-Web-Default-Id"

### **Considerations**:
1. The **root node** has the **highest priority for streaming**, overriding all child nodes and their subsequent children's live streams
2. **Live media streams are only pushed to child nodes**, unlike the information channel where messages can be received from any node. Therefore, it is advisable for the connected root node to be a live streaming node or monitor (**unidirectional media streaming, bidirectional text messaging**).

### Commonly used arrays
+ nodesMap[ **0.dataTypes**: 1, **1.sourceMark**: 0(child)/1(host), **2.ids Of Members In Room**, **3.roomType**, **Live_Title**, **Live_Summary**, **Live_CoverURL**, **host_Id**, **host_Name**, **child_Nodes**, **root_Id**, **conference_Map**]

+ childNodes[ **0.dataTypes**: 1, **1.sourceMark**: 1(host), **2.Number Of child Nodes**: number, **3.unused for your extension**, **4.own_Id**, **5.own_Name**, **6.unused for your extension**, **7.here_A_Id**, **8.here_A_name**, **9.here_Nodes_Of_Child_A**, **10.here_B_Id**...]

+ hereNodes[ **0.dataTypes**: 1, **1.sourceMark**: 0(child), **2.Number Of child Nodes**: number, **3.unused for your extension**, **4.own_Id**, **5.own_Name**, **6.unused for your extension**, **7.here_A_Id**, **8.here_A_name**, **9.here_Nodes_Of_Child_A**, **10.here_B_Id**...]

+ iframeWindow.postMessage[ **0.dataTypes**: 0(switch setting value)/1(change theme), **1.sourceMark**: value]

### mark
+ dataTypes: 0 -> msg, 1 -> nodes Collecter, 2 -> streaming request, 3 -> remingder of replacing the parent node, 4 -> application of refresh media stream

+ Connection Mark: 0: parent, 1: guest(for the index), 2: bridge(when connect circle), 3: root, 4: indexRoot(for the index)

## Issue: 
### Connect without feedback(failed):
Due to the inherent limitations of P2P,establishing connections between some networks can be challenging, but this can be resolved by bridging networks

## **About Local Peer Server**:

(**ignore it if you don't run peerjs server locally**):

### PeerServer
Need to install nodejs at first, and then use its npm to install peer
```
npm install peer -g
```
-g is selective if you only want to use in a folder
local peer server run command(value of path need to be united on web & terminal):
```
 peerjs --port 9000 --key peerjs --path /myapp Started PeerServer on ::, port: 9000, path: /myapp
```