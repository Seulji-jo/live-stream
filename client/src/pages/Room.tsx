import { useEffect, useRef } from 'react';
import { socket } from '../utils/socket';

const pc_config = {
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
};

function Room() {
  // const socketRef = useRef<SocketIOClient.Socket>();
  const socketRef = useRef<any>();
  const pcRef = useRef<RTCPeerConnection>();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const setVideoTracks = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      if (!(pcRef.current && socketRef.current)) return;
      console.log('pcRef1', pcRef.current);
      stream.getTracks().forEach((track) => {
        console.log('track', track);

        if (!pcRef.current) return;
        pcRef.current.addTrack(track, stream);
      });

      console.log('pcRef2', pcRef.current);
      pcRef.current.addEventListener('icecandidate', (e) =>
        console.log('event', e)
      );
      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          if (!socketRef.current) return;
          console.log('onicecandidate');
          socketRef.current.emit('candidate', e.candidate);
        }
      };
      console.log('pcRef3', pcRef.current);
      pcRef.current.oniceconnectionstatechange = (e) => {
        console.log(e);
      };
      console.log('pcRef4', pcRef.current);
      pcRef.current.ontrack = (ev) => {
        console.log('add remotetrack success');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = ev.streams[0];
        }
      };
      socketRef.current.emit('join_room', {
        room: '1234',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    console.log('create offer');
    if (!(pcRef.current && socketRef.current)) return;
    try {
      const sdp = await pcRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pcRef.current.setLocalDescription(new RTCSessionDescription(sdp));
      socketRef.current.emit('offer', sdp);
    } catch (e) {
      console.error(e);
    }
  };

  const createAnswer = async (sdp: RTCSessionDescription) => {
    if (!(pcRef.current && socketRef.current)) return;
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log('answer set remote description success');
      const mySdp = await pcRef.current.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      console.log('create answer');
      await pcRef.current.setLocalDescription(new RTCSessionDescription(mySdp));
      socketRef.current.emit('answer', mySdp);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    console.log('1');

    socketRef.current = socket;
    pcRef.current = new RTCPeerConnection(pc_config);
    console.log(
      (pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          if (!socketRef.current) return;
          console.log('onicecandidate');
          socketRef.current.emit('candidate', e.candidate);
        }
      })
    );

    console.log('2. all_users');
    socketRef.current.on('all_users', (allUsers: Array<{ id: string }>) => {
      if (allUsers.length > 0) {
        createOffer();
      }
    });

    console.log('3. getOffer');
    socketRef.current.on('getOffer', (sdp: RTCSessionDescription) => {
      //console.log(sdp);
      console.log('get offer');
      createAnswer(sdp);
    });

    console.log('4. getAnswer');
    socketRef.current.on('getAnswer', (sdp: RTCSessionDescription) => {
      console.log('get answer');
      if (!pcRef.current) return;
      pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      //console.log(sdp);
    });

    console.log('5. getCandidate');
    socketRef.current.on(
      'getCandidate',
      async (candidate: RTCIceCandidateInit) => {
        if (!pcRef.current) return;
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('candidate add success');
      }
    );

    console.log('6. setVideoTracks');
    setVideoTracks();

    return () => {
      // if (socketRef.current) {
      //   socketRef.current.disconnect();
      // }
      // if (pcRef.current) {
      //   pcRef.current.close();
      // }
      socketRef.current.on('all_users', (allUsers: Array<{ id: string }>) => {
        if (allUsers.length > 0) {
          createOffer();
        }
      });

      socketRef.current.on('getOffer', (sdp: RTCSessionDescription) => {
        //console.log(sdp);
        console.log('get offer');
        createAnswer(sdp);
      });

      socketRef.current.on('getAnswer', (sdp: RTCSessionDescription) => {
        console.log('get answer');
        if (!pcRef.current) return;
        pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        //console.log(sdp);
      });

      socketRef.current.on(
        'getCandidate',
        async (candidate: RTCIceCandidateInit) => {
          if (!pcRef.current) return;
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('candidate add success');
        }
      );
    };
  }, []);

  return (
    <main>
      {/* <div className="myStream">
        <video ref={localVideoRef} muted autoPlay></video>
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
      <video ref={remoteVideoRef} autoPlay></video> */}
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={localVideoRef}
        autoPlay
      />
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        ref={remoteVideoRef}
        autoPlay
        muted
      />
    </main>
  );
}

export default Room;
