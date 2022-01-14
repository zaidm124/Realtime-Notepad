import io from "socket.io-client";
import Peer from "peerjs";
import { useEffect, useState } from "react";

const socket = io("/");

function VoiceRoom(props) {
  const myVideo = document.createElement("video");
  myVideo.muted = true;

  // let peer = new Peer(undefined, {
  //   key: "peerjs",
  //   debug: 2,
  //   secure: process.env.REACT_APP_ENV === "PRODUCTION" ? true : false, // secure : false for http connection
  // });

  var peer = new Peer({
    key: "peerjs",
    debug: 3,
    config: {
      iceServers: [
        { url: "stun:stun.l.google.com:19302" }, // Pass in optional STUN and TURN server for maximum network compatibility
        {
          url: "turn:numb.viagenie.ca:3478",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
        {
          url: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
        {
          url: "turn:numb.viagenie.ca:3478",
          credential: "peerjsdemo",
          username: "p.srikanta@gmail.com",
        },
        {
          url: "turn:192.158.29.39:3478?transport=udp",
          credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
          username: "28224511:1379330808",
        },
        {
          url: "turn:192.158.29.39:3478?transport=tcp",
          credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
          username: "28224511:1379330808",
        },
      ],
    },
  });

  // window.onbeforeunload = function (e) {
  //   socket.disconnect();
  // };

  useEffect(() => {
    window.onpopstate = (e) => {
      socket.close();
      console.log("socket disconnect should fire.");
    };
  });

  socket.on("disconnect", () => {
    socket.open();
  });

  const [myVideoStream, setVideoStream] = useState();
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setVideoStream(stream);
        console.log("myVideoStream");
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
          console.log("hello");
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
          });
        });

        socket.on("user-connected", (userId) => {
          console.log("user joined", userId);
          connectToNewUser(userId, stream);
        });

        socket.on("user-disconnected", (userId) => {
          console.log("user left", userId);
          if (peers[userId]) {
            peers[userId].close();
          }
        });
      });

    peer.on("open", (id) => {
      console.log(id);
      socket.emit("join-room", props.roomId, id);
    });
  }, []);

  const peers = {};

  const connectToNewUser = (userId, stream) => {
    console.log(userId);
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    peers[userId] = call;
  };

  const addVideoStream = (video, stream) => {
    const VideoGrid = document.getElementById("video-grid");
    console.log(VideoGrid);
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    VideoGrid.append(video);
  };

  const muteUnmute = () => {
    console.log(myVideoStream);
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      document.getElementById("sound").innerHTML = "unmute";
    } else {
      myVideoStream.getAudioTracks()[0].enabled = true;
      document.getElementById("sound").innerHTML = "mute";
    }
  };

  return (
    <div className="App">
      <button id="sound" onClick={muteUnmute}>
        Mute
      </button>
      <div id="video-grid"></div>
    </div>
  );
}

export default VoiceRoom;
