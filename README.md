- [中文文档](README_CN.md)

# P2P-Live-Web

## Usage:
1. Load the file **locally** or **access directly** via the following links, etc.
+ [P2P Live Web](https://aiksxd.github.io/P2PLiveWeb.html)
2. The broadcaster clicks the **Start Local Stream** button and shares their ID with the audience.
3. The audience can connect to any broadcaster's ID, but the connection must remain uninterrupted. If the connection is broken in the middle, a new connection object is required.

## **Considerations**:
1. The **root node** has the **highest priority for streaming**, overriding all child nodes and their subsequent children's live streams.
2. **Live media streams are only pushed to child nodes**, unlike the information channel where messages can be received from any node. Therefore, it is advisable for the connected root node to be a live streaming node (**unidirectional media streaming, bidirectional text messaging**).
3. If the connection is established before the host starts sharing the media stream, clicking the Connect button again will **refresh the received media stream**.
4. This file combines **sender and receiver into one**, relying solely on the frontend. This means that everyone's permissions are equal. If deployed in a development or insecure environment, content should be encapsulated and permission levels set.
5. In the event of the host losing connection, the information from the host's child nodes will not be transmitted to other host's child nodes.
Note: Desktop stream is obtained by **MediaDevices.getDisplayMedia()** by default, which means **most mobile devices** cannot initiate live streaming and can **only receive media streams and text messages**. It also requires a local development environment or HTTPS to work properly. If needed, you can **modify the getLocalStream() function yourself**.

### For **P2P-Live-web**
 it employs a **node-based delivery** that allows data to be passed directly from one node to another, enabling the same text interaction message to be received by anyone connected without relying on a central server, thus significantly reducing network latency.
 
 ![DeliverGIF](https://github.com/aiksxd/material/blob/main/img/DeliverGIF.gif)

### Regarding **exchange**
it is **only used for bilateral** exchange of media streams rather than transmission. Both the connecting and receiving parties need to submit media streams. If a third party is added, one person's media stream will be **overwritten**.
- [Exchange](https://aiksxd.github.io/exchange.html)

## Issue: 
### Connect without feedback(failed):
Due to the inherent limitations of P2P,establishing connections between some networks can be challenging, but this can be resolved by bridging networks.
### Clean disconnected nodes
haven't done.

### Regarding obtaining the connection status of all nodes: 
Although the data transmission between nodes has been completed, due to my limited abilities, the function to parse the array has not been implemented yet.
However, you can still capture the **nodesMap** array in the **built-in console of any node's browser**, which contains all connection IDs and relationships from the root node to child nodes. Its structure is as follows:
`[parentID, [childsIDs], null, 1]`
+ **parentID** is the **root node**.
+ **childsIDs** are the **child nodes of the root node (if a child node has no children, it is the ID value; if it has children, it is a nested array with the same format)**.
+ null is used to distinguish the information channel.
+ 1 indicates that the network information originates from the root node (each time a new node joins, it is transmitted along the line to the root node, which then consolidates and distributes it to various nodes; during the consolidation process, this value is 0).

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

+ **About Local Peer Server**:
(**ignore it if you don't run peerjs server locally**):
Need to install nodejs at first, and then use its npm to install peer
```
npm install peer -g
```
-g is selective if you only want to use in a folder
local peer server run command(value of path need to be united on web & terminal):
```
 peerjs --port 9000 --key peerjs --path /myapp Started PeerServer on ::, port: 9000, path: /myapp
```

