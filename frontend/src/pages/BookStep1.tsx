import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useBookingContext } from "../context/BookingContext";

const schema = z.object({
  parentName: z.string().min(1, "Please enter your name."),
  parentEmail: z.string().email("Please enter a valid email address."),
  students: z
    .array(z.object({ name: z.string().min(1, "Student name is required.") }))
    .min(1, "Please add at least one student."),
});

type FormValues = z.infer<typeof schema>;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p style={{ fontSize: "0.78rem", color: "#dc2626", marginTop: 4 }}>{msg}</p>
  );
}

function BookStep1(): JSX.Element {
  const { parentName, parentEmail, studentNames, dispatch } = useBookingContext();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentName,
      parentEmail,
      students: studentNames.length ? studentNames.map((name) => ({ name })) : [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "students" });

  const onSubmit = (values: FormValues) => {
    dispatch({
      type: "setParentDetails",
      name: values.parentName,
      email: values.parentEmail,
      students: values.students.map((s) => s.name),
    });
    navigate("/book/teachers");
  };

  return (
    <div className="bg-hero-gradient" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      {/* Steps indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
        <div className="step-dot active" />
        <div className="step-dot" />
        <div className="step-dot" />
      </div>

      <div className="glass-card fade-up" style={{ borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 520 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#10b98f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Step 1 of 3
          </p>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>
            Your details
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.5 }}>
            We&apos;ll use these to confirm your bookings and contact you if needed.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Parent name */}
          <div>
            <label htmlFor="parentName" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Parent / Guardian name
            </label>
            <input id="parentName" {...register("parentName")} className="field-input" placeholder="Jane Smith" />
            <FieldError msg={errors.parentName?.message} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="parentEmail" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Email address
            </label>
            <input id="parentEmail" type="email" {...register("parentEmail")} className="field-input" placeholder="jane.smith@email.com" />
            <FieldError msg={errors.parentEmail?.message} />
          </div>

          {/* Students */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#374151" }}>
                Student name(s)
              </label>
              <button
                type="button"
                onClick={() => append({ name: "" })}
                style={{
                  fontSize: "0.78rem", fontWeight: 600, color: "#10b98f",
                  background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  padding: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add student
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fields.map((field, index) => (
                <div key={field.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    {...register(`students.${index}.name`)}
                    className="field-input"
                    placeholder={`Student ${index + 1} name`}
                    style={{ flex: 1 }}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "#fff1f2", border: "1.5px solid #fecdd3",
                        color: "#ef4444", cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.students && (
              <FieldError msg={errors.students.root?.message ?? "Please check the student names."} />
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
            <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              Next
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookStep1;
