@extends('backpack::layout')

@section('header')
	<section class="content-header">
	  <h1>
	    {{ trans('backpack::crud.edit') }} <span>{{ $crud->entity_name }}</span>
	  </h1>
	  <ol class="breadcrumb">
	    <li><a href="{{ url(config('backpack.base.route_prefix'),'dashboard') }}">{{ trans('backpack::crud.admin') }}</a></li>
	    <li><a href="{{ url($crud->route) }}" class="text-capitalize">{{ $crud->entity_name_plural }}</a></li>
	    <li class="active">{{ trans('backpack::crud.edit') }}</li>
	  </ol>
	</section>
@endsection

@section('content')
<div class="row">
	<div class="col-md-8 col-md-offset-2">
		<!-- Default box -->
		@if ($crud->hasAccess('list'))
			<a href="{{ url($crud->route) }}"><i class="fa fa-angle-double-left"></i> {{ trans('backpack::crud.back_to_all') }} <span>{{ $crud->entity_name_plural }}</span></a><br><br>
		@endif

		@include('crud::inc.grouped_errors')

		  {!! Form::open(array('url' => $crud->route.'/'.$entry->getKey(), 'method' => 'put', 'files'=>$crud->hasUploadFields('update', $entry->getKey()))) !!}
		  <div class="box">
		    <div class="box-header with-border">
		    	@if ($crud->model->translationEnabled())
			    	<!-- Single button -->
					<div class="btn-group pull-right">
					  <button type="button" class="btn btn-sm btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					    {{trans('backpack::crud.language')}}: {{ $crud->model->getAvailableLocales()[$crud->request->input('locale')?$crud->request->input('locale'):App::getLocale()] }} <span class="caret"></span>
					  </button>
					  <ul class="dropdown-menu">
					  	@foreach ($crud->model->getAvailableLocales() as $key => $locale)
						  	<li><a href="{{ url($crud->route.'/'.$entry->getKey().'/edit') }}?locale={{ $key }}">{{ $locale }}</a></li>
					  	@endforeach
					  </ul>
					</div>
					<h3 class="box-title" style="line-height: 30px;">{{ trans('backpack::crud.edit') }}</h3>
				@else
					<h3 class="box-title">{{ trans('backpack::crud.edit') }}</h3>
				@endif
		    </div>
		    <div class="box-body row">				
		      <!-- load the view from the application if it exists, otherwise load the one in the package -->
		      @if(view()->exists('vendor.backpack.crud.form_content'))
		      	@include('vendor.backpack.crud.form_content', ['fields' => $fields, 'action' => 'edit'])
		      @else
		      	@include('crud::form_content', ['fields' => $fields, 'action' => 'edit'])
			  @endif
			<?php if ((new \ReflectionClass($crud->model))->getShortName() == 'User') { ?>  
			<div class="form-group col-md-12 checklist_dependency" data-entity="user_role_permission">
				<div class="row">
					<div class="col-xs-12">
						<label>Device list</label>
					</div>
					<div class="hidden_fields_primary" data-name="roles">
						<input type="hidden" class="primary_hidden" name="roles[]" value="1">
					</div>
					<div class="col-sm-6">
						<div class="table-device">
							<table id="user-devices">
								<thead>
								<th><input type="checkbox" id="chkAll"/></th>
								<th>Device Id</th>
								<th>Status</th>
								</thead>
								<tbody>
									<tr id="new-row">
										<td colspan="2"><textarea class="new-device" id="txtNewDevice"></textarea></td>
										<td>
											<button type="button" class="btn btn-success" id="btnAdd">
												<span class="fa fa-plus" role="presentation" aria-hidden="true"></span> &nbsp;
												<span>Thêm</span>
											</button>
									</td>
									</tr>
								</tbody>
							</table>					
						</div>
					</div>					
				</div>
				<div class="row">
				<div class="col-sm-6">
						<div class="btn-group pull-right">
							<button type="button" class="btn btn-danger" disabled id="btnDelete">
								<span class="fa fa-remove" role="presentation" aria-hidden="true"></span> &nbsp;
								<span>Xóa</span>
							</button>						
						</div>
					</div>
				</div>
			</div>	
			<?php } ?>		  
		    </div><!-- /.box-body -->
			
            <div class="box-footer">

                @include('crud::inc.form_save_buttons')

		    </div><!-- /.box-footer-->
		  </div><!-- /.box -->
		  {!! Form::close() !!}
	</div>
</div>
<?php if ((new \ReflectionClass($crud->model))->getShortName() == 'User') { ?>
<style>
.table-device {
    margin-bottom: 10px;
}
table#user-devices {
    border: 1px solid #999999;
    width: 100%;
    border-collapse: collapse;
}

table#user-devices th, table#user-devices td {
    padding: 2px 5px;
    border: 1px solid #999999;
}
.new-device {
    width: 100%;
    height: 50px;
}
</style>
<script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
<script type="text/javascript">
	function updateUserDevices(data, action){
		jQuery.ajax({
			url: "/admin/bulk-update-user-devices",
			type: "POST",
			dataType: "json",
			data: JSON.stringify({"action":action, "devices":data}),
			success: function(resp) {
				console.log(resp);
				if (resp.error) {
					alert(resp.error);
					return false;
				} else {
					if (action == 'add') {
						jQuery('#txtNewDevice').val("");
					}					
					updateUserDeviceList();
				}
			},
			error: function(err) {
				console.log(err);
			}
		});
	}

	function updateUserDeviceList() {
		jQuery.ajax({
			url: "/admin/use-device-list/<?php echo $fields['id']['value']; ?>",
			type: "POST",
			dataType: "json",
			success: function(resp) {
				console.log(resp); //1185797424
				jQuery('#user-devices tr.dev-row').remove();		
				if (resp.length > 0) {
					for(var i = 0; i < resp.length; i++) {
						var dev = resp[i];
						var dom = '<tr class="dev-row"><td><input type="checkbox" class="device" id="dev-' + dev.id + '" device_id="' + dev.id + '"/></td><td>' + dev.id + '</td><td>' + dev.status + '</td></tr>';
						jQuery('#user-devices > tbody').prepend(dom);
					}
					
				}
			},
			error: function(err) {
				console.log(err);
			}
		});
	}
	jQuery(document).ready(function(){		
		updateUserDeviceList();
		jQuery('#chkAll').on('change', function(e){
			e.preventDefault();
			var isChecked = e.target.checked;
			jQuery('#user-devices > tbody input[type="checkbox"]').prop('checked', isChecked);
			if (jQuery('#user-devices > tbody input[type="checkbox"]:checked').length > 0) {
				jQuery('#btnDelete').attr('disabled', false);
			} else {
				jQuery('#btnDelete').attr('disabled', true);
			}
		});

		jQuery('#user-devices > tbody').on('change', 'input[type="checkbox"]', function(e){
			e.preventDefault();	
			if (jQuery('#user-devices > tbody input[type="checkbox"]:checked').length > 0) {
				jQuery('#btnDelete').attr('disabled', false);
			} else {
				jQuery('#btnDelete').attr('disabled', true);
			}			
		});

		jQuery('#btnDelete').on('click', function(e){
			e.preventDefault();
			var data = new Array();
			var isDeleted = confirm("Bạn muốn xóa các thiết bị khỏi user này?");
			if (!isDeleted) return false;
			jQuery('#user-devices > tbody input.device:checked').each(function(i, elem){				
				var device = {
					"id": jQuery(elem).attr('device_id'),
					"user_id": '<?php echo $fields['id']['value']; ?>'
				}				
				data.push(device);
			});
			updateUserDevices(data, 'delete');
		});
		jQuery('#btnAdd').on('click', function(e){
			e.preventDefault();
			var data = new Array();
			var devices = jQuery('#txtNewDevice').val();
			var deviceArray = devices.split(",")
			for(var i = 0; i < deviceArray.length; i++) {
				var device = {
					"id": jQuery.trim(deviceArray[i]),
					"user_id": '<?php echo $fields['id']['value']; ?>'
				}
				data.push(device);
			}			
			updateUserDevices(data, 'add');
		});
	});	
</script>
<?php } ?>
@endsection