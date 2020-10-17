let w = 1800;
let h = 800;
let url = new URL(location.href);



let startDate;
const firebaseConfig = {
    apiKey: "AIzaSyABizoaHQSmM81qjJqIR4MBFpPUu8XAV5g",
    authDomain: "testingfirebaseweb-19b64.firebaseapp.com",
    databaseURL: "https://testingfirebaseweb-19b64.firebaseio.com",
    projectId: "testingfirebaseweb-19b64",
    storageBucket: "testingfirebaseweb-19b64.appspot.com",
    messagingSenderId: "1021310283717",
    appId: "1:1021310283717:web:f3516eff049dce90afe5ac"
};
firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();

const chart = LightweightCharts.createChart(document.getElementById("chart"), {
    width: w,
    height: h,
    handleScale: {
        axisPressedMouseMove: false
    },
    timeScale: {
        timeVisible: true,
        secondsVisible: false
    }
});

const candlestickSeries = chart.addCandlestickSeries();


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}


function buildChart() {
    vue.showDiv1 = true;
    vue.showDiv2 = true;
    vue.showDiv3 = false;
    vue.continueDiv = false;
    vue.textC = "";

    chart.applyOptions({
        watermark: {
            color: 'rgba(11, 94, 29, 0.4)',
            visible: true,
            text: "Oil",
            fontSize: 24,
            horzAlign: 'left',
            vertAlign: 'bottom',
        }
    });


    let validKeys = [];
    startDate = getRandomInt(30, oilSet.length - 30);
    for (let i = 0; i <= startDate; i++) {
        let date = oilSet[i].split(",");
        let time = date[0];
        time = time.slice(0, 4) + "-" + time.slice(4, 6) + "-" + time.slice(6);
        let h = date[1];
        h = h.slice(0, 2) + ":" + h.slice(2, 4) + ":" + h.slice(4);
        time += " " + h;
        time = Date.parse(time) / 1000;
        let open = date[2];
        let high = date[3];
        let low = date[4];
        let close = date[5];

        validKeys.push({time: time, open: open, high: high, low: low, close: close})

    }
    let value = (+validKeys[validKeys.length - 1].close).toFixed(2);
    vue.buyLimit = value;
    vue.sellLimit = value;
    candlestickSeries.setData(validKeys);
    candlestickSeries.setMarkers([]);


}

document.addEventListener("DOMContentLoaded", buildChart);