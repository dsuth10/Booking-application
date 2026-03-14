import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";

function Events(): React.JSX.Element {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-slate-900">Manage Events</h1>
        <p className="text-slate-600">Event management functionality coming soon.</p>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <button className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors">
             Create Event
           </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Events;
