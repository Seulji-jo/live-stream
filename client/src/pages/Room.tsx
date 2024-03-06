import { useEffect, useRef, useState } from 'react';
import { socket } from '../utils/socket';
import { useSearchParams } from 'react-router-dom';

interface IOption {
  value: string;
  label: string;
}

function Room() {
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get('room');
  const myCamRef = useRef<HTMLVideoElement>(null);
  const peerCamRef = useRef<HTMLVideoElement>(null);

  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [myPeerConnection, setMyPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [myDataChannel, setMyDataChannel] = useState<RTCDataChannel | null>(
    null
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOn, setIsCamOn] = useState(true);
  const [selectVal, setSelectVal] = useState('');
  const [options, setOptions] = useState<IOption[] | null>(null);

  //event
  const handleMuteClick = () => {
    myStream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };
  const handleCameraClick = () => {
    myStream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsCamOn(!isCamOn);
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      const currCam = myStream?.getVideoTracks()[0];
      const optionList = cameras.map((cam) => {
        if (currCam?.label === cam.label) setSelectVal(cam.label);
        return { value: cam.deviceId, label: cam.label };
      });
      setOptions(optionList);
    } catch (error) {
      console.log(error);
    }
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
      setMyStream(stream);
      if (myCamRef.current)
        (myCamRef.current as HTMLVideoElement).srcObject = stream;
      if (!deviceId) await getCameras();
    } catch (error) {
      console.log(error);
    }
  };

  // RTC Code
  const makeConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:ntk-turn-1.xirsys.com'],
        },
        {
          username:
            '_0MWyJAqUxfOlhrc_gh38b88AUCBboTAiKvyqzehQUI3dHF64eLO7kcdXDWcM9l6AAAAAGXR_bxoYW5uYWg=',
          credential: 'aef19f2c-ce5c-11ee-9bc2-0242ac120004',
          urls: [
            'turn:ntk-turn-1.xirsys.com:80?transport=udp',
            'turn:ntk-turn-1.xirsys.com:3478?transport=udp',
            'turn:ntk-turn-1.xirsys.com:80?transport=tcp',
            'turn:ntk-turn-1.xirsys.com:3478?transport=tcp',
            'turns:ntk-turn-1.xirsys.com:443?transport=tcp',
            'turns:ntk-turn-1.xirsys.com:5349?transport=tcp',
          ],
        },
      ],
    });
    setMyPeerConnection(peerConnection);
  };
  const handleIce = (data: any) => {
    console.log('sent candidate');

    socket.emit('ice', data.candidate, roomName);
  };
  const handleAddStream = (data: any) => {
    if (peerCamRef.current)
      (peerCamRef.current as HTMLVideoElement).srcObject = data.streams[0];
  };

  useEffect(() => {
    (async () => {
      await getMedia();
    })();
    makeConnection();
  }, []);

  useEffect(() => {
    if (myPeerConnection) {
      myPeerConnection.addEventListener('icecandidate', handleIce);
      myPeerConnection.addEventListener('track', handleAddStream);
      if (myStream) {
        myStream
          .getTracks()
          .forEach((track) => myPeerConnection.addTrack(track, myStream));
      }
      // offer A
      socket.on('welcome', async () => {
        const myData = myPeerConnection.createDataChannel('chat');
        setMyDataChannel(myData);
        // myData.addEventListener('message', console.log);
        console.log('made data channel');
        // 방을 만드는 offer A가 주체로 다른 브라우저에서 방에 접근하면 실행되는 코드
        const offer = await myPeerConnection.createOffer();
        // offer를 가지면 방금 만든 offer로 연결 구성 필요
        myPeerConnection.setLocalDescription(offer);
        console.log('sent the offer');
        socket.emit('offer', offer, roomName);
      });

      // offer B
      socket.on('offer', async (offer) => {
        myPeerConnection?.addEventListener('datachannel', (e) => {
          setMyDataChannel(e.channel);
        });
        console.log('received the offer');
        myPeerConnection.setRemoteDescription(offer);
        const answer = await myPeerConnection.createAnswer();
        myPeerConnection.setLocalDescription(answer);
        socket.emit('answer', answer, roomName);
        console.log('sent the answer');
      });

      socket.on('answer', (answer) => {
        console.log('received the answer');

        myPeerConnection.setRemoteDescription(answer);
      });

      socket.on('ice', (ice) => {
        console.log('received candidate');
        myPeerConnection.addIceCandidate(ice);
      });

      return () => {
        myPeerConnection.addEventListener('icecandidate', handleIce);
        myPeerConnection.addEventListener('track', handleAddStream);
      };
    }
  }, [myPeerConnection]);

  useEffect(() => {
    if (myDataChannel) {
      myDataChannel.addEventListener('message', console.log);
    }
  }, [myDataChannel]);

  return (
    <main>
      <div className="myStream">
        <video ref={myCamRef}></video>
        <button onClick={handleMuteClick}>{isMuted ? 'Unmute' : 'Mute'}</button>
        <button onClick={handleCameraClick}>
          Camera {isCamOn ? 'Off' : 'On'}
        </button>
        <select
          value={selectVal}
          onChange={(e) => setSelectVal(e.target.value)}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <video ref={peerCamRef}></video>
    </main>
  );
}

export default Room;
