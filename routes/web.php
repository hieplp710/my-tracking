<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    if (\Illuminate\Support\Facades\Auth::check()) {
        $site_url = config('app.url');
        return view('home',["url" => $site_url]);
    }
    return view('auth.login');
});

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

Route::group([
    'prefix' => config('backpack.base.route_prefix', 'admin'),
    'middleware' => ['admin'],
    'namespace' => 'Admin'
], function() {
    // your CRUD resources and other admin routes here
    CRUD::resource('tracking_device', 'Tracking_deviceCrudController');
    CRUD::resource('devicelocation', 'DeviceLocationCrudController');
});

Route::post('/tracking/location', 'Tracking\DeviceController@location')->name('location');
Route::post('/tracking/get-locations', 'Tracking\DeviceController@getDeviceLocations')->name('get_location');
Route::get('/device/get-deviceid', 'Tracking\DeviceController@generateDeviceId')->name('get_device_id');