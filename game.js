var handNum = 0;
var numHands; var localHands=[];
var clientHands;

function Init(){
    InitHands(5);
}

function InitHands(num){
    numHands=num;
    var newHands = [];
    for (let i = 0; i < num; i++) {
        newHands[i]=localHands[i]||{x:((i)/(num))*canv.width,y:canv.height-105};
    }
    localHands=newHands;
}

function moveHand(e) {
    var h = localHands[handNum];
    h.x += e.movementX;
    h.y += e.movementY;

    if(h.x<0)
        h.x=0;
    else if(h.x>canv.width)
        h.x=canv.width;
    if(h.y<0)
        h.y=0;
    else if(h.y>canv.height)
        h.y=canv.height;

}
function GameLoop(){   
    if(dataChannel?.readyState=='open')
    dataChannel.send(JSON.stringify({localHands}));
}

function Draw(){
    ctx.fillStyle = '#000544';
    ctx.fillRect(0, 0, canv.width, canv.height);
    
    for (let i = 0; i < localHands.length; i++) {
        const hand = localHands[i];

        ctx.fillStyle = i==handNum?'#923325':'#373325';

        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(hand.x, hand.y);
        ctx.lineTo((i/(localHands.length-1))*canv.width, canv.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hand.x+0, hand.y+0);
        ctx.lineTo(hand.x+70,hand.y+5);
        ctx.lineTo(hand.x+100,hand.y+50);
        ctx.lineTo(hand.x+50, hand.y+100);
        ctx.lineTo(hand.x+0, hand.y+90);
        ctx.closePath();
        ctx.fill();
    }
    if(clientHands){
        for (let i = 0; i < clientHands.length; i++) {
            const hand = clientHands[i];

            const y =canv.height-hand.y;
           const x =canv.width-hand.x;

            ctx.fillStyle = '#373325';

            ctx.lineWidth = 15;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(canv.width-(i/(clientHands.length-1))*canv.width, 0);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x+0, y+0);
            ctx.lineTo(x+70,y+5);
            ctx.lineTo(x+100,y+50);
            ctx.lineTo(x+50, y+100);
            ctx.lineTo(x+0, y+90);
            ctx.closePath();
            ctx.fill();
        }
    }
    window.requestAnimationFrame(Draw);
}

function Message(m){
    const data = JSON.parse(m.data);
    //console.log(data);
    if(data.localHands){
        clientHands = data.localHands;
     //   alert(data.localHands)
    }
}

window.addEventListener("keydown", function (event) {
    if(!event.repeat){
        const k = event.key;
        switch(event.key){
            case"h":
                overlay.hidden=!overlay.hidden;
                break
            case"Shift":
                handNum++;
                handNum = handNum%numHands;
                break;
        }
    }
});