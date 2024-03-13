import { useEffect, useRef, useState } from 'react';
import { socket } from '../utils/socket';
import { useSearchParams } from 'react-router-dom';

let myStream: MediaStream;

function ChatRoom() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('room');
  const myCamRef = useRef<HTMLVideoElement>(null);
  const peerCamRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  // const [myStream, setMyStream] = useState<MediaStream | null>(null);
  // Initialize myPeerConnection with a new RTCPeerConnection
  // const myStream = useRef<MediaStream>();
  const myPeerConnection = useRef<RTCPeerConnection>(new RTCPeerConnection());
  const myDataChannel = useRef<RTCDataChannel>();

  const handleMuteClick = () => {
    myStream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted((state) => !state);
  };
  const handleCameraClick = () => {
    myStream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsCamOn((state) => !state);
  };

  const getMedia = async (deviceId?: string) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: 'user' },
    };
    const camConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        deviceId ? camConstrains : initialConstrains
      );
      // setMyStream(stream);
      myStream = stream;

      if (myCamRef.current) {
        myCamRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createOffer = async () => {
    console.log('offer');

    if (!myPeerConnection.current) return;
    myDataChannel.current = myPeerConnection.current.createDataChannel('chat');
    myDataChannel.current.addEventListener('message', console.log);
    console.log('made data channel');
    // 방을 만드는 offer A가 주체로 다른 브라우저에서 방에 접근하면 실행되는 코드
    const offer = await myPeerConnection.current.createOffer();
    // offer를 가지면 방금 만든 offer로 연결 구성 필요
    await myPeerConnection.current.setLocalDescription(offer);
    console.log('sent the offer');
    // peerB로 위에서 구성한 offer를 보냄
    socket.emit('offer', offer, roomName);
  };

  const offerPc = async (offer: RTCSessionDescriptionInit) => {
    myPeerConnection.current.addEventListener('datachannel', (event) => {
      myDataChannel.current = event.channel;
      myDataChannel.current.addEventListener('message', (event) =>
        console.log(event.data)
      );
    });
    console.log('received the offer');
    myPeerConnection.current.setRemoteDescription(offer);
    const answer = await myPeerConnection.current.createAnswer();
    myPeerConnection.current.setLocalDescription(answer);
    socket.emit('answer', answer, roomName);
    console.log('sent the answer');
  };

  const receiveAnswer = (answer: RTCSessionDescriptionInit) => {
    console.log('received the answer');

    myPeerConnection.current.setRemoteDescription(answer);
  };

  const receiveCandidate = (ice) => {
    console.log('received candidate');
    myPeerConnection.current.addIceCandidate(ice);
  };

  // * RTC Code
  const handleIce = (data) => {
    console.log('sent candidate');
    socket.emit('ice', data.candidate, roomName);
  };

  const handleAddStream = (data) => {
    if (peerCamRef.current) peerCamRef.current.srcObject = data.streams[0];
  };
  const makeConnection = () => {
    // peer to peer connection
    // 각 브라우저 따로 구성
    myPeerConnection.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302',
          ],
        },
      ],
    });
    myPeerConnection.current.addEventListener('icecandidate', handleIce);
    // addstream event is deprecated. and safari no support.
    // myPeerConnection.addEventListener("addstream", handleAddStream);
    myPeerConnection.current.addEventListener('track', handleAddStream);
    // addStream()과 같은 역할
    // track들을 개별적으로 추가해주는 함수
    if (myStream)
      myStream
        .getTracks()
        .forEach((track) =>
          myPeerConnection.current.addTrack(track, myStream as MediaStream)
        );
  };

  useEffect(() => {
    console.log(myCamRef.current?.srcObject);
    if (!myStream) {
      getMedia();
    } else {
      makeConnection();
      socket.emit('join_room', roomName);
      socket.on('welcome', createOffer);
      socket.on('offer', offerPc);
      socket.on('answer', receiveAnswer);
      socket.on('ice', receiveAnswer);
    }
    return () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
        socket.off('welcome', createOffer);
        socket.on('offer', offerPc);
        socket.on('answer', receiveAnswer);
        socket.on('ice', receiveCandidate);
      }
    };
  }, []);

  // useEffect(() => {
  //   if (!myStream) {
  //     getMedia();
  //   } else {
  //     makeConnection();
  //     socket.emit('join_room', roomName);
  //     socket.on('welcome', createOffer);
  //     socket.on('offer', offerPc);
  //     socket.on('answer', receiveAnswer);
  //     socket.on('ice', receiveAnswer);
  //   }
  //   return () => {
  //     if (myStream) {
  //       myStream.getTracks().forEach((track) => track.stop());
  //       socket.off('welcome', createOffer);
  //       socket.on('offer', offerPc);
  //       socket.on('answer', receiveAnswer);
  //       socket.on('ice', receiveCandidate);
  //     }
  //   };
  // }, []);

  return (
    <main>
      {/* <div className="myStream"> */}
      <video ref={myCamRef} playsInline autoPlay muted={isMuted}></video>
      <button
        className="lex-grow inline-flex justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
        onClick={handleMuteClick}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button
        className="lex-grow inline-flex justify-center rounded-md border border-transparent bg-gray-900 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
        onClick={handleCameraClick}
      >
        Camera {isCamOn ? 'Off' : 'On'}
      </button>
      {/*  <select
          value={selectVal}
          onChange={(e) => setSelectVal(e.target.value)}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>*/}
      <video ref={peerCamRef} playsInline autoPlay muted={isMuted}></video>
    </main>
  );
}

export default ChatRoom;
