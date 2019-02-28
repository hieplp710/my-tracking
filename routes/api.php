<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });
Route::post('/login', 'Tracking\DeviceMobileController@login')->name('login');
Route::group(['middleware' => ['jwt.verify']], function() {
    Route::get('user', 'UserController@getAuthenticatedUser');
    Route::get('/get-locations-mobile', 'Tracking\DeviceMobileController@getDeviceLocations')->name('get_location');
    Route::get('/get-user', 'Tracking\DeviceMobileController@getUserProfile')->name('get_user');
    Route::post('/get-roadmap', 'Tracking\DeviceMobileController@getRoadmap')->name('get_roadmap');
    Route::post('/get-device-list', 'Tracking\DeviceMobileController@getDeviceList')->name('get_device_list');
});
