# 말뚝 모듈
* 메인보드: ESP32-CAM
* 사용 부품 목록
   1. MG996R, MG90S 서보모터
   2. 레이저 모듈
   3. PIR 인체감지 센서
   4. 부저
   5. WS2812 RGB LED
   6. MPU6050 가속도-자이로 센서
# 코드 구조
* [src] 폴더
  * <b>main.cpp</b> : 메인코드
  * <b>MQTT_TLS_auth</b> : TLS인증 관련 데이터(개발때는 사용X)
* platformio.ini : 현재 프로젝트 세팅(시리얼모니터 속도, 라이브러리 의존성)
