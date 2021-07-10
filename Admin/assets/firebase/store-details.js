firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showStoresDetails()
        updateBasicInfo()
    }
})

async function showStoresDetails(){
    const storeUID = location.search.split('=')[1];
    const snapshot = await firebase.database().ref(`Teqmo/Stores/${storeUID}`).once('value')
    const data = snapshot.val()

    storeOwnerInfo(data.details);
    storeReportCard(data.payment);
    storeBillDetails(data.payment.weeks,storeUID);
}

/**
 * To update the Store Details on the Side Card
 * @param {object} storeDetails object available at 'Teqmo/Stores/UID/details'
 */
function storeOwnerInfo(storeDetails){
    let ownerName = storeDetails.ownerName || 'No Name'

    let email = storeDetails.email || 'Email not available'
    let phone = storeDetails.phone || 'No Data'
    let contactInfo =` <li><i class="tio-online mr-2"></i>${email}</li>
            <li><i class="tio-android-phone-vs mr-2"></i>${phone}</li>`;
    
    let city = storeDetails.city || 'No City'
    let state = storeDetails.state || 'No Sate'
    let companyName = storeDetails.companyName || 'No Company Name'
    let storeName = storeDetails.storeName || 'No Store Name'
    let storeInfo = `<li><i class="tio-user-outlined mr-2"></i>${storeName}</li>
                    <li><i class="tio-briefcase-outlined mr-2"></i>${companyName}</li>
                    <li><i class="tio-city mr-2"></i>${city}, ${state}</li>`;
    
    document.getElementById('storeOwnerName').innerHTML = ownerName;
    document.getElementById('contact-info').innerHTML = contactInfo;
    document.getElementById('store-info').innerHTML = storeInfo;        
}

/**
 * To update all the statistical, sales related data of that store like,
 * Total : Commission, Sales, Count/Players, Profit
 * @param {object} storePayment object available at 'Teqmo/Stores/UID/payment'
 */
function storeReportCard(storePayment){
    const totalSales = storePayment.totalSales || 0
    const totalCommission = storePayment.totalCommission || 0
    const totalProfit = totalSales - totalCommission
    let totalCount =  0
    jQuery.each(storePayment.weeks, function(weekNum, details) {
        // console.log(weekNum, details)
        if (details && Array.isArray(details.counter)) {
            totalCount += details.counter.reduce((a, b) => a + b, 0) // Sum of array elements
        }
    })

    document.getElementById('totalCount').innerHTML = totalCount;
    document.getElementById('totalSales').innerHTML='$ '+ totalSales;
    document.getElementById('totalCommission').innerHTML='$ '+ totalCommission;
    document.getElementById('totalProfit').innerHTML='$ '+ totalProfit;
}

/**
 * All the bills for all the weeks of that store from beginning
 * @param {Number} storeUID 
 */
async function storeBillDetails(weeks,storeUID){
    const billStatusArray = ["Not generated","Pending","Paid"];
    const billStatusClasses = ["fail","warning","success"]; //For Icon & Colour
    let billDetailsData = []

    if(weeks){
        jQuery.each(weeks, function(weekNum, details) {
            if (details && weekNum!='start') {
                let startDate = getDateFromWeek(weekNum, 0); //From Common function's File
                let endDate = getDateFromWeek(weekNum, 1);
                let billStatus = billStatusArray[0], billIconClass = billStatusClasses[0]
                let sales = 'N/A', commission = 'N/A'
                if (details.billStatus) {
                    billStatus = billStatusArray[details.billStatus];
                    billIconClass = billStatusClasses[details.billStatus];
                    sales = details.sales || 'N/A';
                    commission = details.commission || 'N/A';
                }

                let billStatusHTML = `<span id="${storeUID}-${weekNum}Status" class="badge badge-soft-${billIconClass}">
                                    <span class="legend-indicator bg-${billIconClass}"></span>${billStatus}
                                    </span>`;
                
                let mark = ``
                if (details.billStatus == 1) {
                    mark = `<button id="${storeUID}-${weekNum}" class="btn btn-sm btn-white" onclick="updateBillStatus(this.id)">
                    Paid</button>`
                }
                let invoice = `<a class="btn btn-sm btn-white" href="invoice.html?storeUID=${storeUID}&weekID=${weekNum}">
                <i class="tio-receipt-outlined mr-1"></i> Invoice</a>`
                
                let row = [startDate, endDate, billStatusHTML, mark, sales, commission, invoice];
                billDetailsData.unshift(row);   //Adding JSON at beginning
            }
        });
    }
    else{
        console.log('No week exists');
    }
    updateDataTable(billDetailsData);
}

function updateBillStatus(btnID) {
    let storeUID = btnID.split('-')[0]
    let weekNum = btnID.split('-')[1]
    firebase.database().ref(`Teqmo/Stores/${storeUID}/payment/weeks/${weekNum}`).update({
        'billStatus': 2 //Paid
    }).then(() => {
        document.getElementById(btnID).innerHTML = `Paid <i class="tio-done mr-1"></i>`
        document.getElementById(btnID + 'Status').innerHTML = `<span class="badge badge-soft-success">
        <span class="legend-indicator bg-success"></span>Paid
        </span>`
    }).catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: `Something went bad, Please try again`,
        })
    });
}

/**
 * Initialization of datatables, Updates data to table
 * @param {Array} dataSet Each row represents row of actual html table
 */
function updateDataTable(dataSet){
    // Sample Data to be received (Number of items in each row should match the columns)
    // let dataSet = [
    //      ["Sun Apr 11, 2021", "Sat Apr 17, 2021", "200", "$ 200", "$ 100","y" ],
    //      ["Sun Apr 18, 2021", "Sat Apr 24, 2021", "100", "$ 100", "$ 50","n" ]
    //  ]
 
    let datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
      data: dataSet,
      columns: [
          { title: "Start Date" },
          { title: "End Date" },
          { title: "Payment" },
          { title: "Update Status" },
          { title: "Sales" },
          { title: "Commission" },
          { title: "Invoice" }
      ],
      language: {
        zeroRecords: '<div class="text-center p-4">' +
            '<img class="mb-3" src="./assets/svg/illustrations/sorry.svg" alt="Image Description" style="width: 7rem;">' +
            '<p class="mb-0">No data to show</p>' +
            '</div>'
      }
    });

    // Initialise search on table
    $('#datatableSearch').on('mouseup', function (e) {
      var $input = $(this),
        oldValue = $input.val();

      if (oldValue == "") return;

      setTimeout(function(){
        var newValue = $input.val();

        if (newValue == ""){
          // Gotcha
          datatable.search('').draw();
        }
      }, 1);
    });
}
