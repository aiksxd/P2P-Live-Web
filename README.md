- [中文文档](README_CN.md)

# P2P-Live-Web
PS: All messages will be replied to once every 2 to 3 weeks.

## [Single Room Type Live Streaming](https://aiksxd.github.io/P2PLiveWeb.html)
### Instructions:
1. Load the file **locally** or **access directly** via the following links, e.g..
2. The broadcaster clicks the **Start Local Stream** button and shares their ID with the audience.
3. The audience can connect to any broadcaster's ID, but the connection must remain uninterrupted. If the connection is broken in the middle, a new connection object is required.

## [Multi-Room Type (URL->ROOT)](https://aiksxd.github.io/e.g.P2PRootMonitor.html)
+ Version Modified Example:
+ e.g.P2PLiveindex.html serves as the website homepage (displaying rooms ready for live streaming and providing entry points)
+ e.g.P2PRootMonitor.html acts as the website's root node (responsible for monitoring and providing all IDs of live stream initiators to the homepage)
+ e.g.P2PLiveHost & Guest.html are auxiliary pages placed in the same directory
### Instructions:
1. Visit the homepage (the root node page contains hyperlinks), enter the **root node's ID**, and click the **Connect** button
2. The broadcaster clicks **Go To Live** and then **Share Local Stream**
3. After completing step one, audience members can view all active live streaming rooms under the root node (based on the connectivity status of the live streaming pages)

### Extensions:
1. For the multi-room type, by creating a root node on your own device, deploying the remaining pages on the web site, and specifying the root node connection, you can implement a simple live streaming website.
2. For the single live room type, similarly, create a page on your own, start streaming after obtaining the ID, deploy another page on the web, and specify the ID connection to achieve a specific live room.
3. To customize the room list style, modify the parameters in the `guest.on('data', (data) => {` section of the live streaming page (e.g.P2PLiveHost). **Note: Do not modify the fifth parameter at index 4!**
4. Optimize the connection method by parsing the **nodesMap array** (containing all node information) yourself (Note: **e.g. version not tested**). The nodesMap of the broadcaster node contains all nested node information, while the **root node nodeMaps** = hostsPeers (excluding sub-child nodes). If you are not satisfied with the current nodesMap array collecting node information, consider **restructuring the recorder() method**. Depending on the broadcaster's device configuration, it is recommended to use a **multi-binary tree-style** connection method.

## **Considerations**:
1. The **root node** has the **highest priority for streaming**, overriding all child nodes and their subsequent children's live streams.
2. **Live media streams are only pushed to child nodes**, unlike the information channel where messages can be received from any node. Therefore, it is advisable for the connected root node to be a live streaming node or monitor (**unidirectional media streaming, bidirectional text messaging**).
3. If the connection is established before the host starts sharing the media stream, clicking the Connect button again will **refresh the received media stream**.
4. This file combines **sender and receiver into one**, relying solely on the frontend. This means that everyone's permissions are equal. If deployed in a development or insecure environment, content should be encapsulated and permission levels set.
5. In the event of the host losing connection, the information from the host's child nodes will not be transmitted to other host's child nodes.
6. Video quality may initially be blurry when passed from child nodes to sub-child nodes; waiting for synchronization may resolve this (quality synchronization observed after 26 seconds in a test).

### Adapting and Expanding Streaming Sources
+ The desktop stream is obtained by default using MediaDevices.getDisplayMedia(), which means that it only shares the desktop. This also implies that **most mobile devices** are unable to initiate live streams and can **only receive media streams and text information**. Additionally, this functionality requires operation in a local development environment or under HTTPS to function properly.
+ If there is a need for mobile screen streaming, accessing the camera, taking photos, etc., you can refer to the getUserMedia() API and modify the page's getLocalStream() function.

### For **P2P-Live-web**
 it employs a **node-based delivery** that allows data to be passed directly from one node to another, enabling the same text interaction message to be received by anyone connected without relying on a central server, thus significantly reducing network latency.
 
 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

### Regarding **exchange**
it is **only used for bilateral** exchange of media streams rather than transmission. Both the connecting and receiving parties need to submit media streams. If a third party is added, one person's media stream will be **overwritten**.
- [e.g.Exchange](https://aiksxd.github.io/e.g.exchange.html)

## Issue: 
### Connect without feedback(failed):
Due to the inherent limitations of P2P,establishing connections between some networks can be challenging, but this can be resolved by bridging networks.

### Regarding obtaining the connection status of all nodes: 
Although the data transmission between nodes has been completed, due to my limited abilities, the function to parse the array has not been implemented yet.
However, you can still capture the **nodesMap** array in the **built-in console of any node's browser**, which contains all connection IDs and relationships from the root node to child nodes. Its structure is as follows:
`[thisID, [childsIDs], null, 1]`
+ **thisID** which first of it is the **root node**.
+ **childsIDs** which first of them are the **child nodes of the root node (if a child node has no children, it is the ID value; if it has children, it is a nested array with the same format)**.
+ null is used to distinguish the information channel.
+ 1 indicates that the network information originates from the root node (each time a new node joins, it is transmitted along the line to the root node, which then consolidates and distributes it to various nodes; during the consolidation process, this value is 0).

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

## Others
+ **About P2P**:
> P2P is a distributed network architecture where each participant (also known as a node) acts as both a client and a server.
> Unlike the traditional client-server model, P2P allows direct communication between nodes without the need for relay through a central server.

![P2PGIF](https://github.com/aiksxd/material/blob/main/img/P2PGIF.gif)

+ **About PeerJS**:
> PeerJS: PeerJS is a JavaScript library based on WebRTC for simplifying P2P communication implementation.
> 
> Simplified API: PeerJS provides a simple and easy-to-use API that allows developers to quickly establish P2P connections and transfer data.
> It abstracts the complex WebRTC details, making the development process more convenient.


