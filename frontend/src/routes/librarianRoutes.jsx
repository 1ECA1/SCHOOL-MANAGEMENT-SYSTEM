
import { lazy } from "react";
import ComingSoon from "../components/common/ComingSoon";

// =====================================================
// LAZY LOADED PAGES
// =====================================================

const Dashboard = lazy(
  () => import("../pages/librarian/Dashboard"),
);

const Profile = lazy(
  () => import("../pages/librarian/Profile"),
);

const AllBooks = lazy(
  () => import("../pages/librarian/AllBooks"),
);

const AddBook = lazy(
  () => import("../pages/librarian/AddBook"),
);

const BookDetails = lazy(
  () => import("../pages/librarian/BookDetails"),
);

const EditBook = lazy(
  () => import("../pages/librarian/EditBook"),
);

const AllAuthors = lazy(
  () => import("../pages/librarian/AllAuthors"),
);

const AddAuthor = lazy(
  () => import("../pages/librarian/AddAuthor"),
);

const AuthorDetails = lazy(
  () => import("../pages/librarian/AuthorDetails"),
);

const EditAuthor = lazy(
  () => import("../pages/librarian/EditAuthor"),
);

const AllCategories = lazy(
  () => import("../pages/librarian/AllCategories"),
);

const AddCategory = lazy(
  () => import("../pages/librarian/AddCategory"),
);

const CategoryDetails = lazy(
  () => import("../pages/librarian/CategoryDetails"),
);

const EditCategory = lazy(
  () => import("../pages/librarian/EditCategory"),
);

const AllTransactions = lazy(
  () => import("../pages/librarian/AllTransactions"),
);

const Returns = lazy(
  () => import("../pages/librarian/Returns"),
);

const IssueBook = lazy(() => import("../pages/librarian/IssueBook"));

// =====================================================
// NOTIFICATIONS
// =====================================================

const LibrarianNotifications = lazy(
  () => import("../pages/librarian/LibrarianNotifications"),
);

const LibrarianNotificationDetails = lazy(
  () => import("../pages/librarian/LibrarianNotificationDetails"),
);

const PersonalSettings = lazy(
  () => import("../pages/librarian/PersonalSettings"),
);

// =====================================================
// LIBRARIAN ROUTES
// =====================================================

export const librarianRoutes = [
  // ===================================================
  // DASHBOARD
  // ===================================================
  {
    path: "",
    index: true,
    label: "Dashboard",
    icon: "▦",
    element: <Dashboard />,
  },

  // ===================================================
  // BOOKS
  // ===================================================
// ===================================================
// BOOKS
// ===================================================
{
  path: "books",
  label: "Books",
  icon: "📚",
  element: <AllBooks />,
  children: [
    {
      path: "",
      label: "All Books",
    },
    {
      path: "add",
      label: "Add Book",
    },
  ],
},

{
  path: "books/add",
  element: <AddBook />,
  hideInNav: true,
},

{
  path: "books/:id",
  element: <BookDetails />,
  hideInNav: true,
},

{
  path: "books/:id/edit",
  element: <EditBook />,
  hideInNav: true,
},

  {
    path: "books/:id/edit",
    element: <ComingSoon title="Edit Book" />,
    hideInNav: true,
  },

 {
  path: "authors",
  label: "Authors",
  icon: "✍️",
  element: <AllAuthors />,
  children: [
    { path: "", label: "All Authors" },
    { path: "add", label: "Add Author" },
  ],
},
{
  path: "authors/add",
  element: <AddAuthor />,
  hideInNav: true,
},
{
  path: "authors/:id",
  element: <AuthorDetails />,
  hideInNav: true,
},
{
  path: "authors/:id/edit",
  element: <EditAuthor />,
  hideInNav: true,
},

{
  path: "categories",
  label: "Categories",
  icon: "🗂️",
  element: <AllCategories />,
  children: [
    { path: "", label: "All Categories" },
    { path: "add", label: "Add Category" },
  ],
},
{
  path: "categories/add",
  element: <AddCategory />,
  hideInNav: true,
},
{
  path: "categories/:id",
  element: <CategoryDetails />,
  hideInNav: true,
},
{
  path: "categories/:id/edit",
  element: <EditCategory />,
  hideInNav: true,
},




  // ===================================================
  // BORROWING & RETURNS
  // ===================================================
// ===================================================
// BORROWING & RETURNS
// ===================================================

{
  path: "borrowing",
  label: "Borrowing & Returns",
  icon: "🔄",
  element: <AllTransactions />,
  children: [
    {
      path: "",
      label: "All Transactions",
    },
    {
      path: "issue",
      label: "Issue Book",
    },
    {
      path: "returns",
      label: "Returns",
    },
  ],
},

{
  path: "borrowing/issue",
  element: <IssueBook />,
  hideInNav: true,
},

{
  path: "borrowing/returns",
  element: <Returns />,
  hideInNav: true,
},
 


 

  // ===================================================
  // MY PROFILE
  // ===================================================
  {
    path: "profile",
    label: "My Profile",
    icon: "👤",
    element: <Profile />,
  },

  // ===================================================
// NOTIFICATIONS
// ===================================================

{
  path: "notifications",
  label: "Notifications",
  icon: "🔔",
  element: <LibrarianNotifications />,
},


{
  path: "notifications/:id",
  element: <LibrarianNotificationDetails />,
  hideInNav: true,
},

  // ===================================================
  // SETTINGS
  // ===================================================
  {
  path: "settings",
  label: "Settings",
  icon: "⚙",
  element: <PersonalSettings />,
  bottom: true,
},
];
