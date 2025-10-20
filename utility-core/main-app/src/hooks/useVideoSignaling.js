import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
export default function useVideoSignaling(room, onSignal, onPeer) {
  const socket = useRef();
  useEffect(() => {
    socket.current = io("http://localhost:4400");
    socket.current.emit("join", room);
    socket.current.on("signal", onSignal);
    socket.current.on("peer-joined", onPeer);
    return () => socket.current.disconnect();
  }, [room, onSignal, onPeer]);
  return (data) => socket.current.emit("signal", { room, data });
}
