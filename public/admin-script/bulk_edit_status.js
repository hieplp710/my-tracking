
function formatToDMY(dateObj) {
    if (dateObj != null) {
        var year = dateObj.getFullYear();
        var monNum = dateObj.getMonth() + 1;
        var mon    = monNum < 10 ? ("0" + monNum) : monNum;
        var date   = dateObj.getDate() < 10 ? ("0" + dateObj.getDate()) : dateObj.getDate();
        return date + "/" + mon + "/" + year;
    }
    return '';
}
var _dataTable = null;
var canUpdate = false;
$(document).ready(function(){
    $('.input-group.date.begin-time').datepicker({
        format: 'dd/mm/yyyy',
    });
    
    $('.input-group.date.end-time').datepicker({
        format: 'dd/mm/yyyy',        
    });

    //$('.input-group.date').datepicker("setDate", "10/08/2019");    
    _dataTable = $('#tblDevice').DataTable({
        "ajax": {
            "url": '/admin/get-expired-devices',
            "type": "POST",
            "data": function(data) {
                var beginDate = $('.input-group.date.begin-time').datepicker('getDate');
                var endDate = $('.input-group.date.end-time').datepicker('getDate');
                if (beginDate != 'Invalid Date' && endDate != 'Invalid Date') {
                    data.begin_time = formatToDMY(beginDate);
                    data.end_time = formatToDMY(endDate);
                }
                
            },
            "dataSrc": "data"
        },
        "paging": false,
        "scrollY": "500px",
        "columns": [
            { "data": "" },
            { "data": "id" },
            { "data": "device_number" },
            { "data": "username" },
            { "data": "expired_at" },
            { "data": "status", },
        ],
        "columnDefs": [
            {
                "targets": 0,
                "data": "",
                "orderable": false,
                "render": function ( data, type, row, meta ) {
                    var selectDom = '<input type="checkbox" class="device-check" id="check_' + row.id + '" data-id="' + row.id + '">';
                    return selectDom;
                }
              }, 
              {
                "targets": 5,
                "data": "status",
                "orderable": false,
                "render": function ( data, type, row, meta ) {
                    var selectDom = '<select class="status-select" id="status_' + row.id + '" data-id="' + row.id + '">';
                    var statusText = '';
                                
                    for (var i = 0; i < 4; i++) {
                        switch(i) {
                            case 1: statusText =  'Active'; break;
                            case 0: statusText =  'Un-active'; break;
                            case 2: statusText =  'Extend expired'; break;
                            case 3: statusText =  'Unused'; break;
                        } 
                        if (i == data) {
                            selectDom += '<option value="' + i + '" selected>' + statusText + '</option>';
                        } else {
                            selectDom += '<option value="' + i + '">' + statusText + '</option>';
                        }
                    }
                    selectDom += '</select>';
                    return selectDom;
                }
            } 
        ]
    });
    $('#btnSearch').on('click', function(e) {
        e.preventDefault();
        _dataTable.ajax.reload();
    });

    $('#datatable-wrapper').on('change', 'select#status_master', function(e){
        e.preventDefault();        
        var value = $(this).val();        
        $('select.status-select').each(function(){
            $(this).val(value);
        });
    });

    $('#datatable-wrapper').on('mouseup', 'input#check-master', function(e){
        e.preventDefault();        
        var value = $(this).is(":checked");     
        $('td > input.device-check').each(function(){
            $(this).prop("checked", !value);
        });
        canUpdate = false;
        $('td > input.device-check').each(function() {
            var isRowChecked = $(this).is(":checked");
            if (isRowChecked == true) {
                canUpdate = true;
                return false;
            }            
        });
        $('#btnUpdate').prop('disabled', !canUpdate);
    });

    $('#datatable-wrapper').on('change', 'td > input.device-check', function(e){
        e.preventDefault();
        e.stopPropagation();
        var isChecked = true;
        console.log('change the checkbox');
        canUpdate = false;        
        $('td > input.device-check').each(function() {
            var isRowChecked = $(this).is(":checked");            
            if (isRowChecked == false) {
                isChecked = isRowChecked;
                return false;
            }
        });
        $('td > input.device-check').each(function() {
            var isRowChecked = $(this).is(":checked");
            if (isRowChecked == true) {
                canUpdate = true;
                return false;
            }            
        });

        $('input#check-master').prop('checked', isChecked);
        $('#btnUpdate').prop('disabled', !canUpdate);
    });

    $('#btnUpdate').on('click', function(e) {
        e.preventDefault();
        $(this).button('loading');
        var data = [];
        $('td > input.device-check:checked').each(function(){
            var id = $(this).attr('data-id');
            data.push({
                "id"    : id,
                "status": $('select#status_' + id).val()
            });
        });
        if (data.length == 0) {
            alert('Vui lòng chọn xe để cập nhật trạng thái!');
            $('#btnUpdate').button('reset');
            return false;
        }
        $.ajax({
            "url": "/admin/update-device-status",
            "data": {"data": JSON.stringify(data)},
            "type": "POST",
            "success": function(resp) {
                if (resp.status) {
                    alert('Cập nhật thành công!');                                      
                    _dataTable.ajax.reload();
                } else {
                    alert("Cập nhật thất bại: " + resp.error);
                }
                $('#btnUpdate').button('reset');
                setTimeout(function(){
                    $('#btnUpdate').prop('disabled', 'disabled');
                    $('#check-master').prop('checked', false);  
                },500)                
                return false;
            },
            "error": function() {
                $('#btnUpdate').button('reset');
                alert('Vui lòng thử lại!');
                return false;
            }
        })
    });
});