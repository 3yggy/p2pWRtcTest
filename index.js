var ctx, localPeerConnection, dataChannel, pc,txt,canRec;
const l = window.location;
const protoHostPath = l.protocol+'//'+l.host+l.pathname;
window.onload=function(){
    ctx=document.getElementById('canv').getContext("2d");
    txt = document.getElementById('txt');
    CheckImportantHash();

    function FitCanvas(){
        canv.width  = window.innerWidth;
        canv.height = window.innerHeight;
        canv.width  = window.innerWidth;
        canv.height = window.innerHeight;
        canRec = canv.getBoundingClientRect();
    }
    FitCanvas();
    window.addEventListener('resize', FitCanvas);
    window.requestAnimationFrame(Draw);
    setInterval(GameLoop, 33);

    canv.requestPointerLock = canv.requestPointerLock ||
    canv.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    canv.onclick = function() {
        canv.requestPointerLock();
    };
    
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === canv ||
            document.mozPointerLockElement === canv) {
            document.addEventListener("mousemove", moveHand, false);
        } else {
            document.removeEventListener("mousemove", moveHand, false);
        }
    }
    Init();
}

function CheckImportantHash(){
    const hash = window.location.hash;
    console.log('hash: ',hash);
    if(hash.substring(1,7)=='offer='){
        offerBtn.hidden=true;
        const sdp = decodeURIComponent(hash.substring(7));
        window.history.pushState('data', 'Taking Offer', protoHostPath)
        TakeOffer(sdp);
    } else if(hash.substring(1,9)=='confirm='){
        const sdp = decodeURIComponent(hash.substring(9));
        console.log(sdp);
        window.history.pushState('data', 'Confirming Offer', protoHostPath)
        ConfirmOffer(sdp);
    }
}

pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.ggodsogl12121e.com:19302" }]});
pc.ondatachannel = e => {
    dataChannel = e.channel;
    ChannelInit();
};

/*navigator.mediaDevices.getUserMedia({video:false, audio:true})
  .then(stream => {
      console.log('adding stream');
      pc.addStream(v1.srcObject = stream)
    });
*/

function Connected(){
    txt.value = '';
    offerBtn.hidden=true;
    txt.hidden=true;
    console.log("Connected");
    instructions.innerHTML ='<b>Connected!</b>';
}

function ChannelInit(){
    dataChannel.onopen = () => Connected();
    dataChannel.onmessage = Message;
}

function MakeOffer(){
    dataChannel = pc.createDataChannel("loving");
    ChannelInit();
    
    pc.createOffer().then(d => {pc.setLocalDescription(d);})
    pc.onicecandidate = e => {
        if (e.candidate) return;
        const sdp = pc.localDescription.sdp;
        console.log('offering sdp: ');
        console.log(sdp)+'\n';
        instructions.innerHTML ='Send this to your Friend. Have him go to here. Enter his Answer in the url of <b><u>this tab!</u></b>'
        copyWrite(protoHostPath +'#offer=' + encodeURIComponent(sdp))
    };
}

function TakeOffer(sdp){
    console.log('accepting sdp: ');
    console.log(sdp);
    var desc = new RTCSessionDescription({ type:"offer", sdp:sdp });
    pc.setRemoteDescription(desc).then(() => pc.createAnswer()).then(d => pc.setLocalDescription(d))
    pc.onicecandidate = e => {
        if (e.candidate) return;
        const conf = pc.localDescription.sdp
        console.log('confirming sdp: ');
        console.log(conf)+'\n';
        instructions.innerHTML ='Return this to your Friend. Have him enter this in the url of <b><u>his tab!</u></b>'
        copyWrite(protoHostPath +'#confirm=' + encodeURIComponent(conf))
    }; 
}

function ConfirmOffer(sdp){
    var desc = new RTCSessionDescription({ type:"answer", sdp:sdp });
    pc.setRemoteDescription(desc);
}

function copyWrite(text){
    txt.value = text;
    txt.select();
    txt.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

window.addEventListener('popstate', CheckImportantHash);