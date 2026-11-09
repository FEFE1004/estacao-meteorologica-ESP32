#include <Wire.h>

#include <WiFi.h>
#include <WebServer.h>

#include <Adafruit_Sensor.h>
#include <Adafruit_BMP085_U.h>
#include <Adafruit_HTU21DF.h>
#include <ArduinoJson.h>


const char* ssid = "fefe";
const char* password = "fefe1234";

WebServer server(80);

Adafruit_BMP085_Unified bmp = Adafruit_BMP085_Unified(10085);
Adafruit_HTU21DF htu = Adafruit_HTU21DF();

float temperatura;
float pressao;
float umidade;
int luminosidade;

void setup() {
  Serial.begin(115200);
  Wire.begin(4, 15);
  delay(2000);
  
  luminosidade = analogRead(39);

  if (!bmp.begin()) {
    Serial.println("Não foi possivel encontrar o sensor BMP180");
  } else {
    Serial.println("bmp180 encontrado");
  }

  if (!htu.begin()){
    Serial.println("Htu não encontrado");
  } else {
    Serial.println("htu encontrado");
  }

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());

  server.on("/dados", HTTP_GET, enviarDadosJson);

  server.begin();
  Serial.println("Servidor HTTP iniciado!");
}

void loop() {

  server.handleClient();
}

void enviarDadosJson() {
  float tempC = htu.readTemperature();
  float tempF = (tempC * 9.0 / 5.0) + 32.0;
  float umi = htu.readHumidity();

  long somaLuz = 0;
  for(int i = 0; i < 10; i++) {
    somaLuz += analogRead(39);
    delay(2);
  }
  int lum = somaLuz / 10;

  sensors_event_t event;
  bmp.getEvent(&event);
  float pres = event.pressure;

  JsonDocument doc;

  doc["temperaturaC"] = String(tempC, 1);
  doc["temperaturaF"] = String(tempF, 1);
  doc["umidade"] = String(umi, 1);
  doc["luminosidade"] = String(lum);
  doc["pressao"] = String(pres);

  String jsonOutput;
  serializeJson(doc, jsonOutput);

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
  
  server.send(200, "application/json", jsonOutput);
}