// const Home = () => {
//   return (
//     <div>
//       {/* ================= HERO ================= */}
//       <section className="relative overflow-hidden bg-gray-950 text-white">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-gray-950 to-gray-900" />

//         <div className="relative mx-auto grid min-h-[700px] items-center gap-16 px-8 py-20 lg:grid-cols-2 lg:px-12 xl:px-16">
//           {/* Hero Content */}
//           <div>
//             <div className="mb-6 inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
//               Modern School Management Platform
//             </div>

//             <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl xl:text-7xl">
//               Empowering Schools.
//               <span className="block text-blue-500">
//                 Transforming Education.
//               </span>
//             </h1>

//             <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-300 md:text-xl">
//               EduManageERP brings students, teachers, parents, and
//               administrators together in one powerful platform designed to
//               simplify and modernize school management.
//             </p>

//             {/* Buttons */}
//             <div className="mt-9 flex flex-col gap-4 sm:flex-row">
//               <a
//                 href="/admission"
//                 className="rounded-lg bg-blue-700 px-7 py-4 text-center text-base font-semibold text-white transition hover:bg-blue-600"
//               >
//                 Start Your Application
//               </a>

//               <a
//                 href="/academy"
//                 className="rounded-lg border border-gray-600 px-7 py-4 text-center text-base font-semibold text-white transition hover:border-blue-500 hover:bg-white/5"
//               >
//                 Explore Academy
//               </a>
//             </div>

//             {/* Trust Information */}
//             <div className="mt-12 flex flex-wrap gap-8 border-t border-gray-800 pt-8">
//               <div>
//                 <p className="text-2xl font-bold">100%</p>

//                 <p className="mt-1 text-sm text-gray-400">Digital Management</p>
//               </div>

//               <div>
//                 <p className="text-2xl font-bold">24/7</p>

//                 <p className="mt-1 text-sm text-gray-400">System Access</p>
//               </div>

//               <div>
//                 <p className="text-2xl font-bold">1</p>

//                 <p className="mt-1 text-sm text-gray-400">Unified Platform</p>
//               </div>
//             </div>
//           </div>

//           {/* Hero Visual */}
//           <div className="hidden lg:block">
//             <div className="relative mx-auto max-w-lg">
//               {/* Main Card */}
//               <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
//                 <div className="flex items-center justify-between border-b border-white/10 pb-5">
//                   <div>
//                     <p className="text-sm text-gray-400">School Dashboard</p>

//                     <h3 className="mt-1 text-xl font-semibold">EduManageERP</h3>
//                   </div>

//                   <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold">
//                     E
//                   </div>
//                 </div>

//                 {/* Dashboard Stats */}
//                 <div className="mt-6 grid grid-cols-2 gap-4">
//                   <div className="rounded-xl bg-white/5 p-5">
//                     <p className="text-sm text-gray-400">Students</p>

//                     <p className="mt-2 text-3xl font-bold">1,250</p>
//                   </div>

//                   <div className="rounded-xl bg-white/5 p-5">
//                     <p className="text-sm text-gray-400">Teachers</p>

//                     <p className="mt-2 text-3xl font-bold">85</p>
//                   </div>

//                   <div className="rounded-xl bg-white/5 p-5">
//                     <p className="text-sm text-gray-400">Attendance</p>

//                     <p className="mt-2 text-3xl font-bold text-green-400">
//                       94%
//                     </p>
//                   </div>

//                   <div className="rounded-xl bg-white/5 p-5">
//                     <p className="text-sm text-gray-400">Classes</p>

//                     <p className="mt-2 text-3xl font-bold">32</p>
//                   </div>
//                 </div>

//                 {/* Activity */}
//                 <div className="mt-5 rounded-xl bg-white/5 p-5">
//                   <div className="flex items-center justify-between">
//                     <p className="font-medium">Recent Activity</p>

//                     <span className="text-xs text-green-400">Live</span>
//                   </div>

//                   <div className="mt-5 space-y-4">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-400">
//                         Student enrollment
//                       </span>

//                       <span className="text-sm text-white">+24</span>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-400">
//                         Assignments submitted
//                       </span>

//                       <span className="text-sm text-white">128</span>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-400">
//                         Attendance recorded
//                       </span>

//                       <span className="text-sm text-white">96%</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Floating Card */}
//               <div className="absolute -bottom-8 -left-10 rounded-2xl border border-white/10 bg-blue-700 p-5 shadow-xl">
//                 <p className="text-sm text-blue-200">Academic Performance</p>

//                 <p className="mt-1 text-3xl font-bold">87.4%</p>

//                 <p className="mt-1 text-xs text-blue-200">
//                   Overall student performance
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ================= INTRO ================= */}
//       <section className="bg-white">
//         <div className="mx-auto max-w-7xl px-8 py-24 lg:px-12 xl:px-16">
//           <div className="max-w-3xl">
//             <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
//               Built for modern education
//             </p>

//             <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
//               Everything your school needs in one place.
//             </h2>

//             <p className="mt-6 text-lg leading-8 text-gray-600">
//               From student enrollment to academic results, attendance, finance,
//               communication, and reporting, EduManageERP provides a centralized
//               platform for managing your entire school ecosystem.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* ================= FEATURES ================= */}
//       <section className="bg-gray-50">
//         <div className="mx-auto max-w-7xl px-8 py-24 lg:px-12 xl:px-16">
//           <div className="text-center">
//             <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
//               Powerful Features
//             </p>

//             <h2 className="mt-4 text-4xl font-bold text-gray-900">
//               One platform. Complete control.
//             </h2>

//             <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
//               Manage every important part of your school's operations through a
//               single connected system.
//             </p>
//           </div>

//           <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {/* Feature */}
//             <div className="rounded-2xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
//                 S
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-gray-900">
//                 Student Management
//               </h3>

//               <p className="mt-3 leading-7 text-gray-600">
//                 Manage student profiles, enrollment, classes, subjects,
//                 guardians, and academic records.
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
//                 A
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-gray-900">
//                 Academic Management
//               </h3>

//               <p className="mt-3 leading-7 text-gray-600">
//                 Organize sessions, terms, classes, departments, subjects,
//                 timetables, and academic structures.
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
//                 T
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-gray-900">
//                 Teacher Management
//               </h3>

//               <p className="mt-3 leading-7 text-gray-600">
//                 Manage teacher profiles, assignments, subjects, attendance,
//                 schedules, and responsibilities.
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
//                 R
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-gray-900">
//                 Results & Examinations
//               </h3>

//               <p className="mt-3 leading-7 text-gray-600">
//                 Manage examinations, continuous assessments, grading, results,
//                 report cards, and academic performance.
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
//                 F
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-gray-900">
//                 Finance Management
//               </h3>

//               <p className="mt-3 leading-7 text-gray-600">
//                 Track school fees, payments, financial records, invoices, and
//                 financial reporting.
//               </p>
//             </div>

//             <div className="rounded-2xl border bg-white p-8 transition hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
//                 C
//               </div>

//               <h3 className="mt-6 text-xl font-bold text-gray-900">
//                 Communication
//               </h3>

//               <p className="mt-3 leading-7 text-gray-600">
//                 Connect administrators, teachers, students, and parents through
//                 centralized communication tools.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ================= CTA ================= */}
//       <section className="bg-blue-700 text-white">
//         <div className="mx-auto max-w-5xl px-8 py-24 text-center">
//           <h2 className="text-4xl font-bold md:text-5xl">
//             Ready to modernize your school?
//           </h2>

//           <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-blue-100">
//             Experience a smarter way to manage your school's academic,
//             administrative, and operational activities.
//           </p>

//           <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
//             <a
//               href="/admission"
//               className="rounded-lg bg-white px-7 py-4 font-semibold text-blue-700 transition hover:bg-gray-100"
//             >
//               Apply for Admission
//             </a>

//             <a
//               href="/login"
//               className="rounded-lg border border-white px-7 py-4 font-semibold text-white transition hover:bg-blue-600"
//             >
//               Access Portal
//             </a>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Home;

import HeroSlider from "../../components/heroslide/HeroSlider";
import HeadOfSchool from "../../components/heroslide/HeadOfSchool";
import SchoolStats from "../../components/heroslide/SchoolStats";
import SchoolNews from "../../components/heroslide/SchoolNews";

const Home = () => {
  return (
    <div>
      <HeroSlider />

      <HeadOfSchool />

      <SchoolStats />

      <SchoolNews />
    </div>
  );
};

export default Home;
