#include <Arduino.h>
#include <WiFi.h>
#include <NTPClient.h>
#include <TimeLib.h>
#include <WiFiUdp.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <MQTT_TLS_auth.h>

enum {
    NONE=-1, CONTROL, GET, DEBUG
};

const char* ssid = "비공개";
const char* password = "비공개";
const char* mqtt_server = "비공개";
const char* status_arr[] = { "GOOD", "BAD", "OFF"};

void handleRecv(String topic, String payload);
int getCMD_idx(String topic);
void setup_wifi();
void callback(char* topic, byte* payload, unsigned int length);
void reconnect();
void update_NTP();
char* getDate();
char* getTime();
char* getRawTime();

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 9 * 3600, 60000); // NTP 서버, UTC+9 시간, 60초 업데이트
WiFiClientSecure espClient;
PubSubClient client(espClient);

char buf[64];

void setup() {
  Serial.begin(115200);
  setup_wifi();
  randomSeed(analogRead(A0));
}

void loop() {
    if (!client.connected()) reconnect();
    
    client.loop();
}

void handleRecv(String topic, String payload) {
    int cmd = getCMD_idx(topic);  // 토픽을 하드코딩한 int형 Index값으로 변환함 (switch-case문 쓸려고)

    JsonDocument doc;
    String json_output;
    char buf[32];
    switch(cmd) {
        case CONTROL:  // Control토픽 수신 시
            Serial.println("컨트롤!! -> " + payload);
            break;
        case GET:  // GET토픽 수신 시
            Serial.println("GET!! -> " + payload);

            // 랜덤으로 1~100 설정
            itoa(random()%100 + 1, buf, 10);
            doc["battery"] = buf; 

            // 랜덤으로 GOOD/BAD/OFF 설정
            doc["status"]  = status_arr[random()%3];
            
            // 기본적으론 모든 시간이 출력됨
            // payload에 getTime1 이 포함되있을 시 yyyy-mm-dd만 출력
            // payload에 getTime2 가 포함되있을 시 hh:mm:ss만 출력
            doc["previous_time"] = getRawTime();
            if(payload.indexOf("getTime1") != -1) doc["previous_time"] = getDate();
            if(payload.indexOf("getTime2") != -1) doc["previous_time"] = getTime();
            
            // json데이터를 String으로 변환환
            doc.shrinkToFit();
            serializeJson(doc, json_output);

            Serial.println("JSON? -> " + json_output);

            client.publish("GET_Respone", json_output.c_str());  // MQTT 메시지 송신
            break;
        case DEBUG:  // DEBUG토픽 수신 시
            Serial.println("디버깅!! -> " + payload);
            client.publish("Respone", "hello world");
            break;
        default:
            Serial.printf("Default!!!\n");
    }
}

int getCMD_idx(String topic) {
    if(topic == "Control") return CONTROL;
    if(topic == "GET")     return GET;
    if(topic == "DEBUG")   return DEBUG;

    return NONE;
}

void callback(char* topic, byte* payload, unsigned int length) {
  static String msg;

  msg = "";
  for (int i=0; i < length; i++) msg += (char)payload[i];

  handleRecv( String(topic), msg );
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client", "비공개", "비공개")) {
      Serial.println("MQTT서버 연결됨!");
      update_NTP();

      strcat(getRawTime(), " -> 온라인!");

      client.publish("Notify", buf);

      client.subscribe("GET");
      client.subscribe("Control");
      client.subscribe("DEBUG");
    } else {
      Serial.print("MQTT서버 실패, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup_wifi() {
  delay(10);

  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  timeClient.begin();

  espClient.setInsecure();
  client.setServer(mqtt_server, 8883);
  client.setCallback(callback);
}

void update_NTP() {
    timeClient.update();

    setTime(timeClient.getEpochTime());
}

char* getDate() {
    memset(buf, 0, sizeof(buf));

    // 출력형식: 2025-01-01
    sprintf(buf, "%04d-%02d-%02d", year(), month(), day());

    return buf;
}

char* getTime() {
    memset(buf, 0, sizeof(buf));

    // 출력형식: 11:04:03
    sprintf(buf, "%02d:%02d:%02d", hour(), minute(), second());

    return buf;
}

char* getRawTime() {
    memset(buf, 0, sizeof(buf));

    // 출력형식: 2025-01-01 | 11:04:03
    sprintf(buf, "%04d-%02d-%02d | %02d:%02d:%02d", year(), month(), day(), hour(), minute(), second());

    return buf;
}
