const socket = io("/"); //create our socket
const videoGrid = document.getElementById("video-grid"); //find the video grid element
const myVideo = document.createElement("video");  // creating a new video element 
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
let myVideo2 = document.createElement("video");
const videoGrid2 = document.getElementById("video-grid2");
var currentPeer;
myVideo.muted = true;  // Mute ourselves on our end so there is no feedback loop


// backBtn.addEventListener("click", () => {
//   document.querySelector(".main__left").style.display = "flex";
//   document.querySelector(".main__left").style.flex = "1";
//   document.querySelector(".main__right").style.display = "none";
//   document.querySelector(".header__back").style.display = "none";
// });

// showChat.addEventListener("click", () => {
//   document.querySelector(".main__right").style.display = "flex";
//   document.querySelector(".main__right").style.flex = "1";
//   document.querySelector(".main__left").style.display = "none";
//   document.querySelector(".header__back").style.display = "block";*/
// });

const user = prompt("Enter your name");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
navigator.mediaDevices               // Access the user's video and audio
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);   //Display our video to ourselves

    peer.on("call", (call) => {          // When we join someone's room we will receive a call from them
      call.answer(stream);               // Stream them our video/audio
      const video = document.createElement("video");  // Create a video tag for them
      call.on("stream", (userVideoStream) => {    // When we recieve their stream
        addVideoStream(video, userVideoStream);   // Display their video to ourselves
      });
      currentPeer=call.peerConnection;
    });
 
    socket.on("user-connected", (userId) => {       // If a new user connect
      connectToNewUser(userId, stream);             
    });
  });

const connectToNewUser = (userId, stream) => {      // This runs when someone joins our room
  const call = peer.call(userId, stream);           // Call the user who just joined
  // Add their video
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  // If they leave, remove their video
  call.on('close', () => {
    video.remove()
})
};

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream, _videoGrid= videoGrid) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {    
    video.play();                 // Play the video as it loads
    _videoGrid.append(video);     // Append video element to videoGrid
    
  });
};

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});

stopVideo.addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
  });

// function stopScreenShare(){
//   let videoTrack = myStream.getVideoTracks()[0];
//   var sender= currentPeer.getSenders().find(function(s){
//     return s.track.kind == videoTrack.kind;
//   })
// }

// document.getElementById('share-button').addEventListener('click', async () => {
  
//     let displayMediaStream = await navigator.mediaDevices.getDisplayMedia();
   
  
//   let temp1234 = videoGrid.appendChild(myVideo2);
//   //show what you are showing in your "self-view" video.
//   //document.getElementById('video-grid').srcObject = displayMediaStream;                           //ScreenShare Feature in Development
//   addVideoStream(myVideo2, displayMediaStream )

//   //hide the share button and display the "stop-sharing" one
//   document.getElementById('share-button').style.display = 'none';
//   document.getElementById('stop-share-button').style.display = 'inline';
// });

// document.getElementById('stop-share-button').addEventListener('click', async (event) => {
//   myVideo2.remove()
//   myVideo2=document.createElement("video");
//   /*senders.find(sender => sender.track.kind === 'video')
//     .replaceTrack(userMediaStream.getTracks().find(track => track.kind === 'video'));
//   document.getElementById('video-grid').srcObject = userMediaStream;*/
//   document.getElementById('share-button').style.display = 'inline';
//   document.getElementById('stop-share-button').style.display = 'none';
// });

/*const addVideoStream2 = (video, stream) => {
  
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid2.append(video);
    
  });
};*/

// var hand = document.querySelector("#hand");
// var submit = document.querySelector("#submit");
// hand.addEventListener("submit", function(e) {
//   e.preventDefault();
// }); 
// submit.addEventListener("click", function() {
//   if (submit.innerText == "Raise Hand") {
//     submit.style.background = "orange";                                          //Raise Hand Feature in Development
//     submit.innerText = "Hand Raised";
//     socket.emit("raise-hand");
//   } else {
//     submit.style.background = "#1762A7";
//     submit.innerText = "Raise Hand";
//     socket.emit("hand-raised");
//   }
// });
socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});
