<?php

namespace App\Http\Services\Shared;

use App\Models\Industry;
use App\Models\Major;
use App\Models\WorkingForm;
use App\Models\Position;
use App\Models\Language;
use App\Models\WorkExperience;
use App\Models\Education;
use App\Models\WorkField;

class JobCatalogService
{
    public function getAllWorkingForms()
    {
        return WorkingForm::all();
    }

    public function getAllPositions()
    {
        return Position::all();
    }

    public function getAllLanguages()
    {
        return Language::all();
    }

    public function getAllWorkExperiences()
    {
        return WorkExperience::all();
    }

    public function getAllEducations()
    {
        return Education::all();
    }

    public function getAllWorkFields()
    {
        return WorkField::all();
    }

    public function getAllMajors()
    {
        return Major::all();
    }

    public function getAllIndustries()
    {
        return Industry::all();
    }
}
