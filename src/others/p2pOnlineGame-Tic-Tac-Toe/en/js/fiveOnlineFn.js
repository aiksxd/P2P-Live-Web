
let conn = null;
let mediaOpen = null;
let openInfoTimes = 0;
let openLiveTimes = 0;
let parent = null;
let ifAutoScroll = true;
let localStream = null;
let remoteStream = null;
let ifHitAim = null;
let lastAimId = null;
let layers = [0];
let lastLayerNumber = null;
let audiences = new Array();
let audienceIds = new Array();
let conns = new Array();
let connIds = new Array();
let nodesMap = new Array();     // init later
let childNodes = new Array();
let params = new URLSearchParams(document.location.search.substring(1));
const MyName = document.getElementById("name");
const WebVideo = document.getElementById('canvasMap');

// For game
let players = [5];  // [ maxPlayerNumber, [number, peerId, icon, name] ]
let deliver = null;
let chessmanPosition = [];
let unavailablePosition = [];
let positionOwners = [];
let clickTimes = 0;
let lastAimPosition = 0;
let leftEnergy = 0;
let lastOperationTime = 0;
let turn = 1;
let maxHeight = 10;
let maxWidth = 10;
let maxEnergy = 10;
let maxWaitingTime = null;
let gameMode = [0, true];
let mapSize = [maxHeight, maxWidth];
let gameMap = [mapSize]
let startTime = null;
let myNumber = null;
let kickNumbers = new Array();
let modeSetting = [[null], [10, 6, 6, 4, 4]];   // [ [mode1... , ...], [mode2... , ...], ...]
let offlinePlayer = [];
let lastGameMap = null;
let gameInfo = [6, players, gameMap, gameMode, startTime, unavailablePosition, positionOwners, modeSetting];
let abilitiesURLS = ['img/normal.png', 'img/move.png','img/trap.png','img/barrier.png'];
let waitingTime = 999999;
let timer = null;
let myAbility = 0;
let activeAbility = 0;
let activeCost = 6;
let availiable_Calculation_Chessman_Types = [0];
let abilityPosition = new Array();
let cellId = null;
let aimCell = null;
let selectedPosition = null;
let ready = false;
let barrierPosition = new Array();

function drawMap(){
    if(startTime){
        document.getElementById("canvasMap").innerHTML = "<div id=\"gameMap\"></div>";
        for(let t=1; t<=maxHeight*maxWidth; t++){
            let cell = document.createElement("img");
            cell.classList.add('cells');
            cell.setAttribute("onclick", "applyForPut(this)");
            cell.id = t;
            let newLine = document.createElement("br");
            document.getElementById("gameMap").appendChild(cell);
            if(t%maxWidth==0){
                document.getElementById("gameMap").appendChild(newLine);
            }
        }
        let i = 0;
        while (i < abilitiesURLS.length) {  // summon new Array
            if(abilityPosition[i]){}else{
                abilityPosition[i] = new Array();
            }
            i++;
        }
        switch (gameMode[0]) {
            case 0:
                break;
            case 1:
                if (myAbility) {} else {
                    myAbility = 1;  // default ability
                }

                let domAbility = document.createElement("img");
                domAbility.classList.add('domAbilities');
                
                domAbility1 = domAbility.cloneNode();
                domAbility1.setAttribute("onclick", "changeActiveAbility(0)");
                domAbility1.setAttribute("style", "--t:0");
                domAbility1.id = "domAbility1";
                domAbility1.setAttribute("src", abilitiesURLS[0]);
                document.getElementById("gameMap").appendChild(domAbility1);

                domAbility2 = domAbility.cloneNode();
                domAbility2.setAttribute("onclick", "changeActiveAbility("+ myAbility +")");
                domAbility2.setAttribute("style", "--t:1");
                domAbility2.id = "domAbility2";
                domAbility2.setAttribute("src", abilitiesURLS[myAbility]);
                document.getElementById("gameMap").appendChild(domAbility2);

                document.getElementById("domAbility1").style.bottom = "0px";
                domAbility.remove();
                changeActiveAbility(0);
            default:
                break;
        }
    } else {
        if (parent) {
            document.getElementById("canvasMap").innerHTML = '\n            <br><br>\n            MapSize: Height:<input type="number" id="maxHeight" class="setting" value="10" readonly=""> Width:<input type="number" id="maxWidth" class="setting" value="10" readonly><br>\n            MaxPlayers: <input type="number" id="maxPlayers" class="setting" value="5" readonly=""><br>\n            GameMode: <select id="gameMode" disabled="">\n                <option value="0" selected="selected">SLG Mode</option>\n                <option value="1">Energy Mode</option>\n            </select><br>\n            HostJoinGame: <input type="checkbox" checked="true" class="setting" id="hostJoinGame" disabled=""><br>\n            <div id="modeMenu"><br></div>\n            <button id="join" onclick="parent.send([8, 0, peer.id, myIcon, getMyName(), myAbility])">Ready</button>\n        ';
        } else {
            document.getElementById("canvasMap").innerHTML = '\n            <br><br>\n            MapSize: Height:<input type="number" id="maxHeight" class="setting" value="10" min="1"> Width:<input type="number" id="maxWidth" class="setting" value="10" min="1"><br>\n            MaxPlayers: <input type="number" id="maxPlayers" class="setting" value="5" min="1"><br>\n            GameMode: <select id="gameMode" onchange="modeModify(this.selectedIndex)">\n                <option value="0" selected="selected">SLG Mode</option>\n                <option value="1">Energy Mode</option>\n                \x3C!-- <option value="2">Card Mode</option> -->\n            </select><br>\n            HostJoinGame: <input type="checkbox" class="setting" checked="true" id="hostJoinGame"><br>\n            <div id="modeMenu"><br></div>\n            <button id="start" onclick="start()">Start Game</button>\n';
            
            let inputs = Array.from(document.getElementsByClassName('setting'));
            inputs.forEach(input => {
                input.addEventListener('focusout',() => {
                        maxWidth = Number(document.getElementById("maxWidth").value);
                        maxHeight = Number(document.getElementById("maxHeight").value);
                        mapSize = [maxHeight, maxWidth];
                        gameMap = [mapSize]
                        players[0] = Number(document.getElementById("maxPlayers").value);
                        gameMode = [document.getElementById("gameMode").selectedIndex, document.getElementById("hostJoinGame").checked];
                        // gameInfo = [6, players, gameMap, gameMode, startTime, unavailablePosition, positionOwners];
                        liveSend([6, [players[0]], gameMap, gameMode, startTime, unavailablePosition, positionOwners, modeSetting]);
                    },
                    true,
                );
            });
            document.getElementById("gameMode").addEventListener(
                "focusout",() => {
                    gameMode = [document.getElementById("gameMode").selectedIndex, document.getElementById("hostJoinGame").checked];
                    liveSend([6, [players[0]], gameMap, gameMode, startTime, unavailablePosition, positionOwners, modeSetting]);
                },
                true,
            );
        }
    }
}

function winChecker(chessman) {
    // // success calculation system -> BUG
    // if (unavailablePosition.length === (maxHeight*maxWidth)) {
    //     lastGameMap = gameMap;
    //     // gameMap = null;
    //     alert("No Winner!");   // style TODO
    //     turn = null;
    //     return;
    // }
    [(-maxWidth)+1, 1, maxWidth+1, maxWidth].forEach(direction => {
        let i = -4;
        let t = 1;
        let limit = chessman[1] % maxWidth;    // limit for out of canvas
        if(limit == 0){limit = maxWidth;}
        while (i<=4 && i<= maxWidth - limit) {
            if(i==0 || i < 1-limit ){i++; continue;}
            // console.log(""+ (1-limit) +";"+ (maxWidth-limit) +"");
            let aimPosition = chessman[1]+(i*direction);
            // console.log(aimPosition);
            let arrayPosition = unavailablePosition.indexOf(aimPosition);
            // if(unavailablePosition.includes(aimPosition) && positionOwners[arrayPosition] == chessman[2] && typeChecker(aimPosition) ){
                if(positionOwners[arrayPosition] == chessman[2] && typeChecker(aimPosition) ){
                t++;
                // console.log(chessman[2]+"th<------->"+aimPosition+"------------->"+t);
                if (t>=5){        // 5 on line
                    lastGameMap = gameMap;
                    // gameMap = null;
                    alert("Winner is "+ player[3]);   // style TODO
                    turn = null;
                    maxEnergy = -1;
                    break;
                }
            } else if(5-i < 5-t){   // quit in advence
                break;
            } else {    // this position without the chessman of aim player
                t = 1;
            }
            i++;
        }
    });
}

function typeChecker(aimPosition) {
    let t = false;
    availiable_Calculation_Chessman_Types.forEach(availiable_Calculation_Chessman_Type => {
        if(abilityPosition[availiable_Calculation_Chessman_Type]){
            if(abilityPosition[availiable_Calculation_Chessman_Type].includes(aimPosition)){
                t = true; 
            }
        }
    })
    return t;
}

function applyForPut(position){
    if(myNumber){   // player confirm
        let positionId = Number(position.id);
        let now = new Date();
        switch (gameMode[0]) {
            case 0:
                if(!(unavailablePosition.includes(positionId))){
                    if(turn === myNumber){
                        if (parent) {
                            parent.send([7, 0, [0, positionId, myNumber, now.getTime()]]);
                        } else {
                            // noticed: No circuit protection
                            liveSend([7, 1, [0, positionId, myNumber, now.getTime()]]);
                            drawChessman([0, positionId, myNumber, now.getTime()]);
                        }
                    } else {
                        alert("it is not your turn!");
                    }
                }
                break;
            case 1:
                switch (activeAbility) {
                    case 0:
                    case 2:
                    case 3:
                        if(!(unavailablePosition.includes(positionId))){
                            if(energy() > activeCost*1000){
                                document.getElementById("modeOutput").innerHTML ="Spare Energy: "+ (energy(activeCost)*0.001).toFixed(3).slice(0, -2);
                                if (parent) {
                                    parent.send([7, 0, [activeAbility, positionId, myNumber, now.getTime()]]);
                                } else {
                                    liveSend([7, 1, [activeAbility, positionId, myNumber, now.getTime()]]);
                                    drawChessman([activeAbility, positionId, myNumber, now.getTime()]);
                                }
                            }
                        }
                        break;
                    case 1:
                        if(!(unavailablePosition.includes(positionId))){
                            if (unavailablePosition.includes(Number(selectedPosition))) {
                                document.getElementById("modeOutput").innerHTML ="Spare Energy: "+ (energy(activeCost)*0.001).toFixed(3).slice(0, -2);
                                if (parent) {
                                    parent.send([7, 0, [activeAbility, [ selectedPosition, positionId ], myNumber, now.getTime()]]);
                                } else {
                                    liveSend([7, 1, [activeAbility, [ selectedPosition, position.id ], myNumber, now.getTime()]]);
                                    drawChessman([activeAbility, [ selectedPosition, position.id ], myNumber, now.getTime()]);
                                }
                                selectedPosition = null;
                            } else { alert("Please select a chessman when you decide to move a cheesman with this ability!") }
                        } else {
                            if (selectedPosition !== null) {
                                document.getElementById(selectedPosition).style.border = "unset";
                            }
                            selectedPosition = position.id;
                            document.getElementById(selectedPosition).style.border = "1px solid green";
                        }
                    default:
                        break;
                }
                break;
            default:
                console.log("unknown game mode")
                break;
        }
    }
}

function drawChessman(chessman, effect){
    // console.log([chessman, cellId]); // DEBUG
    switch (gameMode[0]) {
        case 0: // SLG
            nextTurn();
            switch (chessman[0]) {
                case 0:
                    chessmanPosition.push(chessman[1]);
                    unavailablePosition.push(chessman[1]);  // be taken up cells
                    positionOwners.push(chessman[2]);   // record owner for win the game
                    abilityPosition[0].push(chessman[1]);    // record chessman type for extension
                    
                    // remind change for all player
                    if (cellId !== null) {
                        document.getElementById(String(cellId)).style.border = "unset";
                    }
                    cellId = chessman[1];

                    // draw the color of chessman from player
                    player = players[chessman[2]];
                    aimCell = document.getElementById(String(cellId));
                    aimCell.classList.add("owner"+ player[0]);
                    document.getElementById(String(cellId)).style.border = "1px solid red";
                    if(player[2]){
                        aimCell.setAttribute("src", player[2]); // .innerHTML = "<img class=\"playerNumber"+ sourcePlayer[0] +"\" src=\"" + sourcePlayer[2] + ">";
                    } else {
                        // document.getElementById(String(chessman[1])).innerHTML = "<span class=\"playerNumber"+ sourcePlayer[0] +"\" >" + sourcePlayer[0] + "</span>";
                        let colour = 255*((player[0] + 2)/(player[0] + 4));
                        aimCell.style.backgroundColor = "rgb("+parseInt(((((player[0]+1) % 5) + 1)/5)*colour)+", "+parseInt(((((player[0]+1) % 4) + 1)/4)*colour)+", "+parseInt(((((player[0]+1) % 3) + 1)/3)*colour)+")";
                    }

                    winChecker(chessman);
                    break;
                default:
                    console.log("drew unknown");
                    break;
            }
            break;
        case 1: // Energy
            switch (chessman[0]) {
                case 0:
                    // check ability effect:
                    // trap check
                    if (abilityPosition[2].includes(chessman[1])) {
                        chessman[0] = 3;
                        drawChessman(chessman, effect);
                        return;
                    }
                    // if (abilityPosition[2]) {
                    //     if (abilityPosition[2].includes(chessman[1])) {
                    //         unavailablePosition.push(chessman[1]);  // be taken up cells
                    //         positionOwners.push(chessman[2]);
                    //         abilityPosition[3].push(chessman[1]);
                    //         // remind change for all player
                    //         if (cellId !== null) {
                    //             document.getElementById(String(cellId)).style.border = "unset";
                    //         }
                    //         cellId = chessman[1];

                    //         player = players[chessman[2]];
                    //         aimCell = document.getElementById(String(cellId));
                    //         document.getElementById(String(cellId)).style.border = "1px solid red";
                    //         aimCell.style.transition = "18s";
                    //         barrierPosition.push(cellId);
                    //         setTimeout(removeBarrier, 6000);
                    //         aimCell.style.opacity = "0";
                    //         aimCell.setAttribute("src", abilitiesURLS[3]);

                    //         // cleanTrap
                    //         let aimPosition = unavailablePosition.indexOf(chessman[1]);
                    //         if (aimPosition !== -1) {
                    //             unavailablePosition.splice(aimPosition, 1);
                    //             positionOwners.splice(aimPosition, 1);
                    //         }
                    //         abilityPosition[2].splice(abilityPosition[2].indexOf[chessman[1]], 1);

                    //         return;
                    //     }
                    // }

                    // draw normal chessman
                    chessmanPosition.push(chessman[1]);
                    unavailablePosition.push(chessman[1]);  // be taken up cells
                    positionOwners.push(chessman[2]);   // record owner for win the game
                    abilityPosition[0].push(chessman[1]);    // record chessman type for extension
                    
                    // remind change for all player
                    if (cellId !== null) {
                        document.getElementById(String(cellId)).style.border = "unset";
                    }
                    cellId = chessman[1];

                    // draw the color of chessman from player
                    player = players[chessman[2]];
                    aimCell = document.getElementById(String(cellId));
                    aimCell.classList.add("owner"+ player[0]);
                    document.getElementById(String(cellId)).style.border = "1px solid red";
                    if(player[2]){
                        aimCell.setAttribute("src", player[2]); // .innerHTML = "<img class=\"playerNumber"+ sourcePlayer[0] +"\" src=\"" + sourcePlayer[2] + ">";
                    } else {
                        // document.getElementById(String(chessman[1])).innerHTML = "<span class=\"playerNumber"+ sourcePlayer[0] +"\" >" + sourcePlayer[0] + "</span>";
                        let colour = 255*((player[0] + 2)/(player[0] + 4));
                        aimCell.style.backgroundColor = "rgb("+parseInt(((((player[0]+1) % 5) + 1)/5)*colour)+", "+parseInt(((((player[0]+1) % 4) + 1)/4)*colour)+", "+parseInt(((((player[0]+1) % 3) + 1)/3)*colour)+")";
                    }

                    winChecker(chessman);
                    break;
                case 1:
                    // remind change for all player
                    if (cellId !== null) {
                        document.getElementById(String(cellId)).style.border = "unset";
                    }
                    cellId = Number(chessman[1][1]);
                    // Notice: ununitied: here chessman[1] = [[original id String],[new id String]] instead of Number!
                    // If aim cell with trap -> summon barrier in new place
                    if (abilityPosition[2].includes(Number(chessman[1][1]))) {
                        let now = new Date();
                        drawChessman([3, Number(chessman[1][1]), positionOwners[chessmanPosition.indexOf(Number(chessman[1][0]))], now.getTime()], effect);
                        let i = 0;
                        while(i < abilityPosition.length){
                            if (abilityPosition[i].includes(Number(chessman[1][0]))) {
                                abilityPosition[i].splice(abilityPosition[i].indexOf(Number(chessman[1][0])), 1);
                                if (i===3) {    // <-- barrier clean fixed -- hidden unknown bug(dif time => splice a mistake(very hard to trigger))
                                    barrierPosition[barrierPosition.indexOf(Number(chessman[1][0]))] = null;
                                }
                            }
                            i++;
                        }
                        let aimPosition = chessmanPosition.indexOf(Number(chessman[1][0]));
                        unavailablePosition.splice(aimPosition, 1);
                        positionOwners.splice(aimPosition, 1);
                        chessmanPosition.splice(aimPosition, 1);
                    } else {    // copy old replace new
                        // let originNode = document.getElementById(chessman[1][0]).cloneNode(true);
                        // document.getElementById("gameMap").replaceChild(document.getElementById(chessman[1][0]), document.getElementById(chessman[1][1]));
                        // document.getElementById(chessman[1][0]).id = chessman[1][1];
                        // document.getElementById("gameMap").insertBefore(originNode, document.getElementById(String(Number(chessman[1][0])+1)));
                        let originNode = document.getElementById(chessman[1][0]).cloneNode(true);
                        originNode.id = chessman[1][1];
                        document.getElementById("gameMap").replaceChild(originNode, document.getElementById(chessman[1][1]));
                        let i = 0;
                        while(i < abilityPosition.length){
                            if (abilityPosition[i].includes(Number(chessman[1][0]))) {
                                abilityPosition[i][abilityPosition[i].indexOf(Number(chessman[1][0]))] = Number(chessman[1][1]);
                                if (i===3) {    // <-- barrier clean fixed -- hidden unknown bug(dif time => splice a mistake(very hard to trigger))
                                    barrierPosition[barrierPosition.indexOf(Number(chessman[1][0]))] = Number(chessman[1][1]);
                                }
                            }
                            i++;
                        }
                        let aimPosition = chessmanPosition.indexOf(Number(chessman[1][0]));
                        unavailablePosition[aimPosition] = Number(chessman[1][1]);
                        chessmanPosition[aimPosition] = Number(chessman[1][1]);
                        // win check
                        availiable_Calculation_Chessman_Types.forEach(availiable_Calculation_Chessman_Type => {
                            if(abilityPosition[availiable_Calculation_Chessman_Type].includes(Number(chessman[1][1]))){
                                winChecker([availiable_Calculation_Chessman_Type, Number(chessman[1][1]), positionOwners[chessmanPosition.indexOf(Number(chessman[1][1]))], NaN]);
                            }
                        });
                    }
                    // replace a new cell -> clean old
                    let cell = document.createElement("img");
                    cell.classList.add('cells');
                    cell.setAttribute("onclick", "applyForPut(this)");
                    cell.id = chessman[1][0];
                    document.getElementById("gameMap").replaceChild(cell, document.getElementById(chessman[1][0]));
                    document.getElementById(chessman[1][1]).style.border = "1px solid green";
                    document.getElementById(chessman[1][0]).style.border = "1px solid green";
                    setTimeout(() => {document.getElementById(Number(chessman[1][0])).style.border = "unset"}, 3000);
                    break;
                case 2:
                    chessmanPosition.push(chessman[1]);
                    if (chessman[2] === myNumber) {
                        unavailablePosition.push(chessman[1]);
                        aimCell = document.getElementById(String(chessman[1]));
                        aimCell.setAttribute("src", abilitiesURLS[2]);
                    } else {
                        unavailablePosition.push(null);
                    }
                    positionOwners.push(chessman[2]);
                    abilityPosition[2].push(chessman[1]);
                    break;
                case 3:
                    // cleanTrap
                    if (abilityPosition[2].includes(chessman[1])) {
                        let aimPosition = chessmanPosition.indexOf(chessman[1]);
                        if (aimPosition !== -1) {
                            unavailablePosition.splice(aimPosition, 1);
                            positionOwners.splice(aimPosition, 1);
                            chessmanPosition.splice(aimPosition, 1);
                        }
                        abilityPosition[2].splice(abilityPosition[2].indexOf(chessman[1]), 1);
                    }

                    chessmanPosition.push(chessman[1]);
                    unavailablePosition.push(chessman[1]);  // be taken up cells
                    positionOwners.push(chessman[2]);
                    abilityPosition[3].push(chessman[1]);
                    // remind change for all player
                    if (cellId !== null) {
                        document.getElementById(String(cellId)).style.border = "unset";
                    }
                    cellId = chessman[1];

                    // draw the color of chessman from player
                    player = players[chessman[2]];
                    aimCell = document.getElementById(String(cellId));
                    document.getElementById(String(cellId)).style.border = "1px solid red";
                    aimCell.style.transition = "18s";
                    barrierPosition.push(cellId);
                    setTimeout(removeBarrier, 6000);
                    aimCell.style.opacity = "0";
                    aimCell.setAttribute("src", abilitiesURLS[3]);
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
}

function removeBarrier() {
    if (!barrierPosition[0]) {  // forbid error appear after reset canvasMap
        if (barrierPosition[0] === null) {
            barrierPosition.splice(0, 1);
        }
        return;
    }
    // aimCell = document.getElementById(String(barrierPosition[0]));
    // aimCell.removeAttribute("style");
    // aimCell.classList.remove('owner'+ ownerId);
    // // Notice: this png only adjust 33x33px cells & border 1px frame !!!!!
    // aimCell.setAttribute("src", "img/void.png");    // avoid Error img appearing

    // replace a new cell -> clean old
    let cell = document.createElement("img");
    cell.classList.add('cells');
    cell.setAttribute("onclick", "applyForPut(this)");
    cell.id = barrierPosition[0];
    document.getElementById("gameMap").replaceChild(cell, document.getElementById(String(barrierPosition[0])));

    let aimPosition = unavailablePosition.indexOf(barrierPosition[0]);   // locate old data
    positionOwners.splice(aimPosition, 1);
    chessmanPosition.splice(aimPosition, 1);
    unavailablePosition.splice(aimPosition, 1);
    barrierPosition.splice(0, 1);
    abilityPosition[3].splice(abilityPosition[3].indexOf(barrierPosition[0], 1));
}

function chooseAbility(index) {
    if (ready) {
        alert("ability only can be chosen before you get ready!");
        return;
    }
    switch (index) {
        case 1:
            if(!confirm('Choose "move"(6 cost): move a chessman to a void place aritrarily')){index = null};
            break;
        case 2:
            if(!confirm('Choose "trap"(4 cost): take up a cell and if enemy put here will bacome barrier which is only last 6s')){index = null};
            break;
        case 3:
            if(!confirm('Choose "barrier"(4 cost): summon a barrier last 6 seconds at void place')){index = null};
            break;
        default:
            break;
    }
    if (index !== null) {
        myAbility = index;
        let abilityNodes = document.getElementsByClassName("abilities");
        let i = 0;
        while (i < abilityNodes.length) {
            if (i == myAbility -1) {
                abilityNodes[i].style.border = '1px solid red';
            } else {
                abilityNodes[i].style.border = 'unset';
            }
            i++;
        }
    }
}

function changeActiveAbility(abilityIndex) {
    if (abilityIndex) {
        document.getElementById("domAbility1").style.bottom = "-30px";
        document.getElementById("domAbility2").style.bottom = "0px";
    } else {
        document.getElementById("domAbility2").style.bottom = "-30px";
        document.getElementById("domAbility1").style.bottom = "0px";

        // clean active ability style
        if (selectedPosition !== null) {
            document.getElementById(selectedPosition).style.border = "unset";   
        }
    }
    switch (abilityIndex) {
        case 0:
            activeCost = modeSetting[1][1];
            activeAbility = 0;
            break;
        case 1:
            activeCost = modeSetting[1][2];
            activeAbility = 1;
            break;
        case 2:
            activeCost = modeSetting[1][3];
            activeAbility = 2;
            break;
        case 3:
            activeCost = modeSetting[1][4];
            activeAbility = 3;
            break;
        default:
            break;
    }
}

function nextTurn() {
    if (turn == myNumber) {
        document.getElementById("canvasMap").style.backgroundColor = 'rgb(28, 33, 40)';
    }
    turn++;
    if(turn >= players.length){
        turn = 1;
    }
    let controller = false;
    while (kickNumbers.includes(turn)) {
        turn++;
        if(turn >= players.length){
            if (controller) {
                alert("Error: no player in game");
                break;
            }
            turn = 1;
            controller = true;
        }
    }
    if (turn == myNumber) {
        document.getElementById("canvasMap").style.backgroundColor = 'rgb(80,83,80)';
    }
    document.getElementById("nowTurn").innerHTML = "Now Turn: "+turn+" ";
    // waiting time
    if (timer) {
        clearInterval(timer);
    }
    if (modeSetting[0][0]) {       // warning: recursion
        waitingTime = maxWaitingTime;
        timer = setInterval(countDown, 1000);
    }
}

function energy(consume = 0) {
    if(!lastOperationTime){
        lastOperationTime = startTime;
    }
    let now = new Date();
    let t = now.getTime() - lastOperationTime;
    if(t > maxEnergy*1000){
        leftEnergy = maxEnergy*1000 - consume*1000;
    } else {
        leftEnergy = t - consume*1000;
    }
    if(consume){
        lastOperationTime = now.getTime() - leftEnergy;
    }
    return leftEnergy;
}

function reDraw(playerNumber, reDrawType) {
    let t = 0;
        let aims = document.getElementsByClassName("owner"+ playerNumber);
        while (t < aims.length) {
            aims[t].removeAttribute("style");
            switch (reDrawType) {
                case 1:     // update chessmans icon
                    aims[t].setAttribute('src', players[playerNumber][2]);
                    break;
                case 2:     // clean someone chessmans
                    aims[t].removeAttribute("src");
                    aims[t].classList.remove("owner"+ playerNumber);
                    break;
                default:
                    break;
            }
        }
}

// autoScroll the scrollbar
document.getElementById("chatBox").addEventListener('onmouseover', ()=>{ ifAutoScroll = false;});
document.getElementById("chatBox").addEventListener('onmouseout', ()=>{ ifAutoScroll = true;});

// Listen for press enter in message box
document.getElementById("sendMessageBox").addEventListener('keypress', enter);
function enter(e) {
    let event = e;
    if (event.which && event.keyCode == '13'){
        document.getElementById("sendButton").click();
    }
}

function countDown() {
    if (waitingTime === 0) {
        nextTurn();
    }
    waitingTime--;
    document.getElementById("modeOutput").innerHTML = "Spare Time: "+ waitingTime;
}

function resetMap() {
    if (timer) {
        clearInterval(timer);
    }
    document.getElementById("canvasMap").style.backgroundColor = 'rgb(28, 33, 40)';
    players = [5];  // [ maxPlayerNumber, [number, peerId, icon, name] ]
    deliver = null;
    chessmanPosition = [];
    unavailablePosition = [];
    positionOwners = [];
    clickTimes = 0;
    lastAimPosition = 0;
    leftEnergy = 0;
    lastOperationTime = 0;
    turn = 1;
    maxEnergy = modeSetting[1][0];
    gameMap = [mapSize]
    myNumber = null;
    kickNumbers = new Array();
    offlinePlayer = [];
    lastGameMap = null;
    timer = null;
    myAbility = 0;
    activeAbility = 0;
    activeCost = 6;
    abilityPosition = new Array();
    cellId = null;
    aimCell = null;
    selectedPosition = null;
    ready = false;
    barrierPosition = new Array();
    startTime = null;
    gameInfo = [6, players, gameMap, gameMode, startTime, unavailablePosition, positionOwners, modeSetting];
    if (parent) {
        alert("Reset canvasMap(ready again too!)");
        drawMap();
        modeModify(gameMode[0], modeSetting);
    } else {
        liveSend([6, players, gameMap, gameMode, null, unavailablePosition, positionOwners, modeSetting]);
        drawMap();
        modeModify(gameMode[0]);
        document.getElementById("gameMode").selectedIndex = gameMode[0];
    }
    document.getElementById("playersList").innerHTML = "";
}

function hiddenAbility() {
    let i = 0;
    let aimArray = document.getElementsByClassName("domAbilities");
    while (i < aimArray.length) {
        if (aimArray[i].style.display == 'none') {
            aimArray[i].style.display = 'inline';
        } else {
            aimArray[i].style.display = 'none';
        }
        i++;
    }
}