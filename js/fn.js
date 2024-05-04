/* PS(ignore it if you don't run peerjs server locally):
    Need to install nodejs and use its npm to install peerjs(npm install peer -g)(-g is selective if you only want to use in a folder) at first 
    local peerjs run command(value of path need to be united):
    "
        peerjs --port 9000 --key peerjs --path /myapp Started PeerServer on ::, port: 9000, path: /myapp
    "
*/
// choose one of both
// const peer = new Peer({ host: 'localhost', port: 9000, path: '/myapp', debug: 2})     //if you use local peer server
const peer = new Peer({ debug: 2})      //use PeerJS official server
let roomIds = new Array();
let bridge = null;
let guest = null;
let guests = new Array();
let temporaryChosedNodes = new Array();
var liveCoverBase64 = null;
var msgImgBase64 = null;
var fullWebVideoTimes = 0;

function tryConnect(object, id, ifJump, ifAskForMediaStream){
    // object:
    // 0: parent
    // 1: guest
    // 2: bridge
    // 3: root
    // 4: indexRoot
    switch (object) {
        case 0:
            // Close old connection
            if (parent) {
                parent.close();
                // [ mark of sorting, myId, number of who be effected, if keep parent firmly here ]
                liveSend([3, peer.id, 0, false]);     // remind child node change parentNode
            }
            parent = peer.connect(id);

            parent.on('open', () => {
                // changingParentConnection = false;
                parent.send(hereNode);
                document.getElementById("status").innerHTML="Status: Connected to Live Room Successfully!"
                appearMsg([ 0, null, "System", "Connected successfully"]);
            });
            
            // parent.on('error', (err) => {
            //     document.getElementById("status").innerHTML="Status: Connecting Failed!" + err;
            // });

            // Receive the reply of text: Host --> Guset
            parent.on('data', (data) => {
                // data[0]:
                //  0: nodeInfo or indexRoomInfo 
                //  1: msg
                //  2: streaming request
                //  3: for reconnect: Remind the child node to replace the parent node
                //  4: for refresh: apply to the new media Stream for daliver to child
                switch (data[0]) {
                    case 0:
                        // console.log('Received data:', data); // DEBUG
                        deliverId = data[1];
                        data[1] = peer.id;  // make sure msg[2] keep last id of deliver
                        
                        if ( liveSend(data) > 0 ) {
                            console.log("Msg delivered successfully: " + data);
                        }else{console.log('Msg delivered failed');}
                        
                        appearMsg(data);
                        break;
                    case 1:
                        if (data[1] == -1){ break; }    // refused to receive msg for guest
                        recorder(data);
                        break;
                    case 3:     // for single version
                        if(data[2] > 0 || data[3] == true){    // if it isn't the first node without correct parent node -> didn't auto changing the parent node
                            RemoteVideo.src = null;
                            remoteStream = null;
                            mediaOpen.close();
                            data[2]++;
                            // optional setting
                            // if(data[2]%5 == 0){
                            //     autoJoin(nodesMap, 2, 0);
                            // }
                            liveSend(data);
                            document.getElementById("status").innerHTML="Status: awaitng parent node autoReConnect to room( You can also ReConnect by yourself)!"
                            // get the new nodeMap
                            guest = peer.connect(nodesMap[7])
                            guest.on('data', (data) => {
                                nodesMap = data;
                                autoJoin(3);
                                guest.close();
                            })
                            break;
                        }
                        // changingParentConnection = true;
                        parent.close();
                        if(document.getElementById('ifAutoReconnect').checked){
                            data[2]++;   // report child nodes await parent autoReConntect room
                            liveSend(data);     
                            // get the new nodeMap
                            guest = peer.connect(nodesMap[7])
                            guest.on('data', (data) => {
                                nodesMap = data;
                                autoJoin(3);
                                guest.close();
                            });
                        } else {
                            data[3] = true;
                            liveSend(data);
                        }
                        break;
                    case 4:
                        // if deliver without meida stream
                        if(awaitedNodeId){
                            if(connIds.includes(awaitedNodeId)){
                                conns[connIds.indexOf(awaitedNodeId)].send([4]);
                                awaitedNodeId = null;
                            }
                        } else {
                            alert("host is not on live");
                        }
                    default:
                        console.log("unknown data: " + data);
                }
            });

            parent.on('close', () => {
                document.getElementById("status").innerHTML="Status: Room Connection Closed. Please Refresh the Connection!"

                if(document.getElementById("ifAutoReconnect").checked){
                    document.getElementById("status").innerHTML="Status: Reconnecting to room...";
                    
                    autoJoin(3);
                    
                }
            });
            break;
            
        case 1:
            if(guest){if(guest.open){
                guest.close();
            }}
            guest = peer.connect(id);
            
            if(ifJump){
                guest.on('open', () => {
                    for(var i=0; i<guests.length; i++){
                        guest = guests[i];
                        guests = new Array();   // break all of conn
                        ifConnectedAim = true;
                        document.location.href = "./P2PLiveAudience.html?id="+ guest.peer +"&name="+ getMyName();
                        // console.log("aim id of node: "+ guest.peer)  // DEBUG
                        break;
                    }
                });
                if(! ifConnectedAim){
                    guests.push(guest);
                }
            } else {
                if(ifAskForMediaStream){
                    guest.on('open', () => {
                        guest.send([2, peer.id, getMyName()]);
                    });
                    
                    peer.on('call', (mediaOpenPort) => {
                        mediaOpen = mediaOpenPort;
                        // Receive the stream
                        mediaOpen.on('stream', (stream) => {
                            localStream = stream;
                            if( ! document.getElementById("ifNotDisplayLocalStream").checked){
                                displayStream(stream);
                            }
                        });
                        mediaOpen.answer(null);
                    });
                } else {
                    guest.on('data', (data) => {
                        for(var i=0; i<guests.length; i++){
                            if(guests[i].open){     // maybe useless
                                guest = guests[i];
                                guests = new Array();   // break all of conn
                                nodesMap = data;
                                ifConnectedAim = true;
                                guest.on('data', () => {
                                    ifConnectedAim = false;
                                });
                                break;
                            }
                        }
                    });
                    if(! ifConnectedAim){
                        guests.push(guest);
                    }
                }
            }
            break;
        case 2:
            if (bridge) {
                bridge.close();
            }
            bridge = peer.connect(id);
            alert("try to connect someone in rooms");
        case 3:
            // Close old connection
            if (root) {
                root.close();
            }

            document.getElementById("status").innerHTML="Status: Connecting..."
                
            root = peer.connect(id);

            root.on('open', () => {
                root.send(nodesMap);
                document.getElementById("status").innerHTML="Status: Connected to Root Node Successfully!"
            });
            
            root.on('close', () => {
                document.getElementById("status").innerHTML="Status: Root Connection Closed!"; 
                if(document.getElementById("ifAutoReconnect").checked){
                    document.getElementById("status").innerHTML="Status: Reconnecting to last Root Node...";
                    
                    tryConnect(0, urlInfo[0], false);
                }
            });
            break;
        case 4:
            // Close old connection
            if (root) {
                root.close();
            }

            root = peer.connect(id);
            
            root.on('open', () => {
                document.getElementById('connectButton').innerHTML="Refresh";
                document.getElementById('peerId').value=id;
                document.getElementById("status").innerHTML="Status: Connected to Root Node Successfully!"
            });

            document.getElementById("peerId").addEventListener(
                "focusout",
                () => {
                    if (document.getElementById('peerId').value != id){
                        document.getElementById('connectButton').innerHTML="Connect";
                    }
                },
                true,
            );

            // Receive the reply of text: Host --> Guset
            root.on('data', (data) => {
                // data[0]:
                //  0: msg
                //  1: nodeInfo or indexRoomInfo 
                //  2: roomInfoModfied
                //
                // Info of rooms from root received
                appearRooms(data);
                rooms = data;
                console.log("Room list received");
            });

            root.on('close', () => {
                // root = null;
                document.getElementById("status").innerHTML="Status: Root Connection Closed!";
                document.getElementById('connectButton').innerHTML="Connect";
                
                if(document.getElementById("ifAutoReconnect").checked){
                    document.getElementById("status").innerHTML="Status: Reconnecting to last Root Node...";
                    
                    tryConnect(0, connectHistroy.slice(-1)[0], false);
                    // document.getElementById("status").innerHTML="Status: Root Reconnection Failed!";
                }
            });
            break;
        default:
            console.log("tryConnect Error");
            break;
    }
}

function autoJoin(t){
    if(nodesMap[1] !== 1){
        console.log("Error: try autoJoin() by the nodesMap which wasn't from Root of Room"+ nodesMap);
        return;
    }
    if(nodesMap[2] < t){        // host node has low child nodes
        tryConnect(1, nodesMap[7], true);
    } else {
        recursiveSearch(nodesMap[9], t, 1);   // search for the node with low child nodes
    }
}

function getRoomIds(){
    roomIds = new Array();
    recursiveSearch(nodesMap[9], 999, 0);
    return roomIds;
}

function recursiveSearch(arr, t, fnOfSearch){
    switch(fnOfSearch){
        case 0:     // search for getting ids of room
            for (var i = 7; i < arr.length; i=i+3) {
                if(arr[i] && arr[i + 2] instanceof Array){
                    if(arr[i + 2][2] < t){
                        roomIds.push(arr[i]);
                    }
                }
            }
            for (var m = 9; m < arr.length; m=m+3) {    // After checked out suited nodes in thid layer, search their suited child nodes
                if(arr[m] && arr[m] instanceof Array){
                    recursiveSearch(arr[m], t, 0);
                }
            }
            break;
        case 1:
            shallowSearch(arr, t);
            while (temporaryChosedNodes[0] !== undefined) {
                deepSearch(temporaryChosedNodes, t);
            }
            break;
        default:
            break;
    }
}

function shallowSearch(arr, t){
    for (var i = 7; i < arr.length; i=i+3) {
        if(arr[i] && arr[i + 2] instanceof Array){
            if(arr[i + 2][2] < t){
                if(ifConnectedAim){break;}
                // console.log("tried connect to: "+ arr[i]);  // DEBUG
                tryConnect(1, arr[i], true, false);
            } else {
                temporaryChosedNodes.push(arr[i+2]);    // record inapporpriate nodes for deep search
            }
        }
    }   // else { console.log("give up connecting to "+ arr[i]); }
}

function deepSearch(arr, t){
    var counter = arr.length;
    lastTemporaryChosedNodes = arr;
    temporaryChosedNodes = new Array();
    for (var w = 0; w < counter; w=w+1) {
        shallowSearch(lastTemporaryChosedNodes[w], t);
    }
}

// Send Massage and avoid delivering repeatedly
function liveSend (msg){
    var aims = 0;     // count successful times
    if(parent){
        if( ! [msg[1], deliverId].includes(parent.peer)){    // Promise a stable sending
            if(parent.open){     // check the data channel
                parent.send(msg);
                aims++;  // count successful times
            }
        }
    }
    if(audiences){
        for(var i=0; i<audiences.length; i++){
            if(audiences[i]){
                if( ! [msg[1], deliverId /*, parent.id */].includes(audiences[i].peer)){
                    if(audiences[i].open){
                        audiences[i].send(msg);
                        aims++;
                    }
                }
            }
        }
    }
    deliverId = null;    // avoid losing text when sending
    return aims;    //if == zero => send failed
}

function refreshMap(fnOfEcho){
    document.getElementById("roomTitle").innerHTML = nodesMap[4];
    document.getElementById("roomSummary").innerHTML = nodesMap[5];
    document.getElementById("roomCover").src = nodesMap[6];
    echoNodesMap(nodesMap[9], 0, undefined, fnOfEcho);    // refresh the menu
}

function echoNodesMap(arr, layerNumber, aimId, fnOfEcho){
    if(arr == nodesMap[9]){      // refresh Map for "refresh" & hostNode button
        layers = [0];
        if(aimId === undefined){     // hostNode button provide the channel connecting to host
            lastAimId = null;
        }
        lastLayerNumber = null;
        document.getElementById("block0").innerHTML = "";
        document.getElementById("block1").innerHTML = "";
    }
    if(lastAimId === aimId){  // if second click on same button
        switch (fnOfEcho) {
            case 0:     // button for getting id
                if(aimId){
                    alert(aimId);
                }
                break;
            case 1:     // button for joining a node
                if(aimId == peer.id){alert(aimId);break;}
                document.location.href = "./P2PLiveAudience.html?id=" + aimId +"&name="+ getMyName();
                break;
        }
    }else{
        document.getElementById("block"+ layerNumber % 2).innerHTML = "";
        if(lastLayerNumber === layerNumber ){
            layers.splice(lastLayerNumber + 1);  // remove all of old layers
        }
        if(arr){
            for(var i = 7; i < arr.length; i=i+3){
                if(arr[i + 2] instanceof Array){    // create buttons linking to child nodes of object which was delivered by clicked button
                    document.getElementById("block"+ layerNumber % 2).innerHTML = document.getElementById("block"+ layerNumber % 2).innerHTML + "<button class=\"childNodes\" onclick=\"echoNodesMap(layers["+ (layerNumber + 1) +"]["+ (i+2) +"], "+ (layerNumber + 1) +", layers["+ (layerNumber + 1) +"]["+ i +"], "+ fnOfEcho +" )\">"+ arr[i + 1] +"</button><br />";
                }
            }
        }
        layers.push(arr);
        lastLayerNumber = layerNumber;
        lastAimId = aimId; // original id of this layer
    }
}

// *Explanation: This comment indicates that the following code block is responsible for sending a message.
// *It serves as a brief description of the purpose of the code.
function sendMsg() {   //*This line of code adds an event listener to the element with the ID "sendButton". It listens for a click event on the button and triggers the provided function when the event occurs.
    var msg = [ 0, peer.id, document.getElementById("name").value, document.getElementById("sendMessageBox").value, msgImgBase64];   //*This line of code creates an array called "msg" and assigns it two values. The first value is the value of the element with the ID "name", and the second value is the value of the element with the ID "sendMessageBox". These values are used to construct the message that will be sent.
    if (msg[3]){    // *This condition checks if the second element of the "msg" array (i.e., the message content) exists and is not empty.
        if ( liveSend(msg) > 0 ) {   // *This condition checks if the "liveSend" function returns a value greater than 0 when called with the "msg" array and 0 as arguments. If it does, it means the message was sent successfully.
            appearMsg(msg);     // This function is responsible for displaying the own sent message
            document.getElementById("sendMessageBox").value = "";
            // console.log("Sent successfully: " + msg);    // DEBUG
            msgImgBase64 = null;
            document.getElementById("msgImgInput").files = null;
        }else{console.log('Connection is closed');}
    }else{
        document.getElementById("sendMessageBox").setAttribute("placeholder","Void content!!!!!!!!!!!!!!"); //*This line of code sets the placeholder attribute of the element with the ID "sendMessageBox" to display a message indicating that the content should not be empty.
    }
}

function sendImg(){
    var file = document.getElementById("msgImgInput").files[0];
    var reader = new FileReader();
    if(file){
        if(file.size <= 1048576){
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                msgImgBase64 = reader.result;
            }
        } else {
            alert("it can't over 1MB");
        }
    } else {
        console.log("img transformed Error!");
    }
}

// add msg to box
function appearMsg(msg) {
    var now = new Date();
    if(msg[4]){
        var img = "<img style=\"max-width: 100px; max-height: 100px; object-fit: contain;\" src=\""+ msg[4] +"\">";
    } else {
        var img = "";
    }
    document.getElementById("message").innerHTML =  document.getElementById("message").innerHTML + "<div class=\"msgs\"><span class=\"time\">[" + now.getHours() +":"+ now.getMinutes() +":"+ now.getSeconds() + "]</span>" + "<span class=\"usr\">"+ msg[2] + ": </span>" + msg[3] + img +"</div>";
    if(ifAutoScroll){
        document.getElementById('message').scrollTop = document.getElementById('message').scrollHeight;
    }
    if(ifAutoClean.checked){
        var msgs = document.getElementsByClassName("msgs");
        var numberOfMsgs = msgs.length;
        if(numberOfMsgs > 100){
            var deltaNumber = numberOfMsgs - 100;
            for(var i=0; i <= deltaNumber; i++){
                msgs[i].remove();
                numberOfMsgs--;
            }
        }
    }
}

function getMyName(){
    if(MyName){
        if (MyName.value){
            return MyName.value;
        } else {
            return peer.id;
        }
    }
}

// the function of getting local stream(It can't work on most of mobile phone)
// Please note! In order for the getDisplayMedia() method to work properly, you need to use the HTTPS protocol or run it on localhost in a local development environment.
// Otherwise, the browser may restrict access to the camera and microphone.
function useDisplayMedia() {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
            // After successfully obtaining the local stream, display it on the page.
            if( ! document.getElementById("ifNotDisplayLocalStream").checked){
                displayStream(stream);  // for debug
            } else {
                WebVideo.srcObject = null;
            }
            localStream = stream;
            console.log("Local stream shared");
        })
        .catch((error) => {
            console.error('Error getting local stream:', error);
        });
}

function askNavigatorMediaDevices(){
    var constraints = { audio: document.getElementById("ifUseCamera").checked, video: document.getElementById("ifUseMicrophone").checked };
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            // After successfully obtaining the local stream, display it on the page.
            if( ! document.getElementById("ifNotDisplayLocalStream").checked){
                displayStream(stream);  // for debug
            } else {
                WebVideo.srcObject = null;
            }
            localStream = stream;
            console.log("Local stream shared");
        })
        .catch(function (err) {
            console.error('Error getting local stream:', err);
        });
}
        
// display the remote stream and try to play it(if usr didn't do anything on web maybe be prohibited)
function displayStream(stream) {
    if(WebVideo.srcObject){
        WebVideo.srcObject = null;
    }
    WebVideo.srcObject = stream;
}

function refreshMedia(){
    if(remoteStream){
        displayStream(remoteStream);
    } else if(parent){
        if(parent.open){
            parent.send([4, peer.id]);
        }
    } else if(localStream){
        displayStream(localStream);
    }
}

// transform Img into Base64
function liveCoverInput(){
    var file = document.getElementById("LiveCoverInput").files[0];
    var reader = new FileReader();
    if(file){
        if(file.size <= 1048576){
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                liveCoverBase64 = reader.result;
            }
        } else {
            alert("it can't over 1MB");
        }
    } else {
        console.log("img transformed Error!");
    }
}

function fullWebVideo(){
    if(fullWebVideoTimes === 0){
        WebVideo.style.height = window.innerHeight + "px";
        WebVideo.style.width = window.innerWidth + "px";
        window.scrollBy({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
        fullWebVideoTimes++;
    } else {
        WebVideo.style.height = "100%";
        WebVideo.style.width = "100%";
        fullWebVideoTimes = 0;
    }
    
}
