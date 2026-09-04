// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createSchool } from "../../../services/academicsService";

// const AddSchool = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     logo: null,
//     code: "",
//     address: "",
//     phone: "",
//     email: "",
//     website: "",
//     principal_name: "",
//     established_year: "",
//     is_active: true,
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };
// const handleSubmit = async (e) => {
//   e.preventDefault();

//   try {
//     setLoading(true);
//     setError("");

//     const data = new FormData();

//     data.append("name", formData.name);
//     data.append("code", formData.code);
//     data.append("address", formData.address);
//     data.append("phone", formData.phone);
//     data.append("email", formData.email);
//     data.append("website", formData.website);
//     data.append("principal_name", formData.principal_name);

//     if (formData.established_year) {
//       data.append(
//         "established_year",
//         formData.established_year,
//       );
//     }

//     data.append(
//       "is_active",
//       formData.is_active ? "true" : "false",
//     );

//     if (formData.logo) {
//       data.append("logo", formData.logo);
//     }

//     await createSchool(data);

//     navigate("/admin/academic/schools");
//   } catch (err) {
//     console.error("Failed to create school:", err);
//     setError("Failed to create school.");
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div>
//       {/* HEADER */}
//       <div className="mb-6">
//         <button
//           type="button"
//           onClick={() =>
//             navigate("/admin/academic/schools")
//           }
//           className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-800"
//         >
//           ← Back to Schools
//         </button>

//         <h1 className="text-2xl font-bold text-slate-800">
//           Add School
//         </h1>

//         <p className="text-sm text-slate-500">
//           Create a new school.
//         </p>
//       </div>

//       {/* ERROR */}
//       {error && (
//         <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* FORM */}
//       <form
//         onSubmit={handleSubmit}
//         className="rounded-xl bg-white p-6 shadow"
//       >
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//           {/* SCHOOL NAME */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               School Name
//             </label>

//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter school name"
//               required
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* SCHOOL CODE */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               School Code
//             </label>

//             <input
//               type="text"
//               name="code"
//               value={formData.code}
//               onChange={handleChange}
//               placeholder="Example: EDU"
//               required
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm uppercase outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* PHONE */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Phone
//             </label>

//             <input
//               type="text"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="Enter phone number"
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* EMAIL */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Email
//             </label>

//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="school@example.com"
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* WEBSITE */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Website
//             </label>

//             <input
//               type="url"
//               name="website"
//               value={formData.website}
//               onChange={handleChange}
//               placeholder="https://example.com"
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* PRINCIPAL */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Principal Name
//             </label>

//             <input
//               type="text"
//               name="principal_name"
//               value={formData.principal_name}
//               onChange={handleChange}
//               placeholder="Enter principal name"
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* ESTABLISHED YEAR */}
//           <div>
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Established Year
//             </label>

//             <input
//               type="number"
//               name="established_year"
//               value={formData.established_year}
//               onChange={handleChange}
//               placeholder="Example: 2023"
//               min="1800"
//               max="2100"
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* ADDRESS */}
//           <div className="md:col-span-2">
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Address
//             </label>

//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               placeholder="Enter school address"
//               rows="4"
//               className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
//             />
//           </div>

//           <div>
//   <label className="mb-1 block text-sm font-medium text-gray-700">
//     School Logo
//   </label>

//   <input
//     type="file"
//     accept="image/*"
//     onChange={(e) =>
//       setFormData({
//         ...formData,
//         logo: e.target.files[0],
//       })
//     }
//     className="w-full rounded-lg border border-gray-300 px-3 py-2"
//   />
// </div>

//           {/* STATUS */}
//           <div className="md:col-span-2">
//             <label className="mb-2 block text-sm font-medium text-slate-700">
//               Status
//             </label>

//             <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 py-3">
//               <input
//                 type="checkbox"
//                 name="is_active"
//                 checked={formData.is_active}
//                 onChange={handleChange}
//                 className="h-4 w-4"
//               />

//               <span className="text-sm text-slate-700">
//                 Active
//               </span>
//             </label>
//           </div>
//         </div>

//         {/* BUTTONS */}
//         <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
//           <button
//             type="button"
//             onClick={() =>
//               navigate("/admin/academic/schools")
//             }
//             className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
//           >
//             Cancel
//           </button>

//           <button
//             type="submit"
//             disabled={saving}
//             className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {saving ? "Creating..." : "Create School"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddSchool;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSchool } from "../../../services/academicsService";

const AddSchool = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    principal_name: "",
    established_year: "",
    is_active: true,
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files && files.length > 0 ? files[0] : null,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = new FormData();

      data.append("name", formData.name);
      data.append("code", formData.code);
      data.append("address", formData.address);
      data.append("phone", formData.phone);
      data.append("email", formData.email);
      data.append("website", formData.website);
      data.append("principal_name", formData.principal_name);

      if (formData.established_year) {
        data.append(
          "established_year",
          formData.established_year,
        );
      }

      data.append(
        "is_active",
        formData.is_active ? "true" : "false",
      );

      if (formData.logo) {
        data.append("logo", formData.logo);
      }

      await createSchool(data);

      navigate("/admin/academic/schools");
    } catch (err) {
      console.error("Failed to create school:", err);

      if (err.response?.data) {
        console.error(
          "Server response:",
          err.response.data,
        );
      }

      setError("Failed to create school. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Add School
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new school.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/academic/schools")
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SCHOOL NAME */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              School Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter school name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* SCHOOL CODE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              School Code
            </label>

            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="e.g. EDU"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter school email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* WEBSITE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Website
            </label>

            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* PRINCIPAL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Principal Name
            </label>

            <input
              type="text"
              name="principal_name"
              value={formData.principal_name}
              onChange={handleChange}
              placeholder="Enter principal name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* ESTABLISHED YEAR */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Established Year
            </label>

            <input
              type="number"
              name="established_year"
              value={formData.established_year}
              onChange={handleChange}
              placeholder="e.g. 2023"
              min="1800"
              max="2100"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* SCHOOL LOGO */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              School Logo
            </label>

            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />

            <p className="mt-1 text-xs text-gray-500">
              Upload JPG, JPEG, PNG, or another image format.
            </p>

            {formData.logo && (
              <p className="mt-2 text-sm text-green-600">
                Selected: {formData.logo.name}
              </p>
            )}
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              placeholder="Enter school address"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* ACTIVE */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4"
              />

              <span className="text-sm font-medium text-gray-700">
                School is active
              </span>
            </label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={() =>
              navigate("/admin/academic/schools")
            }
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create School"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSchool;