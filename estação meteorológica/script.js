let tempCelsius = 0;
let tempFahrenheit = 0;
let umidadeGlobal = 0;

let historicoTemperaturasC = [];
let historicoUmidades = [];
let historicoLuminosidades = []; 

function buscarDadosSensores(){
    fetch('http://10.169.49.4/dados')
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error("Erro na resposta do ESP32");
            }
            return resposta.json();
        })
        .then(dados => {
            tempCelsius = parseFloat(dados.temperaturaC);
            tempFahrenheit = parseFloat(dados.temperaturaF);
            umidadeGlobal = parseFloat(dados.umidade);
            let pressaoGlobal = parseFloat(dados.pressao);
        
            let lumBruto = parseInt(dados.luminosidade);
            
            let lumCorrigido = 4095 - lumBruto;
            let valorLux = (lumCorrigido / 4095) * 1000;
            valorLux = Math.max(0, Math.min(1000, valorLux));

            const elLuz = document.querySelector('.luminosidade');
            const elLAtual = document.querySelector('.l-atual');

            let statusLuz = "";
            let textoFormatado = `${valorLux.toFixed(0)} lx`;
            
            document.body.classList.remove('modo-escuro-total', 'modo-meio-escuro', 'modo-ambiente', 'modo-intenso');

            if (lumBruto == 4095) {
                statusLuz = `Totalmente Escuro (${textoFormatado})`;
                document.body.classList.remove('modo-escuro-total', 'modo-meio-escuro', 'modo-ambiente', 'modo-intenso');
                document.body.classList.add('modo-escuro-total');
            } else if (lumBruto > 4000) {
                statusLuz = `Meio Escuro (${textoFormatado})`;
                document.body.classList.remove('modo-escuro-total', 'modo-meio-escuro', 'modo-ambiente', 'modo-intenso');
                document.body.classList.add('modo-meio-escuro');
            } else if (lumBruto > 1400) {
                statusLuz = `Luz Ambiente (${textoFormatado})`; 
                document.body.classList.remove('modo-escuro-total', 'modo-meio-escuro', 'modo-ambiente', 'modo-intenso');
                document.body.classList.add('modo-ambiente');
            } else {
                statusLuz = `Intenso (${textoFormatado})`;
                document.body.classList.remove('modo-escuro-total', 'modo-meio-escuro', 'modo-ambiente', 'modo-intenso');
                document.body.classList.add('modo-intenso');
            }
            

            if (elLuz) elLuz.textContent = textoFormatado;
            if (elLAtual) elLAtual.textContent = statusLuz;
           
            historicoTemperaturasC.push(tempCelsius);
            historicoUmidades.push(umidadeGlobal);
            historicoLuminosidades.push(valorLux);

            if (historicoTemperaturasC.length > 2160) {
                historicoTemperaturasC.shift();
                historicoUmidades.shift();
                historicoLuminosidades.shift();
            }

            const btnCelsius = document.querySelector('.c');
            const elementoTempAtual = document.querySelector('.temp-atual');

            if (elementoTempAtual) {
                if (btnCelsius && btnCelsius.classList.contains('selecionado')) {
                    elementoTempAtual.textContent = tempCelsius.toFixed(1);
                } else {
                    elementoTempAtual.textContent = tempFahrenheit.toFixed(1);
                }
            }

            const elUmi = document.querySelector('.umidade');
            const elPres = document.querySelector('.pressao');

            if (elUmi) elUmi.textContent = umidadeGlobal.toFixed(1);
            if (elPres) elPres.textContent = pressaoGlobal.toFixed(2);

            const tempMax = Math.max(...historicoTemperaturasC);
            const tempMin = Math.min(...historicoTemperaturasC);
            const umiMedia = historicoUmidades.reduce((a, b) => a + b, 0) / historicoUmidades.length;

            const elTMax = document.querySelector('.t-max');
            const elTMin = document.querySelector('.t-min');
            const elUMedia = document.querySelector('.u-media');

            if (elTMax) elTMax.textContent = tempMax.toFixed(1) + " °C";
            if (elTMin) elTMin.textContent = tempMin.toFixed(1) + " °C";
            if (elUMedia) elUMedia.textContent = umiMedia.toFixed(1) + " %";

            const horaFormatada = new Date().toLocaleTimeString();
            const elAtualizacao = document.querySelector('.atualizacao');
            if (elAtualizacao) elAtualizacao.textContent = horaFormatada;

            myChart.data.labels.push(horaFormatada);

            if (btnCelsius && btnCelsius.classList.contains('selecionado')){
                myChart.data.datasets[0].data.push(tempCelsius);
            } else {
                myChart.data.datasets[0].data.push(tempFahrenheit);
            }

            myChart.data.datasets[1].data.push(umidadeGlobal);

            if (myChart.data.labels.length > 2160) {
                myChart.data.labels.shift();
                myChart.data.datasets[0].data.shift();
                myChart.data.datasets[1].data.shift();
            }

            myChart.update();
        })
        .catch(erro => {
            console.log('Ainda sem ligação à placa', erro);
        });
}

buscarDadosSensores();
setInterval(buscarDadosSensores, 5000);

const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Temperatura (°C)',
                data: [],
                borderColor: '#ff6384',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0, 
                pointHoverRadius: 5,
                yAxisID: 'y'
            },
            {
                label: 'Umidade (%)',
                data: [],
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0, 
                pointHoverRadius: 5,
                yAxisID: 'y1'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Temperatura'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Umidade (%)'
                },
                grid: {
                    drawOnChartArea: false,
                },
            }
        }
    }
});

const btnC = document.querySelector('.c');
const btnF = document.querySelector('.f');
const spanUnidade = document.querySelector('.unidade-ativa');
const elementoTempAtual = document.querySelector('.temp-atual');

if (btnC) {
    btnC.addEventListener('click', () => {
        if (!btnC.classList.contains('selecionado')) {
            btnC.classList.add('selecionado');
            if (btnF) btnF.classList.remove('selecionado');
            if (spanUnidade) spanUnidade.textContent = '°C';
            if (elementoTempAtual) elementoTempAtual.textContent = tempCelsius.toFixed(1);

            myChart.data.datasets[0].label = 'Temperatura (°C)';
            myChart.options.scales.y.title.text = 'Temperatura (°C)';
            
            myChart.data.datasets[0].data = historicoTemperaturasC.slice(-myChart.data.labels.length);
            myChart.update();
        }
    });
}

if (btnF) {
    btnF.addEventListener('click', () => {
        if (!btnF.classList.contains('selecionado')) {
            btnF.classList.add('selecionado');
            if (btnC) btnC.classList.remove('selecionado');
            if (spanUnidade) spanUnidade.textContent = '°F';
            if (elementoTempAtual) elementoTempAtual.textContent = tempFahrenheit.toFixed(1);

            myChart.data.datasets[0].label = 'Temperatura (°F)';
            myChart.options.scales.y.title.text = 'Temperatura (°F)';
            
            myChart.data.datasets[0].data = historicoTemperaturasC.slice(-myChart.data.labels.length).map(c => parseFloat(((c * 9/5) + 32).toFixed(1)));
            myChart.update();
        }
    });
}

function atualizarDataEHora(){
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();

    const dataAtual = `${dia}/${mes}/${ano}`;
    const elementoData = document.querySelector('.data-atual');
    if (elementoData) elementoData.textContent = dataAtual;

    const hora = String(agora.getHours()).padStart(2,'0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');

    const horaAtual = `${hora}:${minutos}:${segundos}`;
    const elementoHora = document.querySelector('.hora-atual');
    if (elementoHora) elementoHora.textContent = horaAtual;
}

atualizarDataEHora();
setInterval(atualizarDataEHora, 1000);