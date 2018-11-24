var currentView = 'receipt-detail';

$(document).ready(function () {
    
    var table = $('.receipt-detail-table'),
        body = table.children('tbody'),
        rowCount = 0;

    // Calculating row count comprehensively
    $.each(receipt.row_data, function (type, rowData) {
        rowCount += Math.ceil(rowData.count / 3);
    });

    if (rowCount < 15) {
        rowCount = 15;
    }

    for (var i=0; i < rowCount; i++) {

        body.append('<tr data-row="' + (i + 1) + '">' +
                    '<td style="height: 37px" data-num="0"></td>' +
                    '<td data-num="1"></td>' +
                    '<td data-num="2" class="unlockable" data-lock-type="receipt-detail-type"></td>' +
                    '<td data-num="3" style="width:550px; text-align:right"></td>' +
                '</tr>');
    }

    //div = Math.ceil(rowData.count / 3),
    var currentCount = 1,
        currentRow = body.children('tr:first');

    $.each(receipt.row_data, function (type, rowData) {

        currentRow.children(':nth-child(2)').text(rowData.count);

        currentRow.children(':nth-child(3)')
            .text(type)
            .attr('data-type', type);

        currentCount = 1;

        $.each(rowData.serials, function(index, serial) {

            if (currentCount === 4) {
                currentCount = 1;
                currentRow = currentRow.next();
            }

            var element = $('<span class="receipt-detail-serial" data-serial="' + serial + '" contenteditable=false value="">' + serial + '</span>');

            currentRow.children(':last').append(element);

            currentCount += 1;

        });

        currentRow = currentRow.next();

    });

    reorderRows(table);
});
