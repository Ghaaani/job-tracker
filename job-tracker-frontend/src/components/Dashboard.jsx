import { useEffect, useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("Applied");
  const [notes, setNotes] = useState("");

  const [editingJobId, setEditingJobId] = useState(null);
  const [editCompany, setEditCompany] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editStatus, setEditStatus] = useState("Applied");
  const [editNotes, setEditNotes] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const [applicationLink, setApplicationLink] = useState("");

  const [editApplicationLink, setEditApplicationLink] = useState("");

  const getJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load jobs");
    }
  };

  const createJob = async () => {
    try {
      if (!company.trim() || !position.trim()) {
        toast.error("Company and position are required");
        return;
      }

      await API.post("/jobs", {
        company_name: company,
        position,
        status,
        notes,
        application_link: applicationLink,
        date_applied: new Date().toISOString().split("T")[0],
      });

      toast.success("Job created successfully");
      setCompany("");
      setPosition("");
      setStatus("Applied");
      setNotes("");
      getJobs();
      setApplicationLink("");
    } catch (err) {
      console.log(err);
      toast.error("Failed to create job");
    }
  };

  const deleteJob = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job application?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/jobs/${id}`);

      getJobs();

      toast.success("Job deleted successfully");
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const updateJob = async (id) => {
    try {
      if (!editCompany.trim() || !editPosition.trim()) {
        toast.error("Company and position are required");
        return;
      }

    await API.put(`/jobs/${id}`, {
      company_name: editCompany,
      position: editPosition,
      status: editStatus,
      notes: editNotes,
      date_applied: jobs.find(job => job.id === id)?.date_applied,
      application_link: editApplicationLink,
    });

      toast.success("Job updated successfully");
      setEditingJobId(null);
      getJobs();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update job");
    }
  };

  const startEditing = (job) => {
    setEditingJobId(job.id);
    setEditCompany(job.company_name);
    setEditPosition(job.position);
    setEditStatus(job.status);
    setEditNotes(job.notes || "");
    setEditApplicationLink(job.application_link || "");
  };

  const logout = async () => {
    try {
      await API.post("/logout");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragEnd = async (result) => {
  if (!result.destination) return;

  const jobId = parseInt(result.draggableId);
  const newStatus = result.destination.droppableId;

  const jobToUpdate = jobs.find((job) => job.id === jobId);

  if (!jobToUpdate) return;

  try {
    await API.put(`/jobs/${jobId}`, {
      company_name: jobToUpdate.company_name,
      position: jobToUpdate.position,
      status: newStatus,
      notes: jobToUpdate.notes,
      application_link: jobToUpdate.application_link,
      date_applied: jobToUpdate.date_applied,
    });

    getJobs();
    toast.success(`Moved to ${newStatus}`);
  } catch (err) {
    console.log(err);
    toast.error("Failed to move job");
  }
};

  const getStatusColor = (jobStatus) => {
    switch (jobStatus) {
      case "Applied":
        return "bg-blue-100 text-blue-700";
      case "Interview":
        return "bg-yellow-100 text-yellow-700";
      case "Offer":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await API.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load jobs");
      }
    };

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
      const matchesSearch =
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || job.status === filterStatus;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);

        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);

        case "az":
          return a.company_name.localeCompare(b.company_name);

        case "za":
          return b.company_name.localeCompare(a.company_name);

        default:
          return 0;
      }
    });

  const appliedCount = jobs.filter((job) => job.status === "Applied").length;
  const interviewCount = jobs.filter((job) => job.status === "Interview").length;
  const offerCount = jobs.filter((job) => job.status === "Offer").length;
  const rejectedCount = jobs.filter((job) => job.status === "Rejected").length;
  const statuses = ["Applied", "Interview", "Offer", "Rejected"];
  const chartData = [
    { name: "Applied", value: appliedCount },
    { name: "Interview", value: interviewCount },
    { name: "Offer", value: offerCount },
    { name: "Rejected", value: rejectedCount },
  ];
  const COLORS = ["#60a5fa", "#facc15", "#4ade80", "#f87171"];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Job Tracker Dashboard
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium"
        >
          Logout
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto px-8 py-8 space-y-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-6 rounded-2xl shadow">
            <h3 className="text-blue-700 font-semibold">Applied</h3>
            <p className="text-3xl font-bold">{appliedCount}</p>
          </div>

          <div className="bg-yellow-100 p-6 rounded-2xl shadow">
            <h3 className="text-yellow-700 font-semibold">Interview</h3>
            <p className="text-3xl font-bold">{interviewCount}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl shadow">
            <h3 className="text-green-700 font-semibold">Offer</h3>
            <p className="text-3xl font-bold">{offerCount}</p>
          </div>

          <div className="bg-red-100 p-6 rounded-2xl shadow">
            <h3 className="text-red-700 font-semibold">Rejected</h3>
            <p className="text-3xl font-bold">{rejectedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">Company A-Z</option>
              <option value="za">Company Z-A</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Add New Job
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Rejected</option>
              <option>Offer</option>
            </select>

            <button
              onClick={createJob}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold py-2"
            >
              Create Job
            </button>
          </div>

          <textarea
            placeholder="Notes about this application..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full mt-5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          />

          <input
          type="url"
          placeholder="Application link (optional)"
          value={applicationLink}
          onChange={(e) => setApplicationLink(e.target.value)}
          className="border rounded-xl px-4 py-2 w-full mt-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Applications by Status
            </h2>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

  <div className="bg-white rounded-3xl shadow-lg p-6 min-h-[600px]">
    <h2 className="text-xl font-bold text-slate-800 mb-6">
      Job Status Overview
    </h2>

    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
          <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-8 items-start">
            {statuses.map((status) => {
              const jobsByStatus = filteredJobs.filter(
                (job) => job.status === status
              );

              return (
                <Droppable droppableId={status} key={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white rounded-3xl shadow-lg p-5 min-h-[350px]"
                    >
                      <h2 className="text-xl font-bold text-slate-800 mb-5">
                        {status}
                      </h2>

                      <div className="space-y-4">
                        {jobsByStatus.map((job, index) => (
                          <Draggable
                            key={job.id}
                            draggableId={job.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-slate-50 border rounded-2xl p-5 shadow-md hover:shadow-lg transition cursor-grab active:cursor-grabbing"
                                
                              >
                                {editingJobId === job.id ? (
                                  <>
                                    <input
                                      value={editCompany}
                                      onChange={(e) =>
                                        setEditCompany(e.target.value)
                                      }
                                      className="border rounded-lg px-4 py-2 w-full mb-3"
                                    />

                                    <input
                                      value={editPosition}
                                      onChange={(e) =>
                                        setEditPosition(e.target.value)
                                      }
                                      className="border rounded-lg px-4 py-2 w-full mb-3"
                                    />

                                    <textarea
                                      value={editNotes}
                                      onChange={(e) =>
                                        setEditNotes(e.target.value)
                                      }
                                      className="border rounded-lg px-4 py-2 w-full mb-3"
                                      rows="2"
                                    />

                                    <input
                                      type="url"
                                      value={editApplicationLink}
                                      onChange={(e) =>
                                        setEditApplicationLink(e.target.value)
                                      }
                                      className="border rounded-lg px-4 py-2 w-full mb-3"
                                    />

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => updateJob(job.id)}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                                      >
                                        Save
                                      </button>

                                      <button
                                        onClick={() =>
                                          setEditingJobId(null)
                                        }
                                        className="flex-1 bg-slate-400 text-white py-2 rounded-lg"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <h3 className="font-bold text-slate-800">
                                      {job.company_name}
                                    </h3>

                                    <p className="text-slate-600 mt-2">
                                      {job.position}
                                    </p>

                                    <p className="text-xs text-slate-400 mt-2">
                                      Applied on{" "}
                                      {new Date(
                                        job.date_applied
                                      ).toLocaleDateString()}
                                    </p>

                                    {job.notes && (
                                      <p className="text-slate-600 mt-3 break-words whitespace-pre-wrap">
                                        {job.notes}
                                      </p>
                                    )}

                                    {job.application_link && (
                                      <a
                                        href={job.application_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-4 text-blue-600 text-sm hover:underline"
                                      >
                                        Open Application →
                                      </a>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                      <button
                                        onClick={() =>
                                          startEditing(job)
                                        }
                                        className="flex-1 bg-yellow-500 text-white py-2 rounded-lg"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        onClick={() =>
                                          deleteJob(job.id)
                                        }
                                        className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Dashboard;