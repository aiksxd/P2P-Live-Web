- [中文文档](README_CN.md)

### **About P2P & PeerJS**:
> P2P is a distributed network architecture where each participant (also known as a node) acts as both a client and a server
> Unlike the traditional client-server model, P2P allows direct communication between nodes without the need for relay through a central server

> PeerJS: PeerJS is a JavaScript library based on WebRTC for simplifying P2P communication implementation

![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)

### Update(only multi-room Version):
+ Auto-join & Auto-reconnect
+ custome room title, summary, cover
+ Nodes Map display(displayed alternately on the left and right & Double-click to join)
+ By default, Root request the id of "P2P-Live-Web-Default-Id" and others connect to it(It made better index connection. if your root id has already been occupied, you need to delete or modify it)

### Next Version Plan:
+ refresh fn redo!
+ Auto-clean message
+ single file update
+ new media source
+ css, rename...

## [Single Room Type Live Streaming](https://aiksxd.github.io/P2PLiveWeb.html)
### Instructions:
1. Load the file **locally** or **access directly** via the following links
2. The broadcaster clicks the **Start Local Stream** button and shares their ID with the audience
3. The audience can connect to any broadcaster's ID, but the connection must remain uninterrupted If the connection is broken in the middle, a new connection object is required

## [Multi-Room Type (URL->ROOT)](https://aiksxd.github.io/P2PLiveRoot.html)
*if someone has already opened root page on the Internet, you can directly use [URL -> Index](https://aiksxd.github.io/P2PLiveIndex.html)*
+ Instructions of files:
+ P2PLiveindex.html serves as the website homepage (displaying rooms ready for live streaming and providing entry points)
+ P2PLiveRoot.html acts as the website's root node (responsible for monitoring and providing all IDs of live stream initiators to the homepage)
+ P2PLiveHost.html & P2PLiveAudience.html are auxiliary pages placed in the same directory
### Instructions:
+ [For Server]
1. open the root node page & share it to users(modify deafult_Id in files. it may has already been occupied)

+ [For users]
1. Visit the homepage(P2PLiveindex.html) (the root node page contains hyperlinks), [enter the **root node's ID**, and click the **Connect** button(deafault connect id can be modified in file)]
2. The broadcaster clicks **Go To Live** and then **Share Local Stream**
3. After completing step one, audience members can view all active live streaming rooms under the root node (based on the connectivity status of the live streaming pages)

## **Considerations**:
1. The **root node** has the **highest priority for streaming**, overriding all child nodes and their subsequent children's live streams
2. **Live media streams are only pushed to child nodes**, unlike the information channel where messages can be received from any node. Therefore, it is advisable for the connected root node to be a live streaming node or monitor (**unidirectional media streaming, bidirectional text messaging**).
3. If the connection is established before the host starts sharing the media stream, clicking the button again will **refresh the received media stream**
4. This file combines **sender and receiver into one**, relying solely on the frontend. This means that everyone's permissions are equal. If deployed in a development or insecure environment, content should be encapsulated and permission levels set
5. In the event of the host losing connection, the information from the host's child nodes will not be transmitted to other host's child nodes
6. Video quality may initially be blurry when passed from child nodes to sub-child nodes; waiting for synchronization may resolve this (quality synchronization observed after 26 seconds in a test)
7. By default, Root request the id of "P2P-Live-Web-Default-Id" and others connect to it(It made better index connection. if your root id has already been occupied, you need to delete or modify it)

### Extensions:
1. For the multi-room type, by creating a root node on your own device, deploying the remaining pages on the web site, and specifying the root node connection, you can implement a simple live streaming website
2. For the single live room type, similarly, create a page on your own, start streaming after obtaining the ID, deploy another page on the web, and specify the ID connection to achieve a specific live room

### Adapting and Expanding Streaming Sources
+ The desktop stream is obtained by default using MediaDevices.getDisplayMedia(), which means that it only shares the desktop. This also implies that **most mobile devices** are unable to initiate live streams and can **only receive media streams and text information**. Additionally, this functionality requires operation in a local development environment or under HTTPS to function properly
+ If there is a need for mobile screen streaming, accessing the camera, taking photos, etc., you can refer to the getUserMedia() API and modify the page's getLocalStream() function

### For **P2P-Live-web**
 it employs a **node-based delivery** that allows data to be passed directly from one node to another, enabling the same text interaction message to be received by anyone connected without relying on a central server, thus significantly reducing network latency
 
 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

### Commonly used arrays
+ nodesMap[ **msgClass** -> 1, **source**: 0(child)/1(host), **Total number of child nodes**: number, **all of ids in room**: **todo**, **Live_Title**, **Live_Summary**, **Live_CoverURL**, **host_Id**, **host_Name**, **child_Nodes**, **root_Id**]

+ child_Nodes[ **msgClass** -> 1, **source**: 0(child)/1(host), **Total number of child nodes**: number, **all of ids in room**: **todo**, **own_Id**, **own_Name**, **temp_recorder**, **child_A_Id**, **child_A_name**, **child_Nodes_Of_Child_A**, **child_B_Id**...]

### mark
+ msgClass: 0 -> msg, 1 -> nodes Collecter, 2 -> streaming request, 3 -> remingder of replacing the parent node

## Issue: 
### Connect without feedback(failed):
Due to the inherent limitations of P2P,establishing connections between some networks can be challenging, but this can be resolved by bridging networks

### Regarding **exchange**
it is **only used for bilateral** exchange of media streams rather than transmission. Both the connecting and receiving parties need to submit media streams. If a third party is added, one person's media stream will be **overwritten**
- [e.g.Exchange](https://aiksxd.github.io/e.g.exchange.html)

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
