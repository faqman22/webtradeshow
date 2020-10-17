let vue = new Vue({
    el: "#showOption",
    data: {
        showDiv1: true,
        showDiv2: true,
        showDiv3: false,
        messResult: "",
        textC: "",
        buyLimit: '',
        sellLimit: '',
        //Возможно ошибка с дефолтными значениями
        selectedProfit: 0.6,
        selectedRisk: 0.2,
        error: false,
        continueDiv: false,
        score: 0,
        sumStat:{},
        percentTrade:0,
        selectedMarket: "VBZ0"


    },
    methods: {
        showContinue: function () {
            this.showDiv1 = false;
            this.showDiv2 = false;
            this.continueDiv = true
        },
        changedSelect: function () {
            console.log("work select " + this.selectedMarket)
        }
    },
    computed: {
        resultSumC: function () {
            return this.score > 1000 ? "text-success" : "text-danger"
        },
        change: function () {
            return this.score > 1000 ? `+${((this.score - 1000) / 10).toFixed(2)}` : `${((this.score - 1000) / 10).toFixed(2)}`

        }
    }


});