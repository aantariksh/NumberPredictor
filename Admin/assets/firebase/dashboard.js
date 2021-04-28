firebase.auth().onAuthStateChanged( async (user) => {
    if(user){
        const UID = user.uid;
        const snapshot = await firebase.database().ref(`Teqmo/Stores`).once('value')
        const data = snapshot.val()
        updateChart(data)
        updateBasicInfo()
        updateStatistics(data)
    }
})
 
function updateStatistics(data) {
    let storeCount = 0,
        totalPlays = 0,
        totalCommission = 0,
        totalSales = 0;

    jQuery.each(data, (storeUID, storeInfo) => {
        storeCount++;
        totalCommission += parseFloat(storeInfo.payment.totalCommission);
        totalSales += parseFloat(storeInfo.payment.totalSales);
        var totalCount = 0;
        let weeks = storeInfo.payment.weeks;
        jQuery.each(weeks, (weekNum, details) => {
            if (details && weekNum != "start") {
                var weekCount = details.counter.reduce((a, b) => a + b, 0)
                totalCount += weekCount
            }
        })

        totalPlays += totalCount;
    });
    totalCommission = totalCommission.toFixed(2); //toFixed() converts a number into String 
    totalSales = totalSales.toFixed(2);
    document.getElementById('totalStores').innerHTML = storeCount;
    document.getElementById('totalPlays').innerHTML = totalPlays;
    document.getElementById('totalCommission').innerHTML = '$ ' + totalCommission;
    document.getElementById('totalSales').innerHTML = '$ ' + totalSales;
}

/**
 * Count Per Day of Current Week, from [Sun, Mon,... , Sat]
 * Current WeekNumber is calculated from current date 
 * @returns {Array} Sum of counts for all stores per day of week, 0th pos:Sunday, ..., 6th pos:Saturday
 */
async function getSumOfCountPerDayOfWeek(data, weekNum = 0) {
    const date = new Date() //Current Date
    const currentWeek = getWeekNumber(date)
    const targetWeek = currentWeek - weekNum
 
    let sumOfCount = [0, 0, 0, 0, 0, 0, 0];

    jQuery.each(data, (storeUID, storeInfo) => {
        let week = storeInfo.payment.weeks[targetWeek];
        if (week) {
            for (let i = 0; i < 7; i++) {
                sumOfCount[i] += week.counter[i];
            }
        }
    });

    return sumOfCount
}

async function updateChart(data){
    var countThisWeek = await getSumOfCountPerDayOfWeek(data,0)
    var countLastWeek = await getSumOfCountPerDayOfWeek(data,1)
    
    var updatingChart = $.HSCore.components.HSChartJS.init($('#updatingData'));
    updatingChart.data.datasets[0].data = countThisWeek
    updatingChart.data.datasets[1].data = countLastWeek
    updatingChart.update();

    const totalThisWeek = countThisWeek.reduce((a, b) => a + b, 0)
    const totalLastWeek = countLastWeek.reduce((a, b) => a + b, 0)
    const increasePercentage = Math.ceil((totalThisWeek - totalLastWeek)*100/totalLastWeek)

    const countTrend = document.getElementById("countTrend")
    if(increasePercentage > 0){
        countTrend.classList.add("text-success");
        countTrend.classList.remove("text-danger");
        countTrend.innerHTML = `<i class="tio-trending-up"></i> ${increasePercentage}%`
    } else {
        countTrend.classList.remove("text-success");
        countTrend.classList.add("text-danger");
        countTrend.innerHTML = `<i class="tio-trending-down"></i> ${increasePercentage}%`
    }
}
