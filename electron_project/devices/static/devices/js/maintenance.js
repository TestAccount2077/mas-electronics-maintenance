var devicePk,
    editedCount,
    username,
    password,
    currentView = 'maintenance';

$(document).ready(function () {
    
    $('#login-modal').modal({backdrop: 'static', keyboard: false});
    $('#login-modal').modal('show');
    
    setTimeout(function () {
        $('#login-password').focus();
    }, 700);
    
    $('#devices-submenu')
        .show()
        .children().children(':nth-child(2)').addClass('active');
    
    $('#maintenance-serial-input').autocomplete({
        source: inventorySerials
    });
    
    $('#edit-sparepart-input').autocomplete({
        source: spareparts
    });
    
});

$(document).on('focusout', '#maintenance-serial-input', function (e) {
    
    var cell = $(this),
        serialNumber = cell.val();
    
    if (!serialNumber) {
        return;
    }
    
    $.ajax({
        url: 'devices/ajax/create-maintenance-device/',

        data: {
            connected,
            serialNumber,
            assignee: username
        },

        success: function (device) {
            
            devicesAndSpareparts[device.pk] = [];
            
            var element = $('#maintenance-table tbody tr:last');
            
            var index = $('#maintenance-table tbody tr').length;
            
            cell.parent().removeClass('input-td').prev().text(index);
            cell.remove();

            $.each(device, function (key, value) {

                element.children('td[data-field-name=' + key + ']')
                    .removeClass('empty')
                    .text(value);
                
                if (key === 'device_type') {
                    element.children('td[data-field-name=' + key + ']').attr('data-pk', device.serial_number);
                }

            });

            element.children('td[data-field-name=serial_number]').attr('contenteditable', false);
            element.attr('data-pk', device.pk);
            element.attr('data-serial', device.serial_number);
            element.attr('data-receipt-pk', device.reception_receipt_id);
            
            // Opening editable cells
            element.children('.maintenance-empty').attr('contenteditable', true);
            
            element.children(':nth-child(10)').html('<a href="/devices/' + device.serial_number + '/" class="device-detail-button" data-device-id="' + device.pk + '" data-device-serial="' + device.serial_number + '">ذهاب</a>');
            
            element.children(':nth-child(8)').html('<a href="#" class="sparepart-edit">تعديل</a>');
            
            element.children(':last').append('<img src="/static/images/remove.png" class="icon remove-maintenance-item" data-pk="' + device.pk + '">');
            
            element.after(`
                <tr>
                    <td></td>
                    <td class="input-td" data-input-type="text" data-field-name="serial_number" style="height:38px" contenteditable="true">
                        <input id="maintenance-serial-input" class="table-input">
                    </td>
                    
                    <td data-input-type="text" data-field-name="company_name"></td>
                    <td data-input-type="text" data-field-name="device_type"></td>
                    <td data-input-type="date" data-field-name="entrance_date"></td>
                    <td class="maintenance-empty" data-input-type="text" data-field-name="assignee"></td>
                    <td class="maintenance-empty" data-input-type="text" data-field-name="flaws"></td>
                    <td></td>
                    <td class="maintenance-empty" data-input-type="text" data-field-name="notes"></td>
                    <td></td>
                    <td></td>
                </tr>`
            );
            
            inventorySerials.remove(serialNumber);
            
            $('#maintenance-serial-input').autocomplete({
                source: inventorySerials
            });
            
            if (connected) {
                socket.send(JSON.stringify({
                    sender: 'maintenance',
                    action: 'create',
                    device
                }));
            }
            
        },

        error: function (error) {

            generateAlerts(error);

            cell.html('');
        }
    });
});

$(document).on('focusout', '.maintenance-empty', function (e) {
    
    var cell = $(this),
        cellType = cell.attr('data-input-type'),
        itemType = cell.parent().parent().parent().attr('data-item-type'),
        fieldName = cell.attr('data-field-name'),
        content = cell.text();
    
    if (!content) {
        return;
    }
    
    if (cellType === 'number' && !isNumeric(content)) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'هذا الحقل يجب أن يكون رقميا',
            position: 'topRight',
            zindex: 99999
        });
        
        cell.text('');
        
        return;
        
    }
    
    $.ajax({
        url: 'ajax/update-cell-content/',
        
        data: {
            pk: cell.parent().attr('data-pk'),
            type: 'maintenance',
            fieldName: fieldName,
            content: content
        },
        
        success: function (data) {
            
            if (fieldName === 'notes') {
                cell.addClass('truncate');
            }
            
            if (data.spareparts && data.spareparts.length) {
                $.each(data.spareparts, function (index, sparepart) {
                    
                    $('#sparepart-inventory-table tbody tr[data-pk=' + sparepart.pk + '] td[data-field-name=count]').text(sparepart.count);
                    
                    if (!index) {
                        
                        if (sparepart.count < sparepart.minimum_qty) {
                            
                            iziToast.warning({
                                title: 'تحذير',
                                message: 'الكمية أقل من الحد الأدنى',
                                position: 'topRight',
                                zindex: 99999
                            });
                        }
                    }
                });
            }
            
            cell
                .removeClass('maintenance-empty')
                .addClass('editable-locked')
                .attr('contenteditable', 'false');
            
            socket.send(JSON.stringify({
                
                sender: 'maintenance',
                action: 'update',
                
                data: {
                    serial: cell.parent().data('serial'),
                    fieldName,
                    content
                }
                
            }));
            
        },
        
        error: function (error) {
            
            generateAlerts(error);
            
            var data = error.responseJSON;
            
            if (data.spareparts && data.spareparts.length) {
                
                $.each(data.spareparts, function (index, sparepart) {

                    $('#sparepart-inventory-table tbody tr[data-pk=' + sparepart.pk + '] td[data-field-name=count]').text(sparepart.count);
                });
                
            }
            
            cell.text('');
            
        }
        
    });
});

$(document).on('click', '.remove-maintenance-item', function (e) {
    
    var pk = $(this).attr('data-pk'),
        parent = $(this).parent().parent(),
        serialNumber = parent.children(':first').text();
    
    var removeMaintenanceItem = function () {
        
        $.ajax({
            url: 'devices/ajax/remove-maintenance-device/',
            
            data: {
                pk
            },

            success: function (data) {

                parent.fadeOut(300, function () {
                    $(this).remove();
                });
                
                if (data.sparepart) {
                    $('#sparepart-inventory-table tbody tr[data-pk=' + data.sparepart.pk + '] td[data-field-name=count]').text(data.sparepart.count);
                }
                
                inventorySerials.push(serialNumber);
            
                $('#maintenance-serial-input').autocomplete({
                    source: inventorySerials
                });
                
                socket.send(JSON.stringify({
                    sender: 'maintenance',
                    action: 'delete',
                    
                    serialNumber
                    
                }));
                
            }
        });
    }
    
    executeAfterPassword(removeMaintenanceItem);
    
});

$(document).on('click', '.sparepart-edit', function () {
    
    devicePk = $(this).parent().parent().data('pk');
    
    var spareparts = devicesAndSpareparts[devicePk];
        
    $('#sparepart-container').empty();
    
    $.each(spareparts, function (index, sparepart) {
        
        var element = composeSparepartElement(sparepart);
        
        $('#sparepart-container').append(element);
        
    });
    
    $('#sparepart-edit-modal').modal('show');
    
});

$(document).on('click', '#add-sparepart-btn', function (e) {
    
    addSparepart();
    
});

$(document).on('keypress', '#edit-sparepart-input, #edit-count-input', function (e) {
    
    if (e.which === 13) {
        addSparepart();
    }
    
});


function addSparepart() {
    
    var sparepart = $('#edit-sparepart-input').val(),
        count = $('#edit-count-input').val();
    
    if (!sparepart || !count) {
        
        alert('No fields')
        
        return;
    }
    
    if (!spareparts.includes(sparepart)) {
        
        alert('Doesnt exist')
        
        return;
        
    }
    
    if (!isNumeric(count)) {
        
        alert('Not numeric')
        
        return;
    }
    
    $.ajax({
        url: 'ajax/add-sparepart-item/',
        
        data: {
            devicePk,
            sparepart,
            count
        },
        
        success: function (data) {
            
            addItemSuccess(data);
            
            socket.send(JSON.stringify({
                sender: 'maintenance',
                action: 'add-sparepart',
                
                data: {
                    devicePk,
                    serial: data.device_serial,
                    sparepart,
                    count
                }
            }));
            
        },
        
        error: generateAlerts
    });
}

$(document).on('click', '.sparepart-delete', function (e) {
    
    var btn = $(this),
        pk = btn.parent().parent().data('pk');
    
    $.ajax({
        url: 'ajax/remove-sparepart-item/',
        
        data: {
            pk,
            devicePk
        },
        
        success: function (data) {
            
            btn.parent().parent().remove();
            
            devicesAndSpareparts[devicePk] = data.spareparts;
            
            socket.send(JSON.stringify({
                
                sender: 'maintenance',
                action: 'remove-sparepart',
                
                data: {
                    serial: data.serial,
                    sparepartName: data.sparepart_name
                }
                
            }));
            
        }
        
    });
    
});

$(document).on('click', '.sparepart-inner-edit', function (e) {
    
    var element = $(this);
    
    if (element.text() === 'تعديل') {
        
        element.text('تأكيد')
            .prev().prev()
            .attr('contenteditable', true)
            .focus();
        
        editedCount = element.prev().prev().text();
        
        $('.sparepart-inner-edit').not(element).prop('disabled', true);
    }
    
    else {
        
        element.text('تعديل');
        
        var sparepart = element.prev().prev().prev().prev().text(),
            count = element.prev().prev().text();
        
        if (count && !count === editedCount) {
            
            count = Number.parseInt(count) - Number.parseInt(editedCount);
            
            $.ajax({
                url: 'ajax/add-sparepart-item/',
                
                data: {
                    devicePk,
                    sparepart,
                    count
                },
                
                success: addItemSuccess
            });
        }
    }
});

function composeSparepartElement(sparepart) {
    
    return `
        <div class="sparepart-item" dir="rtl" data-pk="${ sparepart.id }">
            <h3 style="display:inline-block; width:100%">
                <strong>&bull; اسم القطعة: </strong><span dir="ltr">${ sparepart.name }</span>
                <strong>الكمية</strong>: <span>${ sparepart.count }</span>
                <a href="#" style="float:left; margin-right:10px" class="sparepart-delete">حذف</a>
                <a href="#" style="float:left" class="sparepart-inner-edit">تعديل</a>
            </h3>
        </div>`;
    
}

function addItemSuccess(data) {
    
    if (data.qty_lt_min) {

        iziToast.warning({
            title: 'تحذير',
            message: 'الكمية أقل من الحد الأدنى',
            position: 'topRight',
            zindex: 99999
        });
        
    }
    
    var sparepart = data.sparepart,
        element = $(`.sparepart-item[data-pk=${ sparepart.id }]`);
    
    if (element.length) {
        element.children(':first').children(':nth-child(4)').text(sparepart.count);
    }
    
    else {
        
        var element = composeSparepartElement(sparepart);
        
        $('#sparepart-container').append(element);
        
    }
    
}

$(document).on('click', '#login-btn', function (e) {
    
    password = $('#login-password').val();
    
    if (!password) {
        
        iziToast.error({
            title: 'خطأ',
            message: 'يرجى ادخال كلمة المرور',
            position: 'topRight',
            zindex: 99999
        });
        
        return;
        
    }
        
    $.ajax({
        
        url: '/ajax/worker-login/',
        
        data: {
            password
        },
        
        success: function (data) {
            
            username = data.username;
            
            iziToast.success({
                title: 'نجاح',
                message: `تم تسجيل الدخول بنجاح. مرحبا, ${ data.username }`,
                position: 'topRight',
                zindex: 99999
            });
            
            $('#login-modal').modal('hide');
            
            $.each(data.devices, function (index, device) {
                
                var element = `
                    <tr data-pk="${ device.pk }" data-serial="${ device.serial_number }" data-receipt-pk="${ device.reception_receipt_id }" data-username='${ device.assignee }'>
                        <td>${ index + 1 }</td>
                        <td data-input-type="text" data-field-name="serial_number">${ device.serial_number }</td>
                        <td data-input-type="text" data-field-name="company_name" data-company="${ device.company_name }">${ device.company_name }</td>
                        <td data-input-type="text" data-field-name="device_type" data-type="${ device.device_type }" data-pk="${ device.pk }">${ device.device_type }</td>
                        <td data-input-type="date" data-field-name="entrance_date">${ device.entrance_date }</td>
                        <td data-input-type="text" data-field-name="assignee">${ device.assignee }</td>
                        <td class="${ device.flaws_class }" data-input-type="text" data-field-name="flaws">${ device.flaws }</td>
                        <td><a href="#" class="sparepart-edit">تعديل</a></td>
                        <td class="${ device.notes_class } {% if device.notes_class == 'editable-locked' %}truncate{% endif %}" data-input-type="text" data-field-name="notes">${ device.notes }</td>
                        <td><a href="../${ device.serial_number }/" class="device-detail-button" data-device-id="${ device.pk }" data-device-serial="${ device.serial_number }">ذهاب</a></td>
                        <td><img src="/static/images/remove.png" class="icon remove-maintenance-item" data-pk="${ device.pk }"></td>
                    </tr>
                `;
                
                $('#maintenance-table tbody').append(element);
                
            });
            
            var element = `
                <tr>
                    <td></td>
                    <td class="input-td" data-input-type="text" data-field-name="serial_number" style="height:38px"><input id="maintenance-serial-input" class="table-input"></td>
                    <td data-input-type="text" data-field-name="company_name"></td>
                    <td data-input-type="text" data-field-name="device_type"></td>
                    <td data-input-type="date" data-field-name="entrance_date"></td>
                    <td data-input-type="text" data-field-name="assignee"></td>
                    <td class="maintenance-empty last" data-input-type="text" data-field-name="flaws"></td>
                    <td></td>
                    <td class="maintenance-empty last" data-input-type="text" data-field-name="notes"></td>
                    <td></td>
                    <td></td>
                </tr>
            `;
            
            $('#maintenance-table tbody').append(element);
            
            $('#maintenance-serial-input').autocomplete({
                source: inventorySerials
            });
            
            $('.maintenance-empty:not(.last)').attr('contenteditable', true);
            
        },
        
        error: generateAlerts
    });
    
});

$(document).on('keypress', '#login-password', function (e) {
    
    if (e.which === 13) {
        $('#login-btn').click();
    }
    
});
