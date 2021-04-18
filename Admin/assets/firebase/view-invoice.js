// Call data retrieval functions only after firebase is loaded
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const storeUID = location.search.split('&')[0].split('=')[1]; 
        const weekNum = location.search.split('&')[1].split('=')[1];
        generateInvoice(storeUID, weekNum)
        updateBasicInfo()
    }
})

async function invoiceInfo(storeUID,weekDetails) {

    document.getElementById('invoiceDate').innerHTML = weekDetails.invoiceDate;
    document.getElementById('dueDate').innerHTML = weekDetails.dueDate;
    
    snapshot = await firebase.database().ref(`Teqmo/Stores/${storeUID}/details`).once('value')
    let data = snapshot.val()

    let ownerName = data.ownerName ? data.ownerName : " "
    let storeName = data.storeName ? data.storeName : " "

    let addressLine = data.address ? data.address + ",<br>" : " "
    let city = data.city ? data.city + (data.zipCode ? " - " : ",<br>") : " "
    let zipCode = data.zipCode ? data.zipCode + "<br>" : " "
    let state = data.state ? data.state : " "

    let storeAddress = `${addressLine}${city}${zipCode}${state}`;

    document.getElementById('ownerName').innerHTML = ownerName
    document.getElementById('storeName').innerHTML = storeName
    document.getElementById('address').innerHTML = storeAddress
}

async function generateInvoice(storeUID, weekNum) {

    if (!weekNum || weekNum >= getWeekNumber(new Date())) {
        showFailError('Invoice does not exist')
        return
    }

    let snapshot = await firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/weeks/${weekNum}`).once('value')
    if (snapshot.exists()) {
        let data = snapshot.val()
        
        if (data.billStatus == 0) {
            showFailError('Bill not generated yet!')
            return
        }
        let week = await firebase.database().ref(`Teqmo/Details/weeks/${weekNum}`).once('value')
        let weekDetails = week.val()
        invoiceInfo(storeUID,weekDetails)

        let startingDay = getDateFromWeek(weekNum, 0);
        let endingDay = getDateFromWeek(weekNum, 1);
        let playCount = data.counter.reduce((a, b) => a + b, 0)
        let ticketValue = weekDetails.ticketValue
        let sale = data.sales.toFixed(2)
        let commissionRate = weekDetails.commissionRate
        let commission = ((sale*commissionRate)/100).toFixed(2)
        let amountToPay = (sale-commission).toFixed(2)
        
        let tableRow = `<tr>
                        <td>${startingDay} - ${endingDay}</td>
                        <td>${playCount}</td>
                        <td>$ ${ticketValue}</td>
                        <td class="table-column-right-aligned">$ ${sale}</td>
                     </tr>`;
        document.getElementById('tableData').innerHTML = tableRow
        
        document.getElementById('subTotal').innerHTML='$ '+sale
        document.getElementById('commissionRate').innerHTML=commissionRate+' %'
        document.getElementById('commission').innerHTML='- $ '+commission
        document.getElementById('amountToPay').innerHTML='$ '+amountToPay

    } else {
        showFailError('Invoice not available !')
    }
}

function showFailError(msg) {
    let err = msg ? msg : 'Some error occured, Please try again later!'
    Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `${err}`,
            allowOutsideClick: false
        })
        .then(function () {
            history.back()
        });
}
