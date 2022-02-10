# webrtc tutorial

```
스트리밍 오디오, 비디오 또는 데이터를 가져와야 합니다.

IP주소, 포트등의 네트워크 정보를 가져와야하고, (peers로 알려진) 다른 WebRTC 클라이언트들과 연결을 위해 이 정보들을 교환해야 합니다. 심지어 NATs와 방화벽을 통해서도 교환해야 합니다.

애러들의 보고, 세션들의 초기화와 종료를 위한 신호 통신을 관리해야 합니다.

해상도와 코덱들 같은 미디어와 클라이언트의 capabilty에 대한 정보를 교환해야 합니다.

스트리밍 오디오, 비디오 또는 데이터를 주고 받아야합니다.
```

```
MediaStream: 사용자의 카메라와 마이크 같은 곳의 데이터 스트림에 접근합니다.

RTCPeerConnection: 암호화 및 대역폭 관리를 하는 기능을 가지고 있고, 오디오 또는 비디오 연결을 합니다.

RTCDataChannel: 일반적인 데이터 P2P통신
```

1. NAT 트래버셜(NAT traversal): 라우터를 통과해서 연결할 방법을 찾는 과정

NAT traversal은 2가지 방식이 있음

* STUN(Session Traversal Utilities for NAT) 방식

단말이 자신의 공인 IP 주소와 포트를 확인하는 과정에 대한 프로토콜.

STUN 서버는 복잡한 주소들 속에서 유일하게 자기 자신을 식별할 수 있는 정보를 반환해줌.

WebRTC 연결을 시작하기 전에 STUN 서버를 향해 요청하면, STUN 서버는 NAT 뒤에 있는 피어(Peer)들이 서로 연결할 수 있도록 공인 IP와 포트를 찾아줌

* TRUN(Traversal Using Relay NAT) 방식

STUN 서버에서 항상 자신의 정보를 알아낼 수 없음. 이떄 TRUN 서버를 대안으로 이용

2. ICE, Candidate

STUN, TRUN 서버를 이용해서 획득한 IP 주소와 프로토콜, 포토의 조합으로 구성된 연결 가능한 네트워크 주소들을 Candidate라고 부름. 그리고 이 과정을 후보 찾기(Finding Candidate)라고 부름.

후보들을 수집하면 다음과 같이 3개의 정보를 얻음

```
1. 자신의 사설 IP와 포트번호
2. 자신의 공인 IP와 포트번호(STUN, TRUN 서버로부터 획득가능)
3. TURN 서버의 IP와 포트번호(TURN 서버로부터 획득가능)
```

이 과정은 ICE(Interactive Connectivity Establishment)라는 프레임워크 위에서 이루어짐.

ICE는 두 개의 단말이 P2P 연결을 가능하게 하도록 최적의 경로를 찾아주는 프레임워크

ICE 프레임워크는 STUN 또는 TURN 서버를 이용해 상대방과 연결 가능한 후보들을 갖고 있음.

3. SDP (Session Description Protocol)

스트리밍 미디어의 초기화 인수를 기술하기 위한 포맷

sdp인 offer, answer를 signaling server를 통해 상태방에게 전달.
생성하고 전달받은 offer와 answer은 setRemoteDescription(sdp)와 setLocalDescription(sdp)를 호출하여 등록

setRemoteDescription(sdp)를 통해 상대방 sdp를 등록하면 RPCPeerConnection 생성된 객체로 바인딩한 이벤트중 onstream, ontrack을 통해 상대방 스트림과 트랙을 받을 수 있다.

setRemoteDescription, setLocalDescription이 호출될 때마다 onicecandidate 호출. addIceCandidate(new RTCIceCandidate(candidate))가 이루어지면 이때부터 두 피어는 연결이 성공적으로 이루어지며, 서로 데이터를 주고받을 수 있다.