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
    storeBillDetails(data.payment.weeks);
}

/**
 * To update the Store Details on the Side Card
 * @param {object} storeDetails object available at 'Teqmo/Stores/UID/details'
 */
function storeOwnerInfo(storeDetails){
    let ownerName = storeDetails.ownerName ? storeDetails.ownerName : 'No Name'

    let email = storeDetails.email ? storeDetails.email : 'Email not available'
    let phone = storeDetails.phone ? storeDetails.phone : 'No Data'
    let contactInfo =` <li><i class="tio-online mr-2"></i>${email}</li>
            <li><i class="tio-android-phone-vs mr-2"></i>${phone}</li>`;
    
    let city = storeDetails.city ? storeDetails.city : 'No City'
    let state = storeDetails.state ? storeDetails.state : 'No Sate'
    let companyName = storeDetails.companyName ? storeDetails.companyName : 'No Company Name'
    let storeName = storeDetails.storeName ? storeDetails.storeName : 'No Store Name'
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
    const totalSales = storePayment.totalSales ? storePayment.totalSales : 0
    const totalCommission = storePayment.totalCommission ? storePayment.totalCommission : 0
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
async function storeBillDetails(weeks){
    const billStatusArray = ["Not generated","Pending","Paid"];
    const billStatusClasses = ["fail","warning","success"]; //For Icon & Colour
    let billDetailsData = []

    if(weeks){
        jQuery.each(weeks, function(weekNum, details) {
            if (details) {
                let startDate = getDateFromWeek(weekNum, 0); //From Common function's File
                let endDate = getDateFromWeek(weekNum, 1);
                let billStatus = billStatusArray[details.billStatus];
                let billIconClass = billStatusClasses[details.billStatus];
                let sales = details.sales;
                let commission = details.commission;

                let billStatusHTML = `<span class="badge badge-soft-${billIconClass}">
                                    <span class="legend-indicator bg-${billIconClass}"></span>${billStatus}
                                    </span>`;
                let invoiceIcon = `<a class="btn btn-sm btn-white" href="javascript:;" data-toggle="modal" data-target="#invoiceReceiptModal">
                                    <i class="tio-receipt-outlined mr-1"></i> Invoice
                                    </a>`;
                
                let row = [startDate, endDate, billStatusHTML, sales, commission, invoiceIcon];
                billDetailsData.unshift(row);   //Adding JSON at beginning
            }
        });
    }
    else{
        console.log('No week exists');
    }
    updateDataTable(billDetailsData);
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
