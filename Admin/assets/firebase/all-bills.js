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

    var dataSet = []
    
    jQuery.each(data, function(storesNum, details) {
    if (details) {
        jQuery.each(details.payment.weeks, function(weekNum, weekDetails) {
            if (weekDetails && weekNum!="start") {
                let storeName = details.details.storeName ? details.details.storeName : 'No Store Name';
                let startDate = getDateFromWeek(weekNum, 0);
                let endDate = getDateFromWeek(weekNum, 1);
                let billStatus = weekDetails.billStatus;
                let total = weekDetails.sales ? weekDetails.sales : 'N/A';
                var statusLine
                if(billStatus==0){
                    statusLine = `<span class="badge badge-soft-secondary">
                                    <span class="legend-indicator bg-secondary"></span>Not Generated
                                  </span>`
                }
                else if (billStatus==1){
                    statusLine = `<span class="badge badge-soft-warning">
                                    <span class="legend-indicator bg-warning"></span>Pending
                                  </span>`
                }
                else {
                    statusLine = `<span class="badge badge-soft-success">
                                    <span class="legend-indicator bg-success"></span>Paid
                                  </span>`
                }
                var invoice = `<a class="btn btn-sm btn-white" href="javascript:;" data-toggle="modal" data-target="#invoiceReceiptModal">
                <i class="tio-receipt-outlined mr-1"></i> Invoice</a>`
                var temp = [storeName,startDate,endDate,statusLine,total,invoice]
                dataSet.unshift(temp)
                }
            })
        }
    })
    updateDataTable(dataSet)
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
