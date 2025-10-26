<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;

class FileHelper
{
    // $path = FileHelper::upload($request->file('avatar'), 'avatars');
    // FileHelper::url($path);  // http://yourapp/storage/avatars/xyz.png

    public static function upload($file, $path = 'uploads')
    {
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs($path, $filename, 'public');
        return $path . '/' . $filename;
    }

    public static function delete($path)
    {
        return Storage::disk('public')->delete($path);
    }

    public static function url($path)
    {
        return $path ? Storage::disk('public')->url($path) : null;
    }
}
