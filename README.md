# Estação Meteorológica ESP32

Projeto de uma estação meteorológica usando ESP32 (Heltec WiFi LoRa 32 V2). Ele lê temperatura, umidade, pressão e luminosidade e mostra tudo num site que atualiza sozinho.

O problema que a gente quis resolver foi poder acompanhar as condições do ambiente de qualquer dispositivo da rede, sem precisar de um equipamento caro.

Integrantes
Maria Fernanda - RA:11
Luis Gustavo - RA:11
Pedro Henrique - RA:11
Igor Leandro - RA:11

Arquitetura
Sensores (BMP180, HTU21D, LDR)
        |
      ESP32  (servidor HTTP na porta 80)
        |
   Wi-Fi / HTTP
        |
Cliente (página web no navegador)
O ESP32 lê os sensores e responde as requisições HTTP. A página web faz uma requisição para o ESP32 a cada 5 segundos e atualiza os valores e o gráfico.
O projeto não usa atuadores, só sensores.

Hardware
- Heltec WiFi LoRa 32 V2 (ESP32)
- BMP180 (pressão)
- HTU21D (temperatura e umidade)
- LDR + resistor (luminosidade)
- Protoboard e jumpers

Ligações:

| Componente | Pino do ESP32 |
|---|---|
| BMP180 SDA | GPIO 4 |
| BMP180 SCL | GPIO 15 |
| HTU21D SDA | GPIO 4 |
| HTU21D SCL | GPIO 15 |
| LDR (divisor de tensão) | GPIO 39 |
| VCC dos sensores | 3V3 |
| GND | GND |

Os dois sensores I2C dividem os mesmos pinos SDA e SCL.

## API

O ESP32 tem só um endpoint:

`GET http://<IP_DO_ESP32>/dados`

Resposta de exemplo:

```json
{
  "temperaturaC": "25.3",
  "temperaturaF": "77.5",
  "umidade": "58.2",
  "luminosidade": "1850",
  "pressao": "1013.25"
}

`temperaturaC` e `temperaturaF`: temperatura em Celsius e Fahrenheit
`umidade`: umidade relativa em %
`luminosidade`: valor do LDR de 0 a 4095 (4095 é escuro total)
`pressao`: pressão em hPa

Como rodar

ESP32
1. Instale a Arduino IDE e o suporte à placa ESP32.
2. Instale as bibliotecas: Adafruit Unified Sensor, Adafruit BMP085 Unified, Adafruit HTU21DF e ArduinoJson (versão 7 ou mais nova).
3. Abra o arquivo `meteorologico_esp/meteorologico_esp.ino`.
4. Troque o `ssid` e o `password` pelos da sua rede Wi-Fi (precisa ser 2,4 GHz).
5. Selecione a placa Heltec WiFi LoRa 32 (V2), escolha a porta e faça o upload.
6. Abra o Monitor Serial (115200) e anote o IP que aparecer.

Site

1. Abra o arquivo `estação meteorológica/script.js` e troque o IP no `fetch` pelo IP do seu ESP32.
2. Abra o `index.html` no navegador.
3. O computador precisa estar na mesma rede do ESP32.

Para testar se o ESP32 está funcionando, abra `http://<IP_DO_ESP32>/dados` no navegador.

![Dashboard](docs/dashboard.png)
