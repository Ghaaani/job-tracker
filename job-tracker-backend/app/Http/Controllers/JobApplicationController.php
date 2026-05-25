<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    public function index()
    {
        return Auth::user()->jobApplications()->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'application_link' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();
        $data['date_applied'] = now();

        $job = JobApplication::create($data);

        return response()->json($job);
    }

    public function update(Request $request, $id)
    {
        $job = JobApplication::findOrFail($id);

        if ($job->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'notes' => 'nullable|string',
            'date_applied' => 'required|date',
            'application_link' => 'nullable|url',
        ]);

        $job->update($data);

        return response()->json($job);
    }

    public function destroy($id)
    {
        $job = JobApplication::findOrFail($id);

        if ($job->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $job->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}