<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'             => 'required|string|max:255',
            'description'       => 'nullable|string',
            'quantity'          => 'required|integer|min:1',
            'salary_from'       => 'nullable|numeric',
            'salary_to'         => 'nullable|numeric',
            'province_id'       => 'required|integer|exists:provinces,id',
            'working_form_id'   => 'nullable|integer|exists:working_forms,id',
            'work_field_id'     => 'required|array',
            'work_field_id.*'   => 'integer|exists:work_fields,id',
            'work_experience_id'=> 'nullable|integer|exists:work_experiences,id',
            'education_id'      => 'nullable|integer|exists:educations,id',
            'position_id'       => 'nullable|integer|exists:positions,id',
            'requirements'      => 'nullable|string',
            'end_date'          => 'nullable|date',
            'is_fulltime'       =>'boolean',
            'skills'            => 'nullable|string',
            'is_active'         => 'boolean',
            'is_urgent'         => 'boolean',
            'gender'            => 'nullable|integer',
            'benefit'           => 'nullable|string',
            'salary_negotiable' => 'boolean',
            'address'           => 'nullable|string',
            'district_id'       => 'required|integer|exists:districts,id',
        ];
    }
}
