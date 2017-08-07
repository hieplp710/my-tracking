<?php

namespace App\Providers;

use App\Models\Tracking_device;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        Validator::extend('inactive', function ($attribute, $value, $parameters, $validator) {
            $device = Tracking_device::where('id', '=', $value)
                ->where('is_deleted', '=', 0)
                ->where(function ($query) {
                    $query->orWhere('user_id', '=', 0)
                        ->orWhereNull('user_id');
                })
                ->take(1)
                ->get();
            return (isset($device[0]) && ($device[0] instanceof Tracking_device));
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
