- [中文文档](README_CN.md)

### **About P2P & PeerJS**:
P2P is a distributed network architecture where each participant (also known as a node) acts as both a client and a server
Unlike the traditional client-server model, P2P allows direct communication between nodes without the need for relay through a central server

PeerJS: A JavaScript library based on WebRTC for simplifying P2P communication implementation

![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)

### Update:
+ separete FiveOnline project
+ fix the info of room lost
+ UI adjust
+ Room List update more frequently

### Next Version Plan:
+ media stream extend
+ new indenpent voice channel
+ single version update

## [Multi-Room Type](https://aiksxd.github.io/P2PLiveIndex.html)
+ Instructions of files:
+ P2PLiveIndex.html serves as the website homepage (displaying rooms ready for live streaming and providing entry points)
+ P2PLiveHost.html & P2PLiveAudience.html are auxiliary pages placed in the same directory
### Instructions:
+ [For Audiences]
1. Use browser to load the homepage(P2PLiveIndex.html) with available Internet, [if can't connect to the root node, directly enter and connect room ID]
2. After completing step one, audience members can view all active rooms, click it and click **auto Join**(or input room ID for directly jumping to room page)
+ [For Host]
1. Visit the homepage(P2PLiveIndex.html), [create pravite room or enter and connect a root ID]
2. Clicks **Create Room** and then clicks **Stream Source** button

### **Considerations**:
1. If the connection is established before the host starts sharing the media stream, clicking the button again will **refresh the received media stream**(or refresh web)
2. In the event of the host losing connection, the information from the host's child nodes will not be transmitted to other host's child nodes
3. Video quality may initially be blurry when passed from child nodes to sub-child nodes; waiting for synchronization may resolve this (quality synchronization observed after 26 seconds in a test)
4. By default, index request the id of "P2P-Live-Web-Default-Id"


## [Single Room Type Live Streaming](https://aiksxd.github.io/SingleP2PLiveVersion.html)
### Instructions:
1. Load the file **locally** or **access directly** via the following links
2. The broadcaster clicks the **Start Local Stream** button and shares their ID with the audience
3. The audience can connect to any broadcaster's ID, but the connection must remain uninterrupted If the connection is broken in the middle, a new connection object is required

### **Considerations**:
1. The **root node** has the **highest priority for streaming**, overriding all child nodes and their subsequent children's live streams
2. **Live media streams are only pushed to child nodes**, unlike the information channel where messages can be received from any node. Therefore, it is advisable for the connected root node to be a live streaming node or monitor (**unidirectional media streaming, bidirectional text messaging**).

### For **P2P-Live-web**
 it employs a **node-based delivery** that allows data to be passed directly from one node to another, enabling the same text interaction message to be received by anyone connected without relying on a central server, thus significantly reducing network latency
 
 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

### Commonly used arrays
+ nodesMap[ **0.dataTypes**: 1, **1.sourceMark**: 0(child)/1(host), **2.ids Of Members In Room**, **3.roomType**, **Live_Title**, **Live_Summary**, **Live_CoverURL**, **host_Id**, **host_Name**, **child_Nodes**, **root_Id**]

+ childNodes[ **0.dataTypes**: 1, **1.sourceMark**: 1(host), **2.Number Of child Nodes**: number, **3.unused for your extension**, **4.own_Id**, **5.own_Name**, **6.unused for your extension**, **7.here_A_Id**, **8.here_A_name**, **9.here_Nodes_Of_Child_A**, **10.here_B_Id**...]

+ hereNodes[ **0.dataTypes**: 1, **1.sourceMark**: 0(child), **2.Number Of child Nodes**: number, **3.unused for your extension**, **4.own_Id**, **5.own_Name**, **6.unused for your extension**, **7.here_A_Id**, **8.here_A_name**, **9.here_Nodes_Of_Child_A**, **10.here_B_Id**...]

### mark
+ dataTypes: 0 -> msg, 1 -> nodes Collecter, 2 -> streaming request, 3 -> remingder of replacing the parent node, 4 -> application of refresh media stream
> for game+: 6 -> Game Info, 7 -> Game Chessman, 8 -> Game Player

+ Connection Mark: 0: parent, 1: guest(for the index), 2: bridge(when connect circle), 3: root, 4: indexRoot(for the index)

## Issue: 
### Connect without feedback(failed):
Due to the inherent limitations of P2P,establishing connections between some networks can be challenging, but this can be resolved by bridging networks

### Regarding **exchange**
it is **only used for bilateral** exchange of media streams rather than transmission. Both the connecting and receiving parties need to submit media streams. If a third party is added, one person's media stream will be **overwritten**
- [Exchange](https://aiksxd.github.io/exchange.html)

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
### Modify JS path
Modify path of remote peerjs.min.js to local path of js in headP (example)
```
<script src="js/peerjs.min.js"></script>

<!--script src="https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js"></script-->
```
