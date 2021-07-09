// Checks for Looged-In Teqmo Admin
firebase.auth().onAuthStateChanged((user) => {
    if(user){
        showAllStoresAllBills()
        updateBasicInfo()
    }
})

/**
 * Fetches all the Week Bills related data for All the Stores present in Database
 * Passes the array to the update function which loads the data on table and initialises it
 * Table Format - [storeName,startDate,endDate,statusLine,total,invoice]
 */
async function showAllStoresAllBills() {

  const snapshot = await firebase.database().ref(`Teqmo/Stores`).once('value')
  const data = snapshot.val()

  let sortedByWeeks = {};
  jQuery.each(data, function (storeUID, details) {
    if (details) {
      jQuery.each(details.payment.weeks, function (weekNum, weekDetails) {
        if (weekDetails && weekNum != "start") {
          let storeData = {
            "storeName": details.details.storeName,
            "billStatus": weekDetails.billStatus, // Not checking if data is undefined or not, as It will be checked later
            "weeklySales": weekDetails.sales
          };
          if (sortedByWeeks[weekNum]) {
            sortedByWeeks[weekNum][storeUID] = storeData;
          } else {
            sortedByWeeks[weekNum] = {
              [storeUID]: storeData
            };
          }
        }
      })
    }
  })

  let dataSet = []
  jQuery.each(sortedByWeeks, function (weekNum, allStores) {
    if (allStores) {
      jQuery.each(allStores, function (storeUID, storeData) {
        let storeName = storeData.storeName || 'No Store Name';
        let startDate = getDateFromWeek(weekNum, 0);
        let endDate = getDateFromWeek(weekNum, 1);
        let billStatus = storeData.billStatus || -1;
        let total = storeData.weeklySales || 'N/A';
        var statusLine
        let mark = ``
        if (billStatus == 0) {
          statusLine = `<span class="badge badge-soft-secondary">
                                <span class="legend-indicator bg-secondary"></span>Not Generated
                              </span>`
        } else if (billStatus == 1) {
          statusLine = `<span id="${storeUID}-${weekNum}Status" class="badge badge-soft-warning">
                                <span class="legend-indicator bg-warning"></span>Pending
                              </span>`

          mark = `<button id="${storeUID}-${weekNum}" class="btn btn-sm btn-white" onclick="updateBillStatus(this.id)">
              Paid</button>`

        } else if (billStatus == 2) {
          statusLine = `<span class="badge badge-soft-success">
                                <span class="legend-indicator bg-success"></span>Paid
                              </span>`
        }
        else{
          statusLine = `<span class="badge">
                                <span class="legend-indicator"></span>N/A
                              </span>`
        }

        let invoice = `<a class="btn btn-sm btn-white" href="invoice.html?storeUID=${storeUID}&weekID=${weekNum}">
            <i class="tio-receipt-outlined mr-1"></i> Invoice</a>`
            
        var temp = [storeName, startDate, endDate, statusLine, mark, total, invoice]
        dataSet.unshift(temp)
      })
    }
  })
  updateDataTable(dataSet)
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

// INITIALIZATION OF DATATABLES
function updateDataTable(dataSet) {
    var datatable = $.HSCore.components.HSDatatables.init($('#datatable'), {
        data : dataSet,
        columns:[
            { title: "Store Name" },
            { title: "Start Date" },
            { title: "End Date" },
            { title: "Payment Status"},
            { title: "Update Status"},
            { title: "Commission"},
            { title: "Invoice" }
        ],
        language: {
            zeroRecords: '<div class="text-center p-4">' +
                '<img class="mb-3" src="./assets/svg/illustrations/sorry.svg" alt="Image Description" style="width: 7rem;">' +
                '<p class="mb-0">No data to show</p>' +
                '</div>'
            },
            // Table Export
            dom: 'Bfrtip',
            buttons: [
              {
                extend: 'copy',
                className: 'd-none'
              },
              {
                extend: 'excel',
                className: 'd-none'
              },
              {
                extend: 'csv',
                className: 'd-none'
              },
              {
                extend: 'pdf',
                className: 'd-none'
              },
              {
                extend: 'print',
                className: 'd-none'
              },
            ]
        });
        
        // Table Export Buttons
        $('#export-copy').click(() => {
        datatable.button('.buttons-copy').trigger()
        });

        $('#export-excel').click(() => {
        datatable.button('.buttons-excel').trigger()
        });

        $('#export-csv').click(() => {
        datatable.button('.buttons-csv').trigger()
        });

        $('#export-pdf').click(() => {
        datatable.button('.buttons-pdf').trigger()
        });

        $('#export-print').click(() => {
        datatable.button('.buttons-print').trigger()
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
