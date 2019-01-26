<?php

namespace App\Http\Controllers\Admin;

use App\Models\Devicelocation;
use App\Models\Tracking_device;
use Backpack\CRUD\app\Http\Controllers\CrudController;

// VALIDATION: change the requests to match your own file names if you need form validation
use App\Http\Requests\Tracking_deviceRequest as StoreRequest;
use App\Http\Requests\Tracking_deviceRequest as UpdateRequest;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Jenssegers\Date\Date;
use Maatwebsite\Excel\Excel;
use Illuminate\Support\Facades\DB;

class Tracking_deviceCrudController extends CrudController
{
    public function setup()
    {

        /*
        |--------------------------------------------------------------------------
        | BASIC CRUD INFORMATION
        |--------------------------------------------------------------------------
        */
        $this->crud->setModel('App\Models\Tracking_device');
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/tracking_device');
        $this->crud->setEntityNameStrings('tracking_device', 'Devices');
        $this->crud->setListView('crud::list_device');

        /*
        |--------------------------------------------------------------------------
        | BASIC CRUD INFORMATION
        |--------------------------------------------------------------------------
        */

        //$this->crud->setFromDb();
        $this->crud->addColumn([
            'name' => 'id', // The db column name
            'label' => "Device Id", // Table column heading
            'type' => 'Text'
        ]);

        $this->crud->addColumn([
            'name' => 'device_number', // The db column name
            'label' => "Device Number", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'setting', // The db column name
            'label' => "Settings", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'sim_infor', // The db column name
            'label' => "Sim Information", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'activated_at', // The db column name
            'label' => "Activated Date", // Table column heading
            'type' => 'model_function',
            'function_name' => 'displayActivatedAt',
        ]);
        $this->crud->addColumn([
            'name' => 'expired_at', // The db column name
            'label' => "Expired Date", // Table column heading
            'type' => 'model_function',
            'function_name' => 'displayExpiredAt',
        ]);
        $this->crud->addColumn([
            'name' => 'created_at', // The db column name
            'label' => "Created Date", // Table column heading
            'type' => 'model_function',
            'function_name' => 'displayCreatedAt',
        ]);
        $this->crud->addColumn([
            'name' => 'user_id', // The db column name
            'label' => "Owner", // Table column heading
            'type' => 'model_function',
            'function_name' => 'getUserName',
        ]);

        $this->crud->addColumn([
            'name' => 'status', // The db column name
            'label' => "Status", // Table column heading
            'type' => 'model_function',
            'function_name' => 'getStatus',
        ]);

        //add field
        $this->crud->addField([
            // MANDATORY
            'name'  => 'id', // DB column name (will also be the name of the input)
            'label' => 'Device Id', // the human-readable label for the input
            'type'  => 'number', // the field type (text, number, select, checkbox, etc)

            // OPTIONAL + example values
            'hint'       => 'device id', // helpful text, show up after input
            'attributes' => [
                'placeholder' => 'Device id',
                'class' => 'form-control tracking_device_id',
                'readonly' => 'readonly'
            ], // extra HTML attributes and values your input might need
            'wrapperAttributes' => [
                'class' => 'form-group col-md-12'
            ] // extra HTML attributes for the field wrapper - mostly for resizing fields using the bootstrap column classes
        ]);

        $this->crud->addField([
            // MANDATORY
            'name'  => 'device_number', // DB column name (will also be the name of the input)
            'label' => 'Device Name', // the human-readable label for the input
            'type'  => 'text', // the field type (text, number, select, checkbox, etc)

            // OPTIONAL + example values
            'hint'       => 'device number', // helpful text, show up after input
            'attributes' => [
                'placeholder' => 'Device Number',
                'class' => 'form-control some-class'
            ], // extra HTML attributes and values your input might need
            'wrapperAttributes' => [
                'class' => 'form-group col-md-12'
            ] // extra HTML attributes for the field wrapper - mostly for resizing fields using the bootstrap column classes
        ]);

        $this->crud->addField([
            // MANDATORY
            'name'  => 'sim_infor', // DB column name (will also be the name of the input)
            'label' => 'Sim information', // the human-readable label for the input
            'type'  => 'text', // the field type (text, number, select, checkbox, etc)

            // OPTIONAL + example values
            'hint'       => 'Sim information', // helpful text, show up after input
            'attributes' => [
                'default' => '{}',
                'placeholder' => 'Device Number',
                'class' => 'form-control some-class',
            ], // extra HTML attributes and values your input might need
            'wrapperAttributes' => [
                'class' => 'form-group col-md-12'
            ] // extra HTML attributes for the field wrapper - mostly for resizing fields using the bootstrap column classes
        ]);


        $this->crud->addField([
            // MANDATORY
            'name'  => 'activated_at', // DB column name (will also be the name of the input)
            'label' => 'Activated Date', // the human-readable label for the input
            'type'  => 'date_picker', // the field type (text, number, select, checkbox, etc)

            // OPTIONAL + example values
            'hint'       => 'Activated date', // helpful text, show up after input
            'attributes' => [
                'placeholder' => 'Device Number',
                'class' => 'form-control some-class'
            ], // extra HTML attributes and values your input might need
            'wrapperAttributes' => [
                'class' => 'form-group col-md-12'
            ] // extra HTML attributes for the field wrapper - mostly for resizing fields using the bootstrap column classes
        ]);
        $this->crud->addField([
            // MANDATORY
            'name'  => 'expired_at', // DB column name (will also be the name of the input)
            'label' => 'Expired Date', // the human-readable label for the input
            'type'  => 'date_picker', // the field type (text, number, select, checkbox, etc)

            // OPTIONAL + example values
            'hint'       => 'Expired date', // helpful text, show up after input
            'attributes' => [
                'placeholder' => 'Expired Date',
                'class' => 'form-control some-class'
            ], // extra HTML attributes and values your input might need
            'wrapperAttributes' => [
                'class' => 'form-group col-md-12'
            ] // extra HTML attributes for the field wrapper - mostly for resizing fields using the bootstrap column classes
        ]);
        $this->crud->addField([
            // MANDATORY
            'name'  => 'setting', // DB column name (will also be the name of the input)
            'label' => 'Settings', // the human-readable label for the input
            'type'  => 'text', // the field type (text, number, select, checkbox, etc)

            // OPTIONAL + example values
            'attributes' => [
                'placeholder' => 'Setting...',
                'class' => 'form-control some-class'
            ], // extra HTML attributes and values your input might need
            'wrapperAttributes' => [
                'class' => 'form-group col-md-12'
            ] // extra HTML attributes for the field wrapper - mostly for resizing fields using the bootstrap column classes
        ]);
//        $this->crud->addField([
//            // MANDATORY
//            'name'  => 'user_id', // DB column name (will also be the name of the input)
//            'label' => 'Owner', // the human-readable label for the input
//            'type'  => 'number', // the field type (text, number, select, checkbox, etc)
//        ]);
        $this->crud->addField([
            'name' => 'user_id',
            'label' => 'Owner',
            'type' => 'select2_from_array',
            'options' => $this->getOwner(),
            'allows_null' => false,
            'hint' => 'Search user to own this device',
        ]);

        $this->crud->addField([
            'name' => 'status',
            'label' => 'Status',
            'type' => 'select_from_array',
            'options' => ['0' => "In-Active", '1' => "Active", '2' => 'Extend expired', "3" => "Unused"],
            'allows_null' => false,
        ]);
        //filters
        $this->crud->addFilter([ // add a "simple" filter called Draft
            'type' => 'simple',
            'name' => 'expired',
            'label'=> 'Sắp hết hạn'
        ],
            false, // the simple filter has no values, just the "Draft" label specified above
            function() { // if the filter is active (the GET parameter "draft" exits)
                $current_date = Carbon::now('utc')->addMonth(1);
                $today = Carbon::now('utc');
                $strDate = $current_date->format('Y-m-d H:i:s');
                $todayStr = $today->format('Y-m-d H:i:s');
                $this->crud->addClause('where', 'expired_at', '<=', "$strDate");
                $this->crud->addClause('where', 'expired_at', '>', "$todayStr");
                // we've added a clause to the CRUD so that only elements with draft=1 are shown in the table
                // an alternative syntax to this would have been
                // $this->crud->query = $this->crud->query->where('draft', '1');
                // another alternative syntax, in case you had a scopeDraft() on your model:
                // $this->crud->addClause('draft');
            });
        //new filter
        $this->crud->addFilter([ // add a "simple" filter called Draft
            'type' => 'simple',
            'name' => 'overdue',
            'label'=> 'Quá hạn'
        ],
            false, // the simple filter has no values, just the "Draft" label specified above
            function() { // if the filter is active (the GET parameter "draft" exits)
                $today = Carbon::now('utc');
                $todayStr = $today->format('Y-m-d H:i:s');
                $this->crud->addClause('where', 'expired_at', '<', "$todayStr");
                // we've added a clause to the CRUD so that only elements with draft=1 are shown in the table
                // an alternative syntax to this would have been
                // $this->crud->query = $this->crud->query->where('draft', '1');
                // another alternative syntax, in case you had a scopeDraft() on your model:
                // $this->crud->addClause('draft');
            });
        // ------ CRUD FIELDS
        // $this->crud->addField($options, 'update/create/both');
        // $this->crud->addFields($array_of_arrays, 'update/create/both');
        // $this->crud->removeField('name', 'update/create/both');
        // $this->crud->removeFields($array_of_names, 'update/create/both');

        // ------ CRUD COLUMNS
        // $this->crud->addColumn(); // add a single column, at the end of the stack
        // $this->crud->addColumns(); // add multiple columns, at the end of the stack
        // $this->crud->removeColumn('column_name'); // remove a column from the stack
        // $this->crud->removeColumns(['column_name_1', 'column_name_2']); // remove an array of columns from the stack
        // $this->crud->setColumnDetails('column_name', ['attribute' => 'value']); // adjusts the properties of the passed in column (by name)
        // $this->crud->setColumnsDetails(['column_1', 'column_2'], ['attribute' => 'value']);

        // ------ CRUD BUTTONS
        // possible positions: 'beginning' and 'end'; defaults to 'beginning' for the 'line' stack, 'end' for the others;
        // $this->crud->addButton($stack, $name, $type, $content, $position); // add a button; possible types are: view, model_function
        // $this->crud->addButtonFromModelFunction($stack, $name, $model_function_name, $position); // add a button whose HTML is returned by a method in the CRUD model
        // $this->crud->addButtonFromView($stack, $name, $view, $position); // add a button whose HTML is in a view placed at resources\views\vendor\backpack\crud\buttons
        // $this->crud->removeButton($name);
        // $this->crud->removeButtonFromStack($name, $stack);
        // $this->crud->removeAllButtons();
        // $this->crud->removeAllButtonsFromStack('line');

        // ------ CRUD ACCESS
         //$this->crud->allowAccess(['list', 'create', 'update', 'reorder', 'delete']);
        $user = Auth::user();
        if (!$user->hasRole('Admin')){
            $this->crud->denyAccess(['create', 'update', 'delete']);
        }

        // ------ CRUD REORDER
        // $this->crud->enableReorder('label_name', MAX_TREE_LEVEL);
        // NOTE: you also need to do allow access to the right users: $this->crud->allowAccess('reorder');

        // ------ CRUD DETAILS ROW
        // $this->crud->enableDetailsRow();
        // NOTE: you also need to do allow access to the right users: $this->crud->allowAccess('details_row');
        // NOTE: you also need to do overwrite the showDetailsRow($id) method in your EntityCrudController to show whatever you'd like in the details row OR overwrite the views/backpack/crud/details_row.blade.php

        // ------ REVISIONS
        // You also need to use \Venturecraft\Revisionable\RevisionableTrait;
        // Please check out: https://laravel-backpack.readme.io/docs/crud#revisions
        // $this->crud->allowAccess('revisions');

        // ------ AJAX TABLE VIEW
        // Please note the drawbacks of this though:
        // - 1-n and n-n columns are not searchable
        // - date and datetime columns won't be sortable anymore
        // $this->crud->enableAjaxTable();

        // ------ DATATABLE EXPORT BUTTONS
        // Show export to PDF, CSV, XLS and Print buttons on the table view.
        // Does not work well with AJAX datatables.
        // $this->crud->enableExportButtons();

        // ------ ADVANCED QUERIES
        // $this->crud->addClause('active');
        // $this->crud->addClause('type', 'car');
        // $this->crud->addClause('where', 'name', '==', 'car');
        // $this->crud->addClause('whereName', 'car');
        // $this->crud->addClause('whereHas', 'posts', function($query) {
        //     $query->activePosts();
        // });
        // $this->crud->addClause('withoutGlobalScopes');
        // $this->crud->addClause('withoutGlobalScope', VisibleScope::class);
        // $this->crud->with(); // eager load relationships
        // $this->crud->orderBy();
        // $this->crud->groupBy();
        // $this->crud->limit();
        $this->crud->resume = $this->getNumberDeviceByStatus();
        $this->crud->statusMapping = Tracking_device::getStatusDeviceMapping();
    }

    public function store(StoreRequest $request)
    {
        // your additional operations before save here
        $redirect_location = parent::storeCrud();
        // your additional operations after save here
        // use $this->data['entry'] or $this->crud->entry
        return $redirect_location;
    }

    public function update(UpdateRequest $request)
    {
        //update the created at
        $user_id = $request->get('user_id');
        $device_id = $request->get('id');
        $device = Tracking_device::find($device_id);
        $old_user = $device->user_id;
        // your additional operations before save here
        $redirect_location = parent::updateCrud();
        // your additional operations after save here
        // use $this->data['entry'] or $this->crud->entry
        if ($redirect_location) {
            if ($old_user != $user_id && $device->user_id != 0) {
                //if user is change, change the time
                $now = Carbon::now('UTC');
                $nextYear = Carbon::now('UTC')->addYears(1);
                $device->activated_at = $now->format(Tracking_device::DB_DATETIME_FORMAT);
                $device->expired_at = $nextYear->format(Tracking_device::DB_DATETIME_FORMAT);
                $device->save();
            }
        }

        return $redirect_location;
    }
    private function getOwner() {
        $users = User::get()->toArray();
        $userArray = [];
        $userArray[0] = "None";
        foreach($users as $user) {
            $userArray[$user['id']] = $user["username"];
        }
        return $userArray;
    }

    private function getNumberDeviceByStatus(){
        $query = "select d.status, COUNT(d.id) as num_device
        from tracking_devices as d
        where d.is_deleted = 0
        group by d.status";
        $status_devices = DB::select($query, []);
        $status_num_devices = [];
        foreach($status_devices as $device) {
            $status_num_devices[$device->status] = $device->num_device;
        }
        return $status_num_devices;
    }
}
