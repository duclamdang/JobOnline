<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            $this->loadModuleRoutes(base_path('routes/admin'));
            $this->loadModuleRoutes(base_path('routes/user'));
            $this->loadModuleRoutes(base_path('routes/shared'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    protected function loadModuleRoutes(string $path): void
    {
        if (File::isDirectory($path)) {
            $files = File::allFiles($path);

            foreach ($files as $file) {
                if ($file->getExtension() === 'php') {
                    Route::prefix('api')
                        ->middleware('api')
                        ->group($file->getPathname());
                }
            }
        }
    }
}
