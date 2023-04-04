// ==UserScript==
// @name         Chess.com Bot
// @namespace    elicul
// @version      1.0.0
// @description  Chess.com Bot for finding the best next move
// @author       elicul
// @match       https://www.chess.com/play/*
// @match       https://www.chess.com/game/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// @grant       GM_registerMenuCommand
// @resource    stockfish.js        https://raw.githubusercontent.com/Auzgame/remote/main/stockfish.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js
// @run-at      document-start
// ==/UserScript==

"use strict";

function main() {
    var stockFishObjectURL;
    var lastValue = 10;
    const engine = document.engine = {};
    const chessBotVariables = document.chessBotVariables = {};
    chessBotVariables.autoMovePiece = false;
    chessBotVariables.autoRun = true;
    chessBotVariables.delay = 0.1;
    const chessBotFunctions = document.chessBotFunctions = {};

    stop_b = stop_w = 0;
    s_br = s_br2 = s_wr = s_wr2 = 0;
    obs = "";

    chessBotFunctions.rescan = function (lev) {
        var ari = $("chess-board")
            .find(".piece")
            .map(function () {
                return this.className;
            })
            .get();
        jack = ari.map(f => f.substring(f.indexOf(' ') + 1));
        function removeWord(arr, word) {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].replace(word, '');
            }
        }
        removeWord(ari, 'square-');
        jack = ari.map(f => f.substring(f.indexOf(' ') + 1));
        for (var i = 0; i < jack.length; i++) {
            jack[i] = jack[i].replace('br', 'r')
                .replace('bn', 'n')
                .replace('bb', 'b')
                .replace('bq', 'q')
                .replace('bk', 'k')
                .replace('bb', 'b')
                .replace('bn', 'n')
                .replace('br', 'r')
                .replace('bp', 'p')
                .replace('wp', 'P')
                .replace('wr', 'R')
                .replace('wn', 'N')
                .replace('wb', 'B')
                .replace('br', 'R')
                .replace('wn', 'N')
                .replace('wb', 'B')
                .replace('wq', 'Q')
                .replace('wk', 'K')
                .replace('wb', 'B')
        }
        str2 = "";
        var count = 0,
            str = "";
        for (var j = 8; j > 0; j--) {
            for (var i = 1; i < 9; i++) {
                (str = (jack.find(el => el.includes([i] + [j])))) ? str = str.replace(/[^a-zA-Z]+/g, '') : str = "";
                if (str == "") {
                    count++;
                    str = count.toString();
                    if (!isNaN(str2.charAt(str2.length - 1))) str2 = str2.slice(0, -1);
                    else {
                        count = 1;
                        str = count.toString()
                    }
                }
                str2 += str;
                if (i == 8) {
                    count = 0;
                    str2 += "/";
                }
            }
        }
        str2 = str2.slice(0, -1);
        //str2=str2+" KQkq - 0"
        color = "";
        wk = wq = bk = bq = "0";
        const move = $('vertical-move-list')
            .children();
        if (move.length < 2) {
            stop_b = stop_w = s_br = s_br2 = s_wr = s_wr2 = 0;
        }
        if (stop_b != 1) {
            if (move.find(".black.node:contains('K')")
                .length) {
                bk = "";
                bq = "";
                stop_b = 1;
                // console.log('debug secb');
            }
        } else {
            bq = "";
            bk = "";
        }
        if (stop_b != 1) (bk = (move.find(".black.node:contains('O-O'):not(:contains('O-O-O'))")
            .length) ? "" : "k") ? (bq = (move.find(".black.node:contains('O-O-O')")
                .length) ? bk = "" : "q") : bq = "";
        if (s_br != 1) {
            if (move.find(".black.node:contains('R')")
                .text()
                .match('[abcd]+')) {
                bq = "";
                s_br = 1
            }
        } else bq = "";
        if (s_br2 != 1) {
            if (move.find(".black.node:contains('R')")
                .text()
                .match('[hgf]+')) {
                bk = "";
                s_br2 = 1
            }
        } else bk = "";
        if (stop_b == 0) {
            if (s_br == 0)
                if (move.find(".white.node:contains('xa8')")
                    .length > 0) {
                    bq = "";
                    s_br = 1;
                    // console.log('debug b castle_r');
                }
            if (s_br2 == 0)
                if (move.find(".white.node:contains('xh8')")
                    .length > 0) {
                    bk = "";
                    s_br2 = 1;
                    // console.log('debug b castle_l');
                }
        }
        if (stop_w != 1) {
            if (move.find(".white.node:contains('K')")
                .length) {
                wk = "";
                wq = "";
                stop_w = 1;
                // console.log('debug secw');
            }
        } else {
            wq = "";
            wk = "";
        }
        if (stop_w != 1) (wk = (move.find(".white.node:contains('O-O'):not(:contains('O-O-O'))")
            .length) ? "" : "K") ? (wq = (move.find(".white.node:contains('O-O-O')")
                .length) ? wk = "" : "Q") : wq = "";
        if (s_wr != 1) {
            if (move.find(".white.node:contains('R')")
                .text()
                .match('[abcd]+')) {
                wq = "";
                s_wr = 1
            }
        } else wq = "";
        if (s_wr2 != 1) {
            if (move.find(".white.node:contains('R')")
                .text()
                .match('[hgf]+')) {
                wk = "";
                s_wr2 = 1
            }
        } else wk = "";
        if (stop_w == 0) {
            if (s_wr == 0)
                if (move.find(".black.node:contains('xa1')")
                    .length > 0) {
                    wq = "";
                    s_wr = 1;
                    // console.log('debug w castle_l');
                }
            if (s_wr2 == 0)
                if (move.find(".black.node:contains('xh1')")
                    .length > 0) {
                    wk = "";
                    s_wr2 = 1;
                    // console.log('debug w castle_r');
                }
        }
        if ($('.coordinates')
            .children()
            .first()
            .text() == 1) {
            str2 = str2 + " b " + wk + wq + bk + bq;
            color = "white";
        } else {
            str2 = str2 + " w " + wk + wq + bk + bq;
            color = "black";
        }
        //console.log(str2);
        return str2;
    }
    chessBotFunctions.color = function (dat) {
        response = dat;
        var res1 = response.substring(0, 2);
        var res2 = response.substring(2, 4);

        if (chessBotVariables.autoMove == true) {
            chessBotFunctions.movePiece(res1, res2);
        }
        isThinking = false;

        res1 = res1.replace(/^a/, "1")
            .replace(/^b/, "2")
            .replace(/^c/, "3")
            .replace(/^d/, "4")
            .replace(/^e/, "5")
            .replace(/^f/, "6")
            .replace(/^g/, "7")
            .replace(/^h/, "8");
        res2 = res2.replace(/^a/, "1")
            .replace(/^b/, "2")
            .replace(/^c/, "3")
            .replace(/^d/, "4")
            .replace(/^e/, "5")
            .replace(/^f/, "6")
            .replace(/^g/, "7")
            .replace(/^h/, "8");
        $('chess-board')
            .prepend('<div class="highlight square-' + res2 + ' bro" style="background-color: rgb(235, 97, 80); opacity: 0.71;" data-test-element="highlight"></div>')
            .children(':first')
            .delay(1800)
            .queue(function () {
                $(this)
                    .remove();
            });
        $('chess-board')
            .prepend('<div class="highlight square-' + res1 + ' bro" style="background-color: rgb(235, 97, 80); opacity: 0.71;" data-test-element="highlight"></div>')
            .children(':first')
            .delay(1800)
            .queue(function () {
                $(this)
                    .remove();
            });
    }
    chessBotFunctions.movePiece = function (from, to) {
        for (var each in $('chess-board')[0].game.getLegalMoves()) {
            if ($('chess-board')[0].game.getLegalMoves()[each].from == from) {
                if ($('chess-board')[0].game.getLegalMoves()[each].to == to) {
                    var move = $('chess-board')[0].game.getLegalMoves()[each];
                    $('chess-board')[0].game.move({
                        ...move,
                        promotion: 'false',
                        animate: false,
                        userGenerated: true
                    });
                }
            }
        }
    }
    chessBotFunctions.reloadChessEngine = function () {
        engine.engine.terminate();
        isThinking = false;
        chessBotFunctions.loadChessEngine();
    }
    chessBotFunctions.loadChessEngine = function () {
        if (!stockFishObjectURL) {
            stockFishObjectURL = URL.createObjectURL(new Blob([GM_getResourceText('stockfish.js')], { type: 'application/javascript' }));
        }
        if (stockFishObjectURL) {
            engine.engine = new Worker(stockFishObjectURL);

            engine.engine.onmessage = e => {
                parser(e);
            };
            engine.engine.onerror = e => {
                console.error("Worker Error: " + e);
            };

            engine.engine.postMessage('ucinewgame');
        }
        console.log('Chess engine loaded');
    }
    chessBotFunctions.runChessEngine = function (depth) {
        //var fen = chessBotFunctions.rescan();
        var fen = $('chess-board')[0].game.getFEN();
        engine.engine.postMessage(`position fen ${fen}`);
        // console.log('updated: ' + `position fen ${fen}`);
        isThinking = true;
        engine.engine.postMessage(`go depth ${depth}`);
        lastValue = depth;
    }
    chessBotFunctions.autoRun = function (lstValue) {
        if ($('chess-board')[0].game.getTurn() == $('chess-board')[0].game.getPlayingAs()) {
            chessBotFunctions.runChessEngine(lstValue);
        }
    }

    function parser(e) {
        if (e.data.includes('bestmove')) {
            // console.log(e.data.split(' ')[1]);
            chessBotFunctions.color(e.data.split(' ')[1]);
            isThinking = false;
        }
    }

    document.onkeydown = function (e) {
        switch (e.keyCode) {
            case 81:
                chessBotFunctions.runChessEngine(1);
                break;
            case 87:
                chessBotFunctions.runChessEngine(2);
                break;
            case 69:
                chessBotFunctions.runChessEngine(3);
                break;
            case 82:
                chessBotFunctions.runChessEngine(4);
                break;
            case 84:
                chessBotFunctions.runChessEngine(5);
                break;
            case 89:
                chessBotFunctions.runChessEngine(6);
                break;
            case 85:
                chessBotFunctions.runChessEngine(7);
                break;
            case 73:
                chessBotFunctions.runChessEngine(8);
                break;
            case 79:
                chessBotFunctions.runChessEngine(9);
                break;
            case 80:
                chessBotFunctions.runChessEngine(10);
                break;
            case 65:
                chessBotFunctions.runChessEngine(11);
                break;
            case 83:
                chessBotFunctions.runChessEngine(12);
                break;
            case 68:
                chessBotFunctions.runChessEngine(13);
                break;
            case 70:
                chessBotFunctions.runChessEngine(14);
                break;
            case 71:
                chessBotFunctions.runChessEngine(15);
                break;
            case 72:
                chessBotFunctions.runChessEngine(16);
                break;
            case 74:
                chessBotFunctions.runChessEngine(17);
                break;
            case 75:
                chessBotFunctions.runChessEngine(18);
                break;
            case 76:
                chessBotFunctions.runChessEngine(19);
                break;
            case 90:
                chessBotFunctions.runChessEngine(20);
                break;
            case 88:
                chessBotFunctions.runChessEngine(21);
                break;
            case 67:
                chessBotFunctions.runChessEngine(22);
                break;
            case 86:
                chessBotFunctions.runChessEngine(23);
                break;
            case 66:
                chessBotFunctions.runChessEngine(24);
                break;
            case 78:
                chessBotFunctions.runChessEngine(25);
                break;
            case 77:
                chessBotFunctions.runChessEngine(26);
                break;
            case 187:
                chessBotFunctions.runChessEngine(100);
                break;
        }
    };

    var loaded = false;
    chessBotFunctions.loadEx = function () {
        try {
            var tmpStyle;
            var tmpDiv;

            var div = document.createElement('div')
            var content = `<div style="margin: 0 0 0 8px;"><br><input type="checkbox" id="autoRun" name="autoRun" value="true">
<label for="autoRun"> Enable auto run</label><br>
<input type="checkbox" id="autoMove" name="autoMove" value="false">
<label for="autoMove"> Enable auto move</label><br>
<input type="number" id="timeDelay" name="timeDelay" min="0.1" value=0.1>
<label for="timeDelay">Auto Run Delay (Seconds)</label></div>`
            div.innerHTML = content;
            div.setAttribute('style', 'background-color:#312e2b; height:auto;');
            div.setAttribute('id', 'settingsContainer');

            $('chess-board')[0].parentElement.parentElement.appendChild(div);

            //Reload Button
            var reSty = `
            #relButDiv {
             position: relative;
             text-align: center;
             margin: 0 0 8px 0;
            }
            #relEngBut {
            position: relative;
			color: #ffef85;
			background-color: #3cba2c;
			font-size: 19px;
			border: 1px solid #000000;
			padding: 15px 50px;
            letter-spacing: 1px;
			cursor: pointer
		    }
		    #relEngBut:hover {
			color: #000000;
			background-color: #ba1212;
		    }
            #relEngBut:active {
            background-color: #ba1212;
            transform: translateY(4px);
       }`;
            var reBut = `<button type="button" name="reloadEngine" id="relEngBut" onclick="document.chessBotFunctions.reloadChessEngine()">Reload Chess Engine</button>`;
            tmpDiv = document.createElement('div');
            var relButDiv = document.createElement('div');
            relButDiv.id = 'relButDiv';
            tmpDiv.innerHTML = reBut;
            reBut = tmpDiv.firstChild;

            tmpStyle = document.createElement('style');
            tmpStyle.innerHTML = reSty;
            document.head.append(tmpStyle);

            relButDiv.append(reBut);
            div.append(relButDiv);

            loaded = true;
        } catch (error) { console.error(error) }
    }


    function other(delay) {
        var endTime = Date.now() + delay;
        var timer = setInterval(() => {
            if (Date.now() >= endTime) {
                chessBotFunctions.autoRun(lastValue);
                canGo = true;
                clearInterval(timer);
            }
        }, 10);
    }

    const waitForChessBoard = setInterval(() => {
        if (loaded) {
            chessBotVariables.autoRun = $('#autoRun')[0].checked;
            chessBotVariables.autoMove = $('#autoMove')[0].checked;
            chessBotVariables.delay = $('#timeDelay')[0].value;
            chessBotVariables.isThinking = isThinking;
            if ($('chess-board')[0].game.getTurn() == $('chess-board')[0].game.getPlayingAs()) { myTurn = true; } else { myTurn = false; }
        } else {
            chessBotFunctions.loadEx();
        }

        if (!engine.engine) {
            chessBotFunctions.loadChessEngine();
        }
        if (chessBotVariables.autoRun == true && canGo == true && isThinking == false && myTurn) {
            canGo = false;
            var currentDelay = chessBotVariables.delay != undefined ? chessBotVariables.delay * 1000 : 10;
            other(currentDelay);
        }
    }, 500);
}

var isThinking = false
var canGo = true;
var myTurn = false;

window.addEventListener("load", () => {
    main();
});
