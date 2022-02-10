# SDP 교환

1. offer 생성, 생성한 노드에서 setLocalSescription(offer), offer 전달
2. 전달받은 offer를 setRemoteDescription(offer)로 등록, answer를 생성하여 생성한 노드에서 setLocalSdescription(answer)
3. answer 전달, 전달받은 answer를 setRemoteDescription(answer)로 등록

# icecandidate

### RTCPeerConnectiondmfh

* onicecandidate

offer나 answer를 생성한 이후 각 노드에선 icecandidate 정보 이벤트 발생 offer 또는 answer 생성 시 보냈던 상대방에게 icecandidate 정보를 signaling server로 전송

* oniceconnectionstatechange

ICE connection 상태가 변경됐을 때 이벤트 발생

* ontrack

상대방의 RTCSessionDescription을 본인의 RTCPeerConnection에서의 remoteSessionDescription으로 지정하면 상대방의 track 데이터에 대한 이벤트가 발생한다.

해당 데이터에서 MediaStream을 상대방의 video, audio를 재생할 video 태그에 등록한다.