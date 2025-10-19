import React, { useRef, useEffect, useState } from "react";
import useVideoSignaling from "../hooks/useVideoSignaling";

export default function VideoChat({ room }) {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [peer, setPeer] = useState(null);

  // Simple WebRTC peer connection
  useEffect(() => {
    const pc = new RTCPeerConnection();
    setPeer(pc);

    navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(stream => {
      localVideo.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    });

    pc.ontrack = e => { remoteVideo.current.srcObject = e.streams[0]; };
    pc.onicecandidate = e => {
      if (e.candidate) sendSignal({ candidate: e.candidate });
    };
    return () => pc.close();
  }, []);

  const sendSignal = useVideoSignaling(room, async (data) => {
    if (data.sdp) {
      await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
      if (data.sdp.type === "offer") {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        sendSignal({ sdp: peer.localDescription });
      }
    }
    if (data.candidate) peer.addIceCandidate(new RTCIceCandidate(data.candidate));
  }, async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    sendSignal({ sdp: peer.localDescription });
  });

  return (
    <div className="card fade-in">
      <h3>Real-Time Video Chat</h3>
      <video ref={localVideo} autoPlay muted style={{width: "45%"}} />
      <video ref={remoteVideo} autoPlay style={{width: "45%"}} />
    </div>
  );
}
