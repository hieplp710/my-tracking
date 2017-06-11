<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DeviceLocation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('device_locations', function (Blueprint $table) {
            //
            $table->increments('id');
            $table->integer('device_id')->unsigned();
            $table->float('lat');
            $table->float('lng');
            $table->tinyInteger('status');
            $table->tinyInteger('heading');
            $table->dateTime('created_at');
            $table->dateTime('updated_at');
            $table->string('current_state')->nullable();
            $table->tinyInteger('is_deleted');
        });
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('device_locations', function (Blueprint $table) {
            //
        });
    }
}
