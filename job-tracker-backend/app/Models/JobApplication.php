<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = [
    'user_id',
    'company_name',
    'position',
    'status',
    'notes',
    'date_applied',
    'application_link',
    ];

    public function user()
    {
    return $this->belongsTo(User::class);
    }
}
