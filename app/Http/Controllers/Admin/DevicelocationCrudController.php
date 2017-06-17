<?php

namespace App\Http\Controllers\Admin;

use Backpack\CRUD\app\Http\Controllers\CrudController;

// VALIDATION: change the requests to match your own file names if you need form validation
use App\Http\Requests\DevicelocationRequest as StoreRequest;
use App\Http\Requests\DevicelocationRequest as UpdateRequest;

class DeviceLocationCrudController extends CrudController
{
    public function setup()
    {
        /*
        |--------------------------------------------------------------------------
        | BASIC CRUD INFORMATION
        |--------------------------------------------------------------------------
        */
        $this->crud->setModel('App\Models\Devicelocation');
        $this->crud->setRoute(config('backpack.base.route_prefix') . '/devicelocation');
        $this->crud->setEntityNameStrings('devicelocation', 'Device locations');

        /*
        |--------------------------------------------------------------------------
        | BASIC CRUD INFORMATION
        |--------------------------------------------------------------------------
        */

        //$this->crud->setFromDb();
        /*
        |--------------------------------------------------------------------------
        | COLUMNS AND FIELDS
        |--------------------------------------------------------------------------
        */

        // ------ CRUD COLUMNS for list
//        $this->crud->addColumn('device_id')->label('Device Id')->type('string');
//        $this->crud->addColumn('command')->label('Command');
//        $this->crud->addColumn('status')->label('Status');
//        $this->crud->addColumn('created_at')->label('Time')->type('datetime');
//        $this->crud->addColumn('lat')->label('Latitude');
//        $this->crud->addColumn('lng')->label('Longitude');
//        $this->crud->addColumn('heading')->label('Direction');
//        $this->crud->addColumn('current_state')->label('Description');
//        $this->crud->addColumn('velocity')->label('Velocity');
//        $this->crud->addColumn('reverser')->label('Reverser');
//        $this->crud->addColumn('checksum')->label('Checksum');
//        $this->crud->addColumn('is_deleted')->label('Deleted')->type('checkbox');

        $this->crud->addColumn([
            'name' => 'device_id', // The db column name
            'label' => "Device Id", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'command', // The db column name
            'label' => "Command", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'status', // The db column name
            'label' => "Status", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'created_at', // The db column name
            'label' => "Time", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'lat', // The db column name
            'label' => "Latitude", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'lng', // The db column name
            'label' => "Longitude", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'heading', // The db column name
            'label' => "Direction", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'current_state', // The db column name
            'label' => "Description", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'velocity', // The db column name
            'label' => "Velocity", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'reverser', // The db column name
            'label' => "Reverser", // Table column heading
            'type' => 'Text'
        ]);
        $this->crud->addColumn([
            'name' => 'checksum', // The db column name
            'label' => "Checksum", // Table column heading
            'type' => 'check'
        ]);

        // ------ CRUD FIELDS for create/update
//        $this->crud->addField('title')->label('Title')->type('text')->placeholder('Your title here');
//        CRUD::addField('slug')->label('Slug (URL)')->type('text')->hint('Will be automatically generated from your title, if left empty');
//        CRUD::addField('date')->label('Date')->type('date')->value(date('Y-m-d'))->showOnCreate(); // alternatives: showOnCreate(); showOnUpdate(); showOnBoth(); hideOnCreate(); hideOnUpdate();
//        CRUD::addField('date')->label('Date')->type('date')->showOnUpdate();
//        CRUD::addField('content')->label('Content')->type('ckeditor')->placeholder('Your textarea text here');
//        CRUD::addField('image')->label('Image')->type('browse');
//        CRUD::addField('category_id')->type('select2')->label('Category')->entity('category')->attribute('name')->model('App\Models\Category');
//        CRUD::addField('tags')->type('select2_multiple')->label('Tags')->entity('tags')->attribute('name')->model('App\Models\Tag')->pivot(true);
//        CRUD::addField('name')->label('Status')->type('enum');
//        CRUD::addField('featured')->label('Featured item')->type('checkbox');

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
        // your additional operations before save here
        $redirect_location = parent::updateCrud();
        // your additional operations after save here
        // use $this->data['entry'] or $this->crud->entry
        return $redirect_location;
    }
}
