// API configuration and utilities
// const API_BASE_URL = "https://api-gi52ugpsnq-uc.a.run.app/api/v1";
const API_BASE_URL = "http://localhost:3001/api/v1";

export const api = {
  baseURL: API_BASE_URL,

  // Endpoints
  endpoints: {
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      me: "/auth/me",
      forgotPassword: "/auth/forgot-password",
      resetPassword: "/auth/reset-password",
    },
    tours: {
      getAll: "/tours",
      getById: (id: string) => `/tours/${id}`,
      getByCountry: (countryId: string) => `/tours/country/${countryId}`,
      getFeatured: "/tours/featured",
      getPopular: "/tours/popular",
      search: "/tours/search",
      create: "/tours",
      update: "/tours/:id",
      delete: "/tours/:id",
    },
    countries: {
      getAll: "/countries",
      getById: (id: string) => `/countries/${id}`,
      getPopular: "/countries/popular",
      getByContinent: (continent: string) =>
        `/countries/continent/${continent}`,
      create: "/countries",
      update: "/countries/:id",
      delete: "/countries/:id",
    },
    bookings: {
      getAll: "/bookings",
      create: "/bookings",
      getById: (id: string) => `/bookings/${id}`,
      update: (id: string) => `/bookings/${id}`,
      cancel: (id: string) => `/bookings/${id}/cancel`,
      getByTour: (tourId: string) => `/bookings?tour=${tourId}`,
    },
    reviews: {
      getAll: "/reviews",
      create: "/reviews",
      getById: (id: string) => `/reviews/${id}`,
      update: (id: string) => `/reviews/${id}`,
      delete: "/reviews/:id",
    },
    users: {
      updateMe: "/users/update-me",
      getMyBookings: "/users/my-bookings",
      getMyReviews: "/users/my-reviews",
    },
    blogs: {
      getAll: "/blogs",
      getBySlug: (slug: string) => `/blogs/${slug}`,
      getFeatured: "/blogs/featured",
      getCategories: "/blogs/categories",
      getByCategory: (category: string) => `/blogs/category/${category}`,
      search: "/blogs/search",
      getMyBlogs: "/blogs/me/blogs",
      getMyBlog: (id: string) => `/blogs/me/blogs/${id}`,
      create: "/blogs",
      update: (id: string) => `/blogs/${id}`,
      delete: (id: string) => `/blogs/${id}`,
    },
  },
};
