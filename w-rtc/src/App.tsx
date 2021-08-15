
import React, { useState } from 'react';
import io from 'socket.io-client';
import { useRef } from 'react';
import { useEffect } from 'react';
import Video from './components/video';
import RPC_CONFIG from './constant/rpc';

const App = () => {

  const [socket, setSocket] = useState<any>();
  const [users, setUsers] = useState<any>([]);
  const [isJoin, setIsJoin] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  let localVideoRef = useRef<any>(null);

  let pcs: { [socketId: string]: RTCPeerConnection };

  useEffect(() => {
    let newSocket = io('https://2cd65d38b50a.ngrok.io');
    let localStream: MediaStream;
    
    newSocket.on('all_users', async (users: Array<{ id: string, email: string }>) => {
      console.log(users)
      users.forEach(async (user: { id: string, email: string }) => {
        createPeerConnection(user.id, user.email, newSocket, localStream);
        let pc: RTCPeerConnection = pcs[user.id];
        if (pc) {
          const sdp = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
          await pc.setLocalDescription(new RTCSessionDescription(sdp));
          newSocket.emit('offer', {
            sdp: sdp,
            offerSendID: newSocket.id,
            offerSendEmail: user.email,
            offerReceiveID: user.id
          });
        }
      });
    });

    newSocket.on('getOffer', async (data: { sdp: RTCSessionDescription, offerSendID: string, offerSendEmail: string }) => {

      // console.log('get offer');
      createPeerConnection(data.offerSendID, data.offerSendEmail, newSocket, localStream);
      let pc: RTCPeerConnection = pcs[data.offerSendID];
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const sdp = await pc.createAnswer({ offerToReceiveVideo: true, offerToReceiveAudio: true })
        pc.setLocalDescription(new RTCSessionDescription(sdp));
        
        newSocket.emit('answer', {
          sdp: sdp,
          answerSendID: newSocket.id,
          answerReceiveID: data.offerSendID
        });
      } catch (error) {
        console.log(error);
      }
    });

    newSocket.on('getAnswer', (data: { sdp: RTCSessionDescription, answerSendID: string }) => {

      // console.log('get answer');
      let pc: RTCPeerConnection = pcs[data.answerSendID];
      if (!pc) return;
      console.log();
      pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      //console.log(sdp);
    });

    newSocket.on('getCandidate', async (data: { candidate: RTCIceCandidateInit, candidateSendID: string }) => {
      // console.log('get candidate');
      let pc: RTCPeerConnection = pcs[data.candidateSendID];
      if (!pc) return;

      await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
      // console.log('candidate add success');
    });

    newSocket.on('user_exit', (data: { id: string }) => {
      pcs[data.id].close();
      delete pcs[data.id];
      setUsers((oldUsers: any[]) => oldUsers.filter(user => user.id !== data.id));
    })

    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: 240,
        height: 240
      }
    }).then(stream => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      localStream = stream;
      console.log(1);
      // socket.emit('join_room', { room: '1234', email: new Date().getTime() });
    }).catch(error => {
      // console.log(`getUserMedia error: ${error}`);
    });

  }, []);

  const createPeerConnection = (socketID: string, email: string, newSocket: any, localStream: MediaStream): RTCPeerConnection => {
    let pc = new RTCPeerConnection(RPC_CONFIG);
  
    // add pc to peerConnections object
    pcs = { ...pcs, [socketID]: pc };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        // console.log('onicecandidate');
        newSocket.emit('candidate', {
          candidate: e.candidate,
          candidateSendID: newSocket.id,
          candidateReceiveID: socketID
        });
      }
    }

    pc.oniceconnectionstatechange = (e) => {
      // console.log('oniceconnectionstatechange');
    }

    pc.ontrack = (e) => {
      // console.log('ontrack success');
      // console.log(users);
      console.log(e);
      console.log(pcs);
      setUsers((oldUsers: any[]) => {
        console.log(oldUsers);
        return oldUsers
          .filter(user => user.id !== socketID)
          .concat({
            id: socketID,
            email: email,
            stream: e.streams[0]
          })
      });
      // setUsers((oldUsers: any) => [...oldUsers, ]);
    }

    if (localStream) {
      // console.log('localstream add');
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    } else {
      console.log('no local stream');
    }

    // return pc
    return pc;

  }

  const onJoinHandler = () => {
    if (isJoin) return;
    socket.emit('join_room', { room: '1234', email: new Date().getTime() });
    setIsJoin(true);
  }

  return (
    <div>
      <div>
        {/* <input type="text" value={email} onChange={ (e) => setEmail(e.target.value)}></input> */}
        <button onClick={ onJoinHandler }>참가하기</button>
      </div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black'
        }}
        muted
        ref={localVideoRef}
        autoPlay>
      </video>
      {users.map((user: { email: any, stream: any, id: string }, index: React.Key | null | undefined) => {
        return (
          <Video
            key={index}
            email={user.id}
            stream={user.stream}
          />
        );
      })}
    </div>
  );
}

export default App;