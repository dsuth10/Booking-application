import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";

function Teachers(): React.JSX.Element {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-slate-900">Manage Teachers</h1>
        <p className="text-slate-600">Teacher setup and management functionality coming soon.</p>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm text-slate-500 italic">No teachers found for the current event.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Teachers;
