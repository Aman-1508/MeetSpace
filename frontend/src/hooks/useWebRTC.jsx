import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "./useSocket";

const ICE_SERVERS = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

export const useWebRTC = (roomId, localStream) => {
    const socket = getSocket();
    const peersRef = useRef({});
    const [peers, setPeers] = useState({});

    const createPeer = useCallback((targetId, isInitiator) => {
        if (peersRef.current[targetId]) return peersRef.current[targetId];

        const peer = new RTCPeerConnection(ICE_SERVERS);

        if (localStream) {
            localStream.getTracks().forEach(track => {
                peer.addTrack(track, localStream);
            });
        }

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit("signal", targetId, {
                    type: "ice-candidate",
                    candidate: e.candidate,
                });
            }
        };

        peer.ontrack = (e) => {
            setPeers(prev => ({ ...prev, [targetId]: e.streams[0] }));
        };

        peer.onconnectionstatechange = () => {
            if (["disconnected", "failed", "closed"].includes(peer.connectionState)) {
                setPeers(prev => {
                    const updated = { ...prev };
                    delete updated[targetId];
                    return updated;
                });
                delete peersRef.current[targetId];
            }
        };

        if (isInitiator) {
            peer.createOffer()
                .then(offer => peer.setLocalDescription(offer))
                .then(() => {
                    socket.emit("signal", targetId, {
                        type: "offer",
                        sdp: peer.localDescription,
                    });
                });
        }

        peersRef.current[targetId] = peer;
        return peer;
    }, [socket, localStream]);

    useEffect(() => {
        if (!localStream || !roomId) return;

        socket.emit("join-call", roomId);

        socket.on("user-joined", (userId) => {
            if (userId !== socket.id) {
                createPeer(userId, true);
            }
        });

        socket.on("signal", (fromId, message) => {
            if (message.type === "offer") {
                const peer = createPeer(fromId, false);
                peer.setRemoteDescription(new RTCSessionDescription(message.sdp))
                    .then(() => peer.createAnswer())
                    .then(answer => peer.setLocalDescription(answer))
                    .then(() => {
                        socket.emit("signal", fromId, {
                            type: "answer",
                            sdp: peer.localDescription,
                        });
                    });
            } else if (message.type === "answer") {
                const peer = peersRef.current[fromId];
                if (peer) peer.setRemoteDescription(new RTCSessionDescription(message.sdp));
            } else if (message.type === "ice-candidate") {
                const peer = peersRef.current[fromId];
                if (peer && message.candidate) {
                    peer.addIceCandidate(new RTCIceCandidate(message.candidate)).catch(() => {});
                }
            }
        });

        socket.on("user-left", (userId) => {
            if (peersRef.current[userId]) {
                peersRef.current[userId].close();
                delete peersRef.current[userId];
            }
            setPeers(prev => {
                const updated = { ...prev };
                delete updated[userId];
                return updated;
            });
        });

        return () => {
            socket.off("user-joined");
            socket.off("signal");
            socket.off("user-left");
            Object.values(peersRef.current).forEach(p => p.close());
            peersRef.current = {};
            setPeers({});
        };
    }, [roomId, localStream, socket, createPeer]);

    // Replace track when stream changes (screen share / cam toggle)
    const replaceTrack = useCallback((newStream) => {
        const videoTrack = newStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(peer => {
            const sender = peer.getSenders().find(s => s.track?.kind === "video");
            if (sender && videoTrack) sender.replaceTrack(videoTrack);
        });
    }, []);

    return { peers, replaceTrack };
};