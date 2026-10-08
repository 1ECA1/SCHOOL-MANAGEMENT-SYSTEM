// import api from "./api";

// /**
//  * Get invoices available to the currently logged-in user.
//  *
//  * For students, the backend automatically returns
//  * only their own invoices.
//  */
// export const getStudentInvoices = async () => {
//   const response = await api.get("/finance/invoices/");
//   return response.data;
// };

// export const getStudentPayments = async () => {
//   const response = await api.get("/finance/payments/");
//   return response.data;
// };

// export const getStudentPaymentReceipt = async (paymentId) => {
//   const response = await api.get(
//     `/finance/payments/${paymentId}/receipt/`
//   );

//   return response.data;
// };

// /**
//  * Initiate an online payment.
//  *
//  * The backend determines whether the logged-in user
//  * is the student or a parent of the student.
//  */
// export const initiateStudentPayment = async ({
//   invoice,
//   amount,
//   gateway = "PAYSTACK",
// }) => {
//   const response = await api.post(
//     "/finance/payments/initiate/",
//     {
//       invoice,
//       amount,
//       gateway,
//     }
//   );

//   return response.data;
// };

// /**
//  * Verify a Paystack transaction after returning
//  * from the Paystack checkout page.
//  */
// export const verifyPaystackPayment = async (reference) => {
//   const response = await api.get(
//     `/finance/payments/paystack/verify/${reference}/`
//   );

//   return response.data;
// };




import api from "./api";

/**
 * ============================================================
 * STUDENT FINANCE
 * ============================================================
 */

export const getStudentInvoices = async () => {
  const response = await api.get("/finance/invoices/");
  return response.data;
};

export const getStudentPayments = async () => {
  const response = await api.get("/finance/payments/");
  return response.data;
};

export const getStudentPaymentReceipt = async (paymentId) => {
  const response = await api.get(
    `/finance/payments/${paymentId}/receipt/`
  );

  return response.data;
};

export const initiateStudentPayment = async ({
  invoice,
  amount,
  gateway = "PAYSTACK",
}) => {
  const response = await api.post(
    "/finance/payments/initiate/",
    {
      invoice,
      amount,
      gateway,
    }
  );

  return response.data;
};

export const verifyPaystackPayment = async (reference) => {
  const response = await api.get(
    `/finance/payments/paystack/verify/${reference}/`
  );

  return response.data;
};


/**
 * ============================================================
 * FEE CATEGORIES
 * ============================================================
 */

/**
 * params example:
 * {
 *   school: 1
 * }
 *
 * This is mainly used by Super Admin to filter
 * fee categories by school.
 */
export const getFeeCategories = async (params = {}) => {
  const { data } = await api.get(
    "/finance/fee-categories/",
    {
      params,
    }
  );

  return data;
};

export const createFeeCategory = async (categoryData) => {
  const { data } = await api.post(
    "/finance/fee-categories/",
    categoryData
  );

  return data;
};

export const updateFeeCategory = async (id, categoryData) => {
  const { data } = await api.put(
    `/finance/fee-categories/${id}/`,
    categoryData
  );

  return data;
};

export const deleteFeeCategory = async (id) => {
  const { data } = await api.delete(
    `/finance/fee-categories/${id}/`
  );

  return data;
};


/**
 * ============================================================
 * FEE STRUCTURES
 * ============================================================
 */

/**
 * params example:
 * {
 *   school: 1
 * }
 *
 * This is mainly used by Super Admin to filter
 * fee structures by school.
 */
export const getFeeStructures = async (params = {}) => {
  const { data } = await api.get(
    "/finance/fee-structures/",
    {
      params,
    }
  );

  return data;
};

export const createFeeStructure = async (structureData) => {
  const { data } = await api.post(
    "/finance/fee-structures/",
    structureData
  );

  return data;
};

export const updateFeeStructure = async (id, structureData) => {
  const { data } = await api.put(
    `/finance/fee-structures/${id}/`,
    structureData
  );

  return data;
};

export const deleteFeeStructure = async (id) => {
  const { data } = await api.delete(
    `/finance/fee-structures/${id}/`
  );

  return data;
};


/**
 * ============================================================
 * INVOICES
 * ============================================================
 */

export const getInvoices = async (params = {}) => {
  const { data } = await api.get(
    "/finance/invoices/",
    {
      params,
    }
  );

  return data;
};

export const getInvoice = async (id) => {
  const { data } = await api.get(
    `/finance/invoices/${id}/`
  );

  return data;
};

export const createInvoice = async (invoiceData) => {
  const { data } = await api.post(
    "/finance/invoices/",
    invoiceData
  );

  return data;
};

export const updateInvoice = async (id, invoiceData) => {
  const { data } = await api.put(
    `/finance/invoices/${id}/`,
    invoiceData
  );

  return data;
};

export const deleteInvoice = async (id) => {
  const { data } = await api.delete(
    `/finance/invoices/${id}/`
  );

  return data;
};


/**
 * ============================================================
 * FINANCE SUMMARY
 * ============================================================
 */

export const getFinanceSummary = async (params = {}) => {
  const { data } = await api.get(
    "/finance/summary/",
    {
      params,
    }
  );

  return data;
};


/**
 * ============================================================
 * GENERATE INVOICES
 * ============================================================
 */

export const generateInvoices = async (invoiceData) => {
  const { data } = await api.post(
    "/finance/generate-invoices/",
    invoiceData
  );

  return data;
};


/**
 * ============================================================
 * PAYMENTS
 * ============================================================
 */

export const getPayments = async (params = {}) => {
  const { data } = await api.get(
    "/finance/payments/",
    {
      params,
    }
  );

  return data;
};

export const createPayment = async (paymentData) => {
  const { data } = await api.post(
    "/finance/payments/",
    paymentData
  );

  return data;
};

export const getPayment = async (id) => {
  const { data } = await api.get(
    `/finance/payments/${id}/`
  );

  return data;
};

export const updatePayment = async (id, paymentData) => {
  const { data } = await api.put(
    `/finance/payments/${id}/`,
    paymentData
  );

  return data;
};

export const deletePayment = async (id) => {
  const { data } = await api.delete(
    `/finance/payments/${id}/`
  );

  return data;
};


/**
 * ============================================================
 * SCHOLARSHIPS
 * ============================================================
 */

export const getScholarships = async (params = {}) => {
  const { data } = await api.get(
    "/finance/scholarships/",
    {
      params,
    }
  );

  return data;
};

export const createScholarship = async (scholarshipData) => {
  const { data } = await api.post(
    "/finance/scholarships/",
    scholarshipData
  );

  return data;
};

export const updateScholarship = async (
  id,
  scholarshipData
) => {
  const { data } = await api.put(
    `/finance/scholarships/${id}/`,
    scholarshipData
  );

  return data;
};

export const deleteScholarship = async (id) => {
  const { data } = await api.delete(
    `/finance/scholarships/${id}/`
  );

  return data;
};

export const applyScholarship = async (id) => {
  const { data } = await api.post(
    `/finance/scholarships/${id}/apply/`
  );

  return data;
};


/**
 * ============================================================
 * STUDENT FINANCIAL STATEMENT
 * ============================================================
 */

export const getStudentFinancialStatement = async (
  studentId,
  params = {}
) => {
  const { data } = await api.get(
    `/finance/students/${studentId}/statement/`,
    {
      params,
    }
  );

  return data;
};


/**
 * ============================================================
 * EXPENSE CATEGORIES
 * ============================================================
 */

export const getExpenseCategories = async (params = {}) => {
  const { data } = await api.get(
    "/finance/expense-categories/",
    {
      params,
    }
  );

  return data;
};

export const createExpenseCategory = async (categoryData) => {
  const { data } = await api.post(
    "/finance/expense-categories/",
    categoryData
  );

  return data;
};

export const updateExpenseCategory = async (
  id,
  categoryData
) => {
  const { data } = await api.put(
    `/finance/expense-categories/${id}/`,
    categoryData
  );

  return data;
};

export const deleteExpenseCategory = async (id) => {
  const { data } = await api.delete(
    `/finance/expense-categories/${id}/`
  );

  return data;
};


/**
 * ============================================================
 * EXPENSES
 * ============================================================
 */

export const getExpenses = async (params = {}) => {
  const { data } = await api.get(
    "/finance/expenses/",
    {
      params,
    }
  );

  return data;
};

export const createExpense = async (expenseData) => {
  const { data } = await api.post(
    "/finance/expenses/",
    expenseData
  );

  return data;
};

export const getExpense = async (id) => {
  const { data } = await api.get(
    `/finance/expenses/${id}/`
  );

  return data;
};

export const updateExpense = async (id, expenseData) => {
  const { data } = await api.put(
    `/finance/expenses/${id}/`,
    expenseData
  );

  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(
    `/finance/expenses/${id}/`
  );

  return data;
};

export const getExpenseSummary = async (params = {}) => {
  const { data } = await api.get(
    "/finance/expenses/summary/",
    {
      params,
    }
  );

  return data;
};


/**
 * ============================================================
 * FINANCE DASHBOARD
 * ============================================================
 */

export const getFinanceDashboard = async (params = {}) => {
  const { data } = await api.get(
    "/finance/dashboard/",
    {
      params,
    }
  );

  return data;
};


/**
 * ============================================================
 * FINANCE REPORTS
 * ============================================================
 */

export const getFinancialSummaryReport = async (params = {}) => {
  const { data } = await api.get(
    "/finance/reports/financial-summary/",
    {
      params,
    }
  );

  return data;
};

export const getIncomeReport = async (params = {}) => {
  const { data } = await api.get(
    "/finance/reports/income/",
    {
      params,
    }
  );

  return data;
};

export const getExpenseReport = async (params = {}) => {
  const { data } = await api.get(
    "/finance/reports/expenses/",
    {
      params,
    }
  );

  return data;
};

export const getStudentFinancialReport = async (params = {}) => {
  const { data } = await api.get(
    "/finance/reports/students/",
    {
      params,
    }
  );

  return data;
};

