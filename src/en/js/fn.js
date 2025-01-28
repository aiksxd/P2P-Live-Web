/* PS(ignore it if you don't run peerjs server locally):
    Need to install nodejs and use its npm to install peerjs(npm install peer -g)(-g is selective if you only want to use in a folder) at first 
    local peerjs run command(value of path need to be united):
    "
        peerjs --port 9000 --key peerjs --path /myapp Started PeerServer on ::, port: 9000, path: /myapp
    "
*/
// choose one of both
// const peer = new Peer({ host: 'localhost', port: 9000, path: '/myapp', debug: 2})     //if you use local peer server
/*
var peer = new Peer({
    config: {'iceServers': [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
    ]}
});
*/
language = 'en';

let roomIds = new Array();
let conferee = null;
let guest = null;
let guests = new Array();
let parent_Node = null;
let lastPopIndex = 0;
let pop_Doms = new Array();
let temporaryChosedNodes = new Array();
let liveCoverBase64 = null;
let msgImgBase64 = null;
let fullWebVideoTimes = 0;
let deliverId = null;
let conferee_Map = [[],[],[],[]];     // indexs, ids, names, stream.id
let conferee_Nodes = [];
let my_Conferee_Index = null;
let my_Conferee_Stream_Id = null;
let conference_Stream;
let not_Inputting = true;
let inputting_Timeout;
let textareas = document.querySelectorAll('textarea');
// let popContent = document.querySelectorAll('.pop_Content');
let active_confirm_Button;
let peer_Conn_Lock = false;
let last_Operation_Time = 0;
let keydownListener;
let params = new URLSearchParams(document.location.search.substring(1));
theme_Index = params.get("themeIndex");

if (theme_Index !== null) {
    change_Theme(theme_Index);
    document.getElementById('themeController').value = theme_Index;
} else if (use_Local_Storage) {
    theme_Index = localStorage.themeIndex;
}
// let large_Nodes_Map = [];   // with img
let myIcon = "";
let root = null;

function tryConnect(object, id, ifJump, ifAskForMediaStream){
    // object:
    // 0: parent_Node
    // 1: guest
    // 2: conferee
    // 3: hostRoot
    // 4: indexRoot
    switch (object) {
        case 0:
            // Close old connection
            if (parent_Node) {
                parent_Node.close();
                // [ mark of sorting, myId, number of who be effected, if keep parent_Node firmly here ]
                liveSend([3, peer.id, 0, false]);     // remind child node change parent_NodeNode
            }
            parent_Node = peer.connect(id);

            parent_Node.on('open', () => {
                // changingparent_NodeConnection = false;
                parent_Node.send(hereNode);
                document.getElementById("status").innerHTML="Status:✔ Connected to Live Room Successfully! ✔"
                appearMsg([ 0, null, "System", "Connected successfully"]);
            });
            
            // parent_Node.on('error', (err) => {
            //     document.getElementById("status").innerHTML="Status: Connecting Failed!" + err;
            // });

            // Receive the reply of text: Host --> Guset
            parent_Node.on('data', (data) => {
                // data[0]:
                //  0: msg
                //  1: nodeInfo or indexRoomInfo
                //  2: streaming request
                //  3: for reconnect: Remind the child node to replace the parent_Node node
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
                    case 3:     // remind reconnect
                        if(data[2] > 0 && data[3] == true){     // test to do
                            // if it isn't the first node without correct parent_Node node
                            // -> didn't auto changing the parent_Node node
                            RemoteVideo.src = null;
                            remoteStream = null;
                            data[2]++;
                            // optional setting
                            // if(data[2]%5 == 0){
                            //     autoJoin(nodesMap, 2, 0);
                            // }
                            liveSend(data);
                            document.getElementById("status").innerHTML="Status: awaitng parent_Node node autoReConnect to room( You can also ReConnect by yourself)!"
                            // get the new nodeMap
                            // guest = peer.connect(nodesMap[7])
                            // guest.on('data', (data) => {
                            //     nodesMap = data;
                            //     autoJoin(3, false, true);
                            //     guest.close();
                            // });
                            break;
                        }
                        // changingparent_NodeConnection = true;
                        parent_Node.close();
                        if(document.getElementById('ifAutoReconnect').checked){
                            data[2]++;   // report child nodes await parent_Node autoReConntect room
                            liveSend(data);
                            // get the new nodeMap
                            guest = peer.connect(nodesMap[7]);
                            guest.on('open', () => {});
                            guest.on('data', (data) => {
                                nodesMap = data;
                                autoJoin(3, false, true);
                            });
                            peer.on('close', function() { 
                                if (!ifConnectedAim) {
                                    autoJoin(3, false, true);
                                }
                            });
                        } else {
                            data[3] = true;
                            liveSend(data);
                        }
                        break;
                    case 4:
                        switch (data[1]) {
                            case 0:    
                                // if deliver without meida stream
                                if(awaitedNodeId){
                                    if(connIds.includes(awaitedNodeId)){
                                        conns[connIds.indexOf(awaitedNodeId)].send([4]);
                                        awaitedNodeId = null;
                                    }
                                } else {
                                    alert("host is not on live");
                                }
                                break;
                            default:
                                // remind new stream
                                parent_Node.send([4, peer.id]);
                                data[1] = peer.id;
                                liveSend(data);
                                break;
                        }
                    case 5:
                        switch (data[1]) {
                            case 1:      // append conferee dom
                                // console.log(data);  // debug
                                liveSend(data);
                                let new_Conferee = data[2];
                                if (new_Conferee[1] === peer.id) {
                                    my_Conferee_Index = new_Conferee[0];
                                    if (myIcon) {
                                        let i = 0;
                                        while (i < conferee_Nodes.length) {
                                            conferee_Nodes[i].send([5,3, my_Conferee_Index, null, myIcon, getMyName()])
                                            i++;
                                        }
                                    }
                                    let i = 0;
                                    while (i < nodesMap[11][1].length) {
                                        if (nodesMap[11][i] !== peer.id) {
                                            tryConnect(2, nodesMap[11][1][i]);
                                        }
                                        i++;
                                    }
                                }
                                nodesMap[11][0].push(new_Conferee[0]);
                                nodesMap[11][1].push(new_Conferee[1]);
                                nodesMap[11][2].push(new_Conferee[2]);
                                nodesMap[11][3].push(null);    // stream.id
                                if (document.getElementById("joinConference").checked) {
                                    append_Conferee_Dom(new_Conferee);
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        console.log("unknown data: " + data);
                }
            });

            parent_Node.on('close', () => {
                document.getElementById("status").innerHTML="Status:✘ Room Connection Closed. Please Refresh the Connection! ✘"

                if(document.getElementById("ifAutoReconnect").checked){
                    document.getElementById("status").innerHTML="Status: Reconnecting to room...";
                    autoJoin(3, false, true);
                    
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
                    for(let i=0; i<guests.length; i++){
                        guest = guests[i];
                        guests = new Array();   // break all of conn
                        ifConnectedAim = true;  // break search node
                        switch (nodesMap[3]) {  // room type
                            case 0:
                                if (ifJump === 2) {
                                    if (app_Mode) {
                                        window.parent.postMessage("P2PLiveAudience.html?id="+ guest.peer +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                                    } else {
                                        window.open("./P2PLiveAudience.html?id="+ guest.peer +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                                    }
                                } else {
                                    document.location.href = "./P2PLiveAudience.html?id="+ guest.peer +"&name="+ getMyName() + "&themeIndex="+ theme_Index;
                                }
                                break;
                            case 1:
                                if (ifJump === 2) {
                                    if (app_Mode) {
                                        window.parent.postMessage("P2PLiveAudience.html?id="+ guest.peer +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                                    } else {
                                        window.open("./P2PGameFiveOnLinePlayer.html?id="+ guest.peer +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                                    }
                                } else {
                                    document.location.href = "./P2PGameFiveOnLinePlayer.html?id="+ guest.peer +"&name="+ getMyName() + "&themeIndex="+ theme_Index;
                                }
                                break;
                            default:
                                console.log("unknown type of room: "+ nodesMap[3]);
                                break;
                        }
                        ifConnectedAim = false;
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
                    
                    peer.on('call', (mediaConnection) => {
                        // Receive the stream
                        mediaConnection.on('stream', (stream) => {
                            localStream = stream;
                            if( ! document.getElementById("ifNotDisplayLocalStream").checked){
                                displayStream(stream);
                            }
                        });
                        mediaConnection.answer(null);
                    });
                } else {        // reconnect & autoJoin() 
                    guest.on('data', (data) => {
                        for(let i=0; i<guests.length; i++){
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
            if (conferee) {
                conferee.close();
            }
            conferee = peer.connect(id);

            conferee.on('open', () => {
                if (myIcon) {
                    conferee.send([5,3, my_Conferee_Index, null, myIcon, getMyName()]);
                }
                if (conference_Stream) {
                    conferee.call(conference_Stream);
                }
                conferee_Nodes.push(conferee);
            });
            
            conferee.on('data', (data) => {
                switch (data[1]) {
                    case 2:
                        if (data[2]) {
                        } else {    // stop conference
                            let i = 1;  // without first dom
                            while (i < document.getElementsByClassName('conferees').length) {
                                document.getElementsByClassName('conferees')[i].remove();
                                i++;
                            }
                        }
                        break;
                    case 3:   // [5,3, my_Conferee_Index, my_Conferee_Stream_Id, myIcon, getMyName()]);
                            if (data[3]) {      // stream
                                nodesMap[11][3][data[2]] = data[3];
                                if (!parent_Node) {  // for host
                                    conferee_Map[3][data[2]] = data[3];
                                }
                            } else if (data[4]){    // img
                                document.getElementsByClassName('conferees')[data[2]].style.background = data[5];
                            }
                            document.getElementsByClassName('confereeName')[data[2]].innerHTML = data[6];
                            if (!parent_Node) {  // for host
                                conferee_Map[2][data[2]] = data[6];
                                liveSend(nodesMap);
                            }
                            break;
                    default:
                        break;
                }
            });

            conferee.on('close', () => {
                if (conferee_Map[1].includes(conferee.peer)) {
                    let delete_index = conferee_Map[1].indexOf(conferee.peer);
                    document.getElementsByClassName('conferees')[delete_index].remove();
                }
            });
            // alert("try to connect someone in rooms");
            break;
        case 3:     // 3: hostRoot
            // Close old connection
            if (root) {
                root.close();
            }

            root = peer.connect(id);

            document.getElementById("status").innerHTML="Status: Connecting..."
                
            root.on('open', () => {
                nodesMap[10] = root.peer;
                root.send(nodesMap);
                document.getElementById("status").innerHTML="Status:✔ Connected to Root Node Successfully! ✔"
            });
            
            root.on('close', () => {
                document.getElementById("status").innerHTML="Status:✘ Root Connection Closed!(Reconnect in Setting) ✘";
                // if(document.getElementById("ifAutoReconnect").checked){
                //     document.getElementById("status").innerHTML="Status: Reconnecting to last Root Node...";
                    
                //     tryConnect(0, urlInfo[0], false);
                // }
            });
            break;
        case 4:     // for Index
            // Close old connection
            if (root) {
                root.close();
            }
            if(connectHistroy.slice(-1)[0] != document.getElementById("peerId").value){
                connectHistroy.push(document.getElementById("peerId").value);
            }
            root = peer.connect(id);
            
            document.getElementById("status").innerHTML="Status: Connecting..."
            setTimeout(function() {
                if (root) {    
                    if (!root.open) {
                        document.getElementById("modifyNetWorkName").innerHTML="Connecting...(Too long time, try others?)"
                    }
                }
            }, 3000);
            
            root.on('open', () => {
                if (document.getElementById('modifyNetWorkName').style.opacity == 1) {
                    pop(document.getElementById('modifyNetWorkName'));
                }
                peer_Conn_Lock = false;
                document.getElementById("myid").innerHTML = "Your ID:<br/>" + peer.id;
                document.getElementById("status").innerHTML="Status:✔ Connected to Root Node Successfully! ✔"
            });

            // Receive the reply of text: Host --> Guset
            root.on('data', (data) => {
                // Info of rooms from root received
                rooms = data;
                appearRooms();
                console.log("Room list received");
            });

            root.on('close', () => {
                // root = null;
                document.getElementById("status").innerHTML="Status:✘ Root Connection Closed! ✘";
                document.getElementById("connectRoot").style.visibility = 'visible';
                // if(document.getElementById("ifAutoReconnect").checked){
                //     document.getElementById("status").innerHTML="Status: Reconnecting to last Root Node...";
                    
                //     tryConnect(4, connectHistroy.slice(-1)[0], false);
                //     // document.getElementById("status").innerHTML="Status: Root Reconnection Failed!";
                // }
            });
            break;
        default:
            console.log("tryConnect Error");
            break;
    }
}

function autoJoin(t, ifJump, if_parent_Node_Conn){   // ifJump == 2:_blank
    if(nodesMap[1] !== 1 || ifConnectedAim){
        console.log("Error: try autoJoin() by the nodesMap which wasn't from Root of Room");
        return;
    }
    if(nodesMap[9][3] < t){        // host node has low child nodes
        if (if_parent_Node_Conn) {
            tryConnect(0, nodesMap[7], false);
        } else {
            tryConnect(1, nodesMap[7], ifJump);
        }
    } else {
        recursiveSearch(nodesMap[9], t, 1);   // search for the node with low child nodes
    }
}

function getRoomIds(){
    roomIds = new Array();
    recursiveSearch(nodesMap[9], 999, 0);       // DEBUG 999 -> + infinite
    roomIds.push(nodesMap[7]);   // host id
    return roomIds;
}

function recursiveSearch(arr, t, fnOfSearch){
    switch(fnOfSearch){
        case 0:     // search for getting ids of room
            for (let i = 7; i < arr.length; i=i+3) {
                if(arr[i] && arr[i + 2] instanceof Array){
                    if(arr[i + 2][2] < t){
                        roomIds.push(arr[i]);
                    }
                }
            }
            for (let m = 9; m < arr.length; m=m+3) {    // After checked out suited nodes in thid layer, search their suited child nodes
                if(arr[m] && arr[m] instanceof Array){
                    recursiveSearch(arr[m], t, 0);
                }
            }
            break;
        case 1:
            shallowSearch(arr, t);
            while (temporaryChosedNodes[0] !== undefined) {
                deeplySearch(temporaryChosedNodes, t);
            }
            break;
        default:
            break;
    }
}

function shallowSearch(arr, t){
    for (let i = 7; i < arr.length; i=i+3) {
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

function deeplySearch(arr, t){
    let counter = arr.length;
    lastTemporaryChosedNodes = arr;
    temporaryChosedNodes = new Array();
    for (let w = 0; w < counter; w=w+1) {
        shallowSearch(lastTemporaryChosedNodes[w], t);
    }
}

// Send Massage and avoid delivering repeatedly
function liveSend (msg){
    let aims = 0;     // count successful times
    let source = NaN;
    if(msg instanceof Array){
        // if(msg[0] && msg[0] instanceof Number && (!msg[1] instanceof Number)){
        if((msg[0] instanceof Number) && (msg[1] instanceof String)){
            source = msg[1];    // mark source id for send data in a single direction
        }
    }
    if(parent_Node){
        if( ! [source, deliverId].includes(parent_Node.peer)){    // Promise a stable sending
            if(parent_Node.open){     // check the data channel
                parent_Node.send(msg);
                aims++;  // count successful times
            }
        }
    }
    if(audiences){
        for(let i=0; i<audiences.length; i++){
            if(audiences[i]){
                if( ! [source, deliverId /*, parent_Node.id */].includes(audiences[i].peer)){
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
    document.getElementById("roomSummary").value = nodesMap[5];
    if (nodesMap[6]) {
        document.getElementById("roomCover").src = nodesMap[6];   
    }
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
                if (parent_Node) {
                    document.location.href = "./P2PLiveAudience.html?id=" + aimId +"&name="+ getMyName() + "&themeIndex="+ theme_Index;
                } else {
                    if (app_Mode) {
                        window.parent.postMessage("P2PLiveAudience.html?id=" + aimId +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                    } else {
                        window.open("./P2PLiveAudience.html?id=" + aimId +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                    }
                }
                break;
            case 2:     // button for joining a node
                if(aimId == peer.id){alert(aimId);break;}
                if (parent_Node) {
                    document.location.href = "./P2PGameFiveOnLinePlayer.html?id=" + aimId +"&name="+ getMyName() + "&themeIndex="+ theme_Index;
                } else {
                    if (app_Mode) {
                        window.parent.postMessage("P2PGameFiveOnLinePlayer.html?id=" + aimId +"&name="+ getMyName()) + "&themeIndex="+ theme_Index;
                    } else {
                        window.open("./P2PGameFiveOnLinePlayer.html?id=" + aimId +"&name="+ getMyName() + "&themeIndex="+ theme_Index);
                    }
                }
                break;
        }
    }else{
        document.getElementById("block"+ layerNumber % 2).innerHTML = "";
        if(lastLayerNumber === layerNumber ){
            layers.splice(lastLayerNumber + 1);  // remove all of old layers
        }
        if(arr){
            for(let i = 7; i < arr.length; i=i+3){
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
    let msg = [ 0, peer.id, document.getElementById("name").value, document.getElementById("sendMessageBox").value, msgImgBase64, myIcon];   //*This line of code creates an array called "msg" and assigns it two values. The first value is the value of the element with the ID "name", and the second value is the value of the element with the ID "sendMessageBox". These values are used to construct the message that will be sent.
    if (msg[3] || msg[4]){    // DEBUG *This condition checks if the second element of the "msg" array (i.e., the message content) exists and is not empty.
        if ( liveSend(msg) > 0 ) {   // *This condition checks if the "liveSend" function returns a value greater than 0 when called with the "msg" array and 0 as arguments. If it does, it means the message was sent successfully.
            appearMsg(msg);     // This function is responsible for displaying the own sent message
            document.getElementById("sendMessageBox").value = "";
            // console.log("Sent successfully: " + msg);    // DEBUG
            msgImgBase64 = null;
            document.getElementById("msgImgInput").files = null;
            document.getElementById("uploadImgButton").style.backgroundColor = 'unset';
        }else{
            appearMsg(msg);
            // console.log('Connection is closed');
        }
    }else{
        document.getElementById("sendMessageBox").setAttribute("placeholder","Void content!!!!!!!!!!!!!!"); //*This line of code sets the placeholder attribute of the element with the ID "sendMessageBox" to display a message indicating that the content should not be empty.
    }
}

function sendImg(){
    let file = document.getElementById("msgImgInput").files[0];
    let reader = new FileReader();
    if(file){
        if(file.size <= 1048576){
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                msgImgBase64 = reader.result;
                document.getElementById("uploadImgButton").style.backgroundColor = 'var(--active-color)';
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
    let now = new Date();

    let newMsg = document.createElement("div");
    newMsg.classList.add("msgs");
    let newMsgContent = document.createElement("div");

    if(msg[5]){
        let newMsgIcon = document.createElement("img");
        newMsgIcon.setAttribute("src", msg[5]);
        newMsgIcon.classList.add("icon");
        newMsgContent.appendChild(newMsgIcon);
    }

    let newMsgTime = document.createElement("span");
    newMsgTime.appendChild(document.createTextNode("[" + now.getHours() +":"+ now.getMinutes() +":"+ now.getSeconds() + "]"));
    newMsgTime.classList.add("time");
    newMsgContent.appendChild(newMsgTime);

    let newMsgUser = document.createElement("span");
    newMsgUser.appendChild(document.createTextNode(msg[2] + ":"));
    newMsgUser.classList.add("usr");
    newMsgContent.appendChild(newMsgUser);

    newMsg.appendChild(newMsgContent);
    
    // let newMsgContent = document.createElement("div");
    // newMsgContent.setAttribute("style", "vertical-align: middle; display: inline-block;");

    // let newMsgTime = document.createElement("span");
    // newMsgTime.appendChild(document.createTextNode("[" + now.getHours() +":"+ now.getMinutes() +":"+ now.getSeconds() + "]"));
    // newMsgTime.classList.add("time");
    // newMsgContent.appendChild(newMsgTime);

    // let newMsgUser = document.createElement("span");
    // newMsgUser.appendChild(document.createTextNode(msg[2] + ":"));
    // newMsgUser.classList.add("usr");
    // newMsgContent.appendChild(newMsgUser);
    // newMsgContent.appendChild(document.createElement("br"));

    let newMsgTextContent = document.createElement("span");
    newMsgTextContent.appendChild(document.createTextNode(msg[3]));
    newMsgTextContent.classList.add("chatText");
    newMsg.appendChild(newMsgTextContent);

    if(msg[4]){
        let newMsgImgContent = document.createElement("img");
        newMsgImgContent.setAttribute("src", msg[4]);
        newMsgImgContent.classList.add("chatImg");
        newMsg.appendChild(newMsgImgContent);
    }

    document.getElementById("chatBox").appendChild(newMsg);
    // original msg appear mode(only one line but low effective)
    // document.getElementById("chatBox").innerHTML =  document.getElementById("chatBox").innerHTML + "<div class=\"msgs\"><span class=\"time\">[" + now.getHours() +":"+ now.getMinutes() +":"+ now.getSeconds() + "]</span>" + "<span class=\"usr\">"+ msg[2] + ": </span>" + msg[3] + img +"</div>";
    
    if(ifAutoScroll){
        document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
    }
    if(ifAutoClean.checked){
        let msgs = document.getElementsByClassName("msgs");
        let numberOfMsgs = msgs.length;
        if(numberOfMsgs > 100){
            let deltaNumber = numberOfMsgs - 100;
            for(let i=0; i <= deltaNumber; i++){
                msgs[i].remove();
                numberOfMsgs--;
            }
        }
    }
    // if(fullWebVideoTimes === 1){
    //     document.getElementById("chatBox").style.visibility="true";
    //     setTimeout(function(){document.getElementById("chatBox").style.visibility="false";}, 5000)
    // }
}

function cleanMsg(){    // DEBUG
    let msgs = document.getElementsByClassName("msgs");
    while(msgs.length){
        msgs[0].remove();
    }
}

function getMyName(){
    if(MyName){
        if (MyName.value){
            if (use_Local_Storage) {
                localStorage.myName = MyName.value;
            }
            return MyName.value;
        } else {
            return peer.id;
        }
    }
    return "";
}

function conference_Play() {
    let i = 0;
    while (i < document.getElementsByClassName("confereeVideos").length) {
        document.getElementsByClassName("confereeVideos")[i].play();
        i++;
    }
}

function upload_Conferee_Video() {
    if (conference_Stream) {
        if (my_Conferee_Index) {
            if (!parent_Node) {
                conferee_Map[3][my_Conferee_Index] = my_Conferee_Stream_Id;
                nodesMap[11] = conferee_Map;
                liveSend(nodesMap);     // not enough to be useful;
            }
            let i = 0;
            while (i < conferee_Nodes.length) {
                conferee_Nodes[i].send([5,3, my_Conferee_Index, my_Conferee_Stream_Id, null, getMyName()]);
                conferee_Nodes[i].call(conference_Stream);
                i++;
            }
            document.getElementsByClassName('confereeVideos')[my_Conferee_Index - 1].srcObject = conference_Stream;
            document.getElementById('conferee_Local_Video').srcObject = null;
        } else {
            alert('Join the conference at first');
        }
    }
}

function update_Conferee_Info() {
    if (my_Conferee_Index) {
        if (!parent_Node) {
            conferee_Map[3][my_Conferee_Index] = getMyName();
            liveSend(nodesMap);
        }
        nodesMap[11][3][my_Conferee_Index] = getMyName();
        if (conference_Stream) {
            conference_Send([5,3, my_Conferee_Index, my_Conferee_Stream_Id, null]);
        } else if (myIcon) {
            conference_Send([5,3, my_Conferee_Index, null, myIcon, getMyName()]);
        }
    }
}

function conference_Send(data) {
    let i = 0;
    while (i < conferee_Nodes.length) {
        conferee_Nodes.send(data);
        i++;
    }
}

function join_Conference() {
    if (document.getElementById('joinConference').checked) {
        if (!nodesMap[11]) {
            alert('Host had not open conference');
            return;
        }
        let i = 0;
        while (i < nodesMap[11][0].length) {
            if (nodesMap[11][0][i] !== null) {
                conferee_Info = [nodesMap[11][0][i], nodesMap[11][1][i], nodesMap[11][2][i]]
                append_Conferee_Dom(conferee_Info);
                i++;
            }
        }
        if (parent_Node) {
            parent_Node.send([5, 0, [null, peer.id, getMyName()]]);
        } else {
            my_Conferee_Index = conferee_Map[0].length + 1;
            liveSend([5,1, [my_Conferee_Index, peer.id, getMyName()]]);
            let i = 0;
            while (i < nodesMap[11][1].length) {
                tryConnect(2, nodesMap[11][1][i]);
                i++;
            }
            nodesMap[11][0].push(my_Conferee_Index);
            nodesMap[11][1].push(peer.id);
            nodesMap[11][2].push(getMyName());
            nodesMap[11][3].push(null);
            conferee_Map = nodesMap[11];
            append_Conferee_Dom();
        }
    } else {
        if (parent_Node) {
            parent_Node.send([5,2, peer.id]);
        } else {
            let i = 0;
            while (i < conferee_Map.length) {
                conferee_Map[i][my_Conferee_Index] = undefined;     // leave blank
                i++;
            }
            nodesMap[11] = conferee_Map;
            liveSend(nodesMap);
        }
        my_Conferee_Index = null;
        if (conference_Stream) {
            conference_Stream.getTracks().forEach(track => track.stop());
        }
        conference_Stream = null;
    }
}

function append_Conferee_Dom(conferee) {  // conferee = [index, peer_Id, name]
    if (!conferee) {        // append self
        conferee = [my_Conferee_Index, peer.id, getMyName()];
    }
    
    let conferee_Dom = document.createElement("div");
    conferee_Dom.classList.add('conferees');
    
    let conferee_Name = document.createElement("span");
    conferee_Name.appendChild(document.createTextNode(conferee[2]));
    conferee_Name.classList.add("confereeName");
    conferee_Dom.appendChild(conferee_Name);
    
    let conferee_Video = document.createElement("video");
    conferee_Video.classList.add("confereeVideos");
    conferee_Dom.appendChild(conferee_Video);

    document.getElementById("confereesContainer").appendChild(conferee_Dom);
}

// function share_MediaStream(fn, param0) {
//     switch (fn) {
//         case 0:
//             useDisplayMedia();
//             break;
//         case 1:
//             askNavigatorMediaDevices(param0);
//             break
//         case 2:
//             shareSRSMediaStream();
//             break;
//         default:
//             break;
//     }
//     liveSend([4, peer.id]);
// }

// the function of getting local stream(It can't work on most of mobile phone)
// Please note! In order for the getDisplayMedia() method to work properly, you need to use the HTTPS protocol or run it on localhost in a local development environment.
// Otherwise, the browser may restrict access to the camera and microphone.
function useDisplayMedia() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
        // After successfully obtaining the local stream, display it on the page.
        localStream = stream;
        if( ! document.getElementById("ifNotDisplayLocalStream").checked){
            displayStream(localStream);  // for debug
            liveSend([4, peer.id]);
        } else {
            WebVideo.srcObject = null;
        }
        console.log("Local stream shared");
    })
    .catch((error) => {
        console.error('Error getting local stream:', error);
    });
}

function askNavigatorMediaDevices(if_Conference){
    let constraints;
    if (if_Conference) {    // conference format
        constraints = {
            video: document.getElementById("ifUseConferenceCamera").checked,
            audio: document.getElementById("ifUseConferenceMicrophone").checked,
            width: { ideal: 320, max: 720 },
            height: { ideal: 320, max: 720 },
            frameRate: { ideal: 30, max: 60 }
        };
    } else {
        constraints = { video: document.getElementById("ifUseCamera").checked, audio: document.getElementById("ifUseMicrophone").checked };
    }
    
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            if (if_Conference) {
                if (conference_Stream) {
                    conference_Stream.getTracks().forEach(track => track.stop());
                }
                conference_Stream = stream;
                document.getElementById('conferee_Local_Video').srcObject = conference_Stream;
            } else {
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                }
                localStream = stream;
                liveSend([4, peer.id]);

                // After successfully obtaining the local stream, display it on the page.
                if( ! document.getElementById("ifNotDisplayLocalStream").checked){
                    displayStream(stream);  // for debug
                } else {
                    WebVideo.srcObject = null;
                }
                // console.log("Local stream shared");
            }
        })
        .catch(function (err) {
            console.error('Error getting local stream:', err);
        });
}
function shareSRSMediaStream() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    url = "webrtc://" + document.getElementById('streamIpSRS').value + "/live/livestream/" + document.getElementById('streamKeySRS').value;
    const rtcPlayer = new SrsRtcPlayerAsync();
    rtcPlayer.play(url);
    localStream = rtcPlayer.stream;
    if( ! document.getElementById("ifNotDisplayLocalStream").checked){
        displayStream(rtcPlayer.stream);  // for debug
    } else {
        WebVideo.srcObject = null;
    }
    liveSend([4, peer.id]);
}

// display the remote stream and try to play it(if usr didn't do anything on web maybe be prohibited)
function displayStream(stream) {
    WebVideo.pause();
    WebVideo.removeAttribute('src'); // empty source
    WebVideo.load();
    if(WebVideo.srcObject){
        WebVideo.srcObject = null;
    }
    WebVideo.srcObject = stream;
}

function refreshMedia(){
    remoteStream = null;
    if(parent_Node){
        if(parent_Node.open){
            parent_Node.send([4, peer.id]);
        }
    } else if(localStream){
        displayStream(localStream);
    }
}

// transform Img into Base64
function liveCoverInput(){
    let file = document.getElementById("LiveCoverInput").files[0];
    let reader = new FileReader();
    if(file){
        if(file.size <= 1048576){
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                liveCoverBase64 = reader.result;
                document.getElementById("LiveCover").src = liveCoverBase64;
            }
        } else {
            alert("it can't over 1MB");
        }
    } else {
        console.log("img transformed Error!");
    }
}

// transform Img into Base64
function iconInput(){
    let file = document.getElementById("uploadIcon").files[0];
    let reader = new FileReader();
    if(file){
        if(file.size <= 1048576){
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                myIcon = reader.result;
                document.getElementById("myIcon").src = myIcon;
                if (use_Local_Storage) {
                    localStorage.myIcon = myIcon;
                }
            }
        } else {
            alert("it can't over 1MB");
        }
    } else {
        console.log("img transformed Error!");
    }
}


// let middleX = 0;
// function fullWebVideo(){
//     if(fullWebVideoTimes === 0){
//         if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
//             WebVideo.style.height = window.innerWidth + "px";
//             WebVideo.style.width = window.innerHeight + "px";
//             WebVideo.style.transform = "rotate(90deg)";
//             WebVideo.style.position = "absolute";
//             if(middleX === 0){middleX = WebVideo.offsetWidth - window.innerWidth;}
//             WebVideo.style.right = -middleX + "px";
//             WebVideo.style.top = (WebVideo.offsetWidth*0.25 + 10) + "px";
//             document.getElementsByClassName("container")[0].style.bottom = -20 + "px";
//             let fullScreen = document.getElementById("fullScreen");
//             fullScreen.style.position = "absolute";
//             fullScreen.style.bottom = 0 + "px";
//         } else {
//             WebVideo.style.height = window.innerHeight + "px";
//             WebVideo.style.width = window.innerWidth + "px";
//             WebVideo.style.position = "absolute";
//             window.scrollBy({
//                 top: document.documentElement.scrollHeight,
//                 behavior: "smooth",
//             });
//         }
//         fullWebVideoTimes++;
//         setTimeout(
//             function(){
//             if(fullWebVideoTimes === 1){
//                 document.getElementById("chatBox").style.visibility="hidden";
//             }
//         }, 3000);
//     } else {
//         if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
//             WebVideo.style.transform = "none";
//             WebVideo.style.width = "100%";
//             WebVideo.style.height = "35%";
//             WebVideo.style.position = "static";
//             document.getElementById("fullScreen").style.position = "static";
//             document.getElementsByClassName("container")[0].style.bottom = 0 + "px";
//             WebVideo.style.position = "static";
//         } else {
//             WebVideo.style.height = "85%";
//             WebVideo.style.width = "70%";
//         }
//         fullWebVideoTimes = 0;
//         document.getElementById("chatBox").style.visibility="visible";
//     }
// }

// window.onload=function(){
if(document.getElementById("uploadImgButton")){
    document.getElementById("uploadImgButton").addEventListener("click", function (){
        document.getElementById("msgImgInput").click();
    });
}
if(document.getElementById("myIcon")){
    document.getElementById("myIcon").addEventListener("click", function (){
        document.getElementById("uploadIcon").click();
    });
}

function change_Theme(
    index,
    sidebar_color,
    theme_color,
    font_color,
    ui_color,
    input_color,
    active_color,
    visited_color
) {
// get
//let getComputedStyle(document.documentElement).getPropertyValue('name')
//     document.documentElement.style.setProperty('name', value);
    // let theme_color = 'rgb(0,0,0)';  // default white
    // let font_color = 'rgb(255,255,255)';
    // let ui_color = 'rgb(173,195,192)';
    // let input_color = 'rgb(200,200,200)';
    // let active_color = 'rgb(162, 255, 109)';

    theme_color = theme_color || 'rgb(255,255,255)';  // default white
    sidebar_color = sidebar_color || 'rgb(243,243,243)';  // default white
    font_color = font_color || 'rgb(21,26,34)';
    ui_color = ui_color || 'rgb(230,230,230)';
    input_color = input_color || 'rgb(241,242,243)';
    active_color = active_color || 'rgb(162,255,109)';
    visited_color = visited_color || 'rgb(23, 134, 245)';
    switch (index) {
        case "1":   // dark mode
            theme_color = 'rgb(28,33,40)';
            sidebar_color = 'rgb(33,40,48)'
            font_color = 'rgb(197,209,216)';
            ui_color = 'rgb(46,46,46)';
            input_color = '#373E47';
            break;
        default:
            break;
    }
    document.documentElement.style.setProperty('--theme-color', theme_color);
    document.documentElement.style.setProperty('--sidebar-color', sidebar_color);
    document.documentElement.style.setProperty('--font-color', font_color);
    document.documentElement.style.setProperty('--ui-color', ui_color);
    document.documentElement.style.setProperty('--input-color', input_color);
    document.documentElement.style.setProperty('--active-color', active_color);
    document.documentElement.style.setProperty('--visited-color', visited_color);
}

function pop(dom, new_Index) {
    pop_Doms = dom;
    let value = Math.abs(dom.style.opacity - 1);
    dom.style.opacity = value;
    if (value == 1){
        value = 'visible';
        if (new_Index !== undefined) {
            changePopMenu(new_Index);
        } else {
            if (lastPopIndex) {
                changePopMenu(lastPopIndex); // add listener
            } else {
                changePopMenu(0); // add listener
            }
        }
        document.addEventListener('keydown', function handleEnter(event, index) {
            if (event.key === 'Enter' || event.keyCode === 13) {
                if(active_confirm_Button && not_Inputting) {
                    let operation_Time = Date.now();
                    if (operation_Time - last_Operation_Time > 500) {
                        last_Operation_Time = operation_Time;
                        active_confirm_Button.click();
                    }
                }
            } else if (event.key === 'Esc' || event.keyCode === 27) {
                pop(dom, new_Index);
            }
            keydownListener = handleEnter; // for clean
        });
    } else {
        value = 'hidden';
        active_confirm_Button = undefined;
        document.removeEventListener('keydown', keydownListener);
    }
    dom.style.visibility = value;
    document.getElementById('shadowCover').style.visibility = value;
}

textareas.forEach(e => {
    e.addEventListener('input', () => {
        not_Inputting = false;
        clearTimeout(inputting_Timeout);
        inputting_Timeout = setTimeout(() => { not_Inputting = true }, 3000);
    });
});

function changePopMenu(popIndex) {
    if (!pop_Doms.getElementsByClassName("pop_Content")[lastPopIndex]) {
        lastPopIndex = 0;
    } else {
        pop_Doms.getElementsByClassName("pop_Content")[lastPopIndex].classList.add("covert");
        pop_Doms.getElementsByClassName("pop_Option")[lastPopIndex].classList.remove("active");
    }
    if (!pop_Doms.getElementsByClassName("pop_Content")[popIndex]) {
        popIndex = 0;
    }
    lastPopIndex = popIndex;
    pop_Doms.getElementsByClassName("pop_Content")[popIndex].classList.remove("covert");
    pop_Doms.getElementsByClassName("pop_Option")[popIndex].classList.add("active");

    if(pop_Doms.getElementsByClassName("pop_Content")[popIndex].getElementsByClassName('confirm_Button')[0]){
        active_confirm_Button = pop_Doms.getElementsByClassName("pop_Content")[popIndex].getElementsByClassName('confirm_Button')[0]
    } else {
        active_confirm_Button = undefined;
    }
}

if (document.getElementById('copyURL')) {
    document.getElementById('copyURL').addEventListener('click', function() {
        let url = window.location.href;
        let index = url.indexOf("?");
        if (index !== -1) {
            url = url.substring(0, index);
        }
        index = url.lastIndexOf("/");
        url = url.substring(0, index+1);
        if (parent_Node) {
            url = url +"P2PLiveAudience.html?id="+ parent_Node.peer +"&name=";
        } else {  // host or audience partly unloaded
            url = url +"P2PLiveAudience.html?id="+ peer.id +"&name=";
        }
        
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                alert('Copy Successfully' + currentUrl);
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    });
}

window.addEventListener('message', function(event) {
    // let currentUrl = window.location.origin;
    // let urlIndex = currentUrl.indexOf(language);
    // if (urlIndex !== -1) {
    //     currentUrl = currentUrl.substring(0, urlIndex - 1);
    // }
    console.log(event.origin+"=\n"+window.location.origin +"=\n" + event.data);  // debug
    if (event.origin === window.location.origin) {
        switch (event.data[0]) {
            case 0:
                switch (event.data[1]) {
                    case 0:
                        use_Local_Storage = event.data[2];
                        break;
                    case 1:     // switch app_Mode (msg from window.parent)
                        if(event.data[2]){
                            app_Mode = true;
                            if (document.getElementById("onlineButton")) {
                                document.getElementById("onlineButton").classList.remove("covert");
                            }
                            if (document.getElementById("themeController")) {
                                document.getElementById("themeController").classList.add("covert");
                            }
                        } else {
                            app_Mode = false;
                            if (document.getElementById("onlineButton")) {
                                document.getElementById("onlineButton").classList.add("covert");
                            }
                            if (document.getElementById("themeController")) {
                                document.getElementById("themeController").classList.remove("covert");
                            }
                        }
                    default:
                        break;
                }
                break;
            case 1:
                theme_Index = event.data[1];
                change_Theme(theme_Index);
                document.getElementById('themeController').value = theme_Index;
                break;
            default:
                break;
        }
    }
});

if (use_Local_Storage) {
    if(localStorage.themeIndex !== undefined){
        change_Theme(localStorage.themeIndex);
        document.getElementById('themeController').value = localStorage.themeIndex;
    }
    if(localStorage.myIcon) {
        myIcon = localStorage.myIcon;
        if (document.getElementById("myIcon")) {
            document.getElementById("myIcon").src = myIcon;
        }
    }
    if (localStorage.myName) {
        if (document.getElementById("name")) {
            document.getElementById("name").value = localStorage.myName;
        }
    }
}