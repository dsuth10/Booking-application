import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";

function Timetable(): React.JSX.Element {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-slate-900">Timetable View</h1>
        <p className="text-slate-600">View and print student bookings for individual teachers.</p>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm text-slate-500 italic">Select an event and teacher to view the timetable.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Timetable;
