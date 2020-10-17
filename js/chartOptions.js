db.collection("users/faq/sum").doc("stat").get().then(doc => {
    vue.sumStat = doc.data()
    vue.percentTrade = (100 / doc.data().sumTrade * doc.data().successTrade).toFixed(2)
})
let buyOrSell = '';

db.collection("users").doc("faq").onSnapshot(function (doc) {
    vue.score = doc.data().score;
});


function makeResult(res) {
    let textC = (res === "Вы выиграли!") ? "text-success" : (res === "Ставка все еще активна") ? "text-warning" : "text-danger";
    vue.showDiv1 = false;
    vue.showDiv2 = false;
    vue.showDiv3 = true;
    vue.continueDiv = false;
    vue.messResult = res;
    vue.textC = `font-weight-lighter animated flip ${textC}`;


}

function parseTime(i) {
    let time = oilSet[i].split(",")[0];
    time = time.slice(0, 4) + "-" + time.slice(4, 6) + "-" + time.slice(6);
    let h = oilSet[i].split(",")[1]
    h = h.slice(0, 2) + ":" + h.slice(2, 4) + ":" + h.slice(4);
    time += " " + h;
    time = Date.parse(time) / 1000;

    return time;
}

function getMarkersData(t, e, c) {
    t = parseTime(t);
    e = parseTime(e);

    return [
        {
            time: t,
            position: 'aboveBar',
            color: 'black',
            shape: 'arrowDown',
        },
        {
            time: e,
            position: 'aboveBar',
            color: c,
            shape: 'arrowDown'
        }
    ];

}

function updateChart(d) {

    let date = d.split(",");
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

    const ohlcItem = {
        time: time,
        open: open,
        high: high,
        low: low,
        close: close,
    };
    return ohlcItem;


}


function action(action) {
    vue.error = false;
    let risk = vue.selectedRisk;
    let profit = vue.selectedProfit;
    //Проверка на пустые поля
    if ((!risk || !profit) || (action === "b" && vue.buyLimit.length === 0) || (action === "s" && vue.sellLimit.length === 0)) {
        vue.error = true;
    } else {
        buyOrSell = action;
        continueF()
    }
}

function continueF() {

    let price = buyOrSell === "b" ? vue.buyLimit : vue.sellLimit;
    if (oilSet.length <= startDate + 3) {
        makeResult("Ставка все еще активна");
    } else {
        let set = oilSet.slice(startDate, startDate + 3);
        findDate(price, set, buyOrSell);
    }
}


function findDate(price, set, action) {
    for (let i = 0; i < set.length; i++) {


        let splittedSet = set[i].split(',');
        let high = splittedSet[3];
        let low = splittedSet[4];
        if((high >= price && action === "s") || (low <= price && action === "b")){
            trade(price, startDate + 1, action);
            return splittedSet;
        }
        // if (high >= price && low <= price) {
        //     trade(price, startDate + 1, action);
        //     return splittedSet;
        // }

        // Если прошло 3 бара - спрашиваем продолжить?
        if (i === set.length - 1) {
            for (let j = 1; j <= 3; j++) {
                let ohlcItem = updateChart(oilSet[startDate + j]);
                candlestickSeries.update(ohlcItem);
            }
            vue.showContinue();
            startDate += 3;
            return null;
        }

    }
}

function updateScore(score) {
    let user = db.collection("users").doc("faq");
    user.update({
        score: score
    });
}


function createAndUpdateStat(res) {
    let dbStat = db.collection(`users/faq/sum/`).doc("stat");
    if (res === `success`) {

        dbStat.update({
            successTrade: firebase.firestore.FieldValue.increment(1),
            sumTrade: firebase.firestore.FieldValue.increment(1)
        });

    } else {
        dbStat.update({
            failTrade: firebase.firestore.FieldValue.increment(1),
            sumTrade: firebase.firestore.FieldValue.increment(1)
        });

    }


}


function trade(price, date, action) {

    db.collection("users").doc("faq").get().then(function (doc) {
        let userScore = 0;
        if (doc.exists) {
            userScore = doc.data().score;
        }

        let increasedScore = ((+userScore) + (+Math.abs(userScore / 100 * vue.selectedProfit))).toFixed(2)
        let decreasedScore = ((+userScore) - (+Math.abs(userScore / 100 * vue.selectedRisk))).toFixed(2);


        let nextPrice_H;
        let nextPrice_L;
        if (action === "b") {
            nextPrice_H = +price + (price / 100 * vue.selectedProfit);
            nextPrice_L = +price - (price / 100 * vue.selectedRisk);
        } else {
            nextPrice_H = +price + (price / 100 * vue.selectedRisk);
            nextPrice_L = +price - (price / 100 * vue.selectedProfit);
        }

        console.log(`prise is ${price}  nextPrice_H ${nextPrice_H}  nextPrice_L ${nextPrice_L} prof - ${vue.selectedProfit} risk - ${vue.selectedRisk}`)
        let startDataForMarker = date;


        for (let i = +date + 1; i <= oilSet.length - 1; i++) {
            startDate++;

            let data = oilSet[i].split(",");
            let ohlcItem = updateChart(oilSet[i]);
            candlestickSeries.update(ohlcItem);

            let high = data[3];
            let low = data[4];

            if (high >= nextPrice_H) {
                chart.timeScale().scrollToRealTime();

                if (action === "b") {
                    updateScore(increasedScore);
                    createAndUpdateStat("success");
                    let data = getMarkersData(startDataForMarker, i, "green");
                    candlestickSeries.setMarkers(data);
                    return makeResult("Вы выиграли!")
                } else {
                    updateScore(decreasedScore);
                    createAndUpdateStat("fail");
                    let data = getMarkersData(startDataForMarker, i, "red");
                    candlestickSeries.setMarkers(data);
                    return makeResult("Вы проиграли :(")
                }

            } else if (low <= nextPrice_L) {
                chart.timeScale().scrollToRealTime();
                if (action === "s") {
                    updateScore(increasedScore);
                    createAndUpdateStat("success");
                    let data = getMarkersData(startDataForMarker, i, "green");
                    candlestickSeries.setMarkers(data);
                    return makeResult("Вы выиграли!")
                } else {
                    updateScore(decreasedScore);
                    createAndUpdateStat("fail");
                    let data = getMarkersData(startDataForMarker, i, "red");
                    candlestickSeries.setMarkers(data);
                    return makeResult("Вы проиграли :(")
                }
            }
            if (i === oilSet.length - 1) {
                chart.timeScale().scrollToRealTime();
                return makeResult("Ставка все еще активна");
            }
        }

    });


}

function jump() {
    for (let j = 1; j <= 5; j++) {
        let ohlcItem = updateChart(oilSet[startDate + j]);
        candlestickSeries.update(ohlcItem);
    }
    startDate += 8;

}

