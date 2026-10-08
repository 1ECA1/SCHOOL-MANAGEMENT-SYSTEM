
import api from "./api";

// =====================================================
// AUTHORS
// =====================================================

export const getAuthors = async () => {
  const { data } = await api.get("/library/authors/");
  return data;
};

export const getAuthor = async (id) => {
  const { data } = await api.get(`/library/authors/${id}/`);
  return data;
};

export const createAuthor = async (authorData) => {
  const { data } = await api.post(
    "/library/authors/",
    authorData,
  );

  return data;
};

export const updateAuthor = async (id, authorData) => {
  const { data } = await api.patch(
    `/library/authors/${id}/`,
    authorData,
  );

  return data;
};

export const deleteAuthor = async (id) => {
  await api.delete(`/library/authors/${id}/`);
};

// =====================================================
// CATEGORIES
// =====================================================

export const getCategories = async () => {
  const { data } = await api.get("/library/categories/");
  return data;
};

export const getCategory = async (id) => {
  const { data } = await api.get(
    `/library/categories/${id}/`,
  );

  return data;
};

export const createCategory = async (categoryData) => {
  const { data } = await api.post(
    "/library/categories/",
    categoryData,
  );

  return data;
};

export const updateCategory = async (id, categoryData) => {
  const { data } = await api.patch(
    `/library/categories/${id}/`,
    categoryData,
  );

  return data;
};

export const deleteCategory = async (id) => {
  await api.delete(`/library/categories/${id}/`);
};

// =====================================================
// BOOKS
// =====================================================

export const getBooks = async () => {
  const { data } = await api.get("/library/books/");
  return data;
};

export const getBook = async (id) => {
  const { data } = await api.get(
    `/library/books/${id}/`,
  );

  return data;
};

export const createBook = async (bookData) => {
  const { data } = await api.post(
    "/library/books/",
    bookData,
  );

  return data;
};

export const updateBook = async (id, bookData) => {
  const { data } = await api.patch(
    `/library/books/${id}/`,
    bookData,
  );

  return data;
};

export const deleteBook = async (id) => {
  await api.delete(`/library/books/${id}/`);
};

// =====================================================
// BOOK LOANS
// =====================================================

export const getLoans = async () => {
  const { data } = await api.get("/library/loans/");
  return data;
};

export const getLoan = async (id) => {
  const { data } = await api.get(
    `/library/loans/${id}/`,
  );

  return data;
};

export const createLoan = async (loanData) => {
  const { data } = await api.post(
    "/library/loans/",
    loanData,
  );

  return data;
};

export const updateLoan = async (id, loanData) => {
  const { data } = await api.patch(
    `/library/loans/${id}/`,
    loanData,
  );

  return data;
};

export const deleteLoan = async (id) => {
  await api.delete(`/library/loans/${id}/`);
};

