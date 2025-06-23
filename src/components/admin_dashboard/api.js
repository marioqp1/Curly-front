import axios from 'axios';

export const BASE_URL = 'http://localhost:8080';

// Endpoints for different entities
export const ACTIVE_INGREDIENTS_URL = `${BASE_URL}/api/activeIngredient`;
export const CATEGORIES_URL = `${BASE_URL}/api/category`;
export const DRUGS_URL = `${BASE_URL}/api/drugs`;

// const getAuthHeaders = () => {
//     const token = localStorage.getItem('token'); // Ensure token is fetched from local storage
//     return { headers: { token } }; // Simplify to just `token`
//   };
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Ensure token is fetched from local storage
    const headers = { headers: { token } }; // Use the key 'token' as the header name
    console.log('Headers:', headers); // Log headers to verify the token
    return headers;
  };
  
// Active Ingredients
export const getActiveIngredients = () => axios.get(ACTIVE_INGREDIENTS_URL, getAuthHeaders());
export const getActiveIngredientById = (id) => axios.get(`${ACTIVE_INGREDIENTS_URL}/${id}`, getAuthHeaders());
export const createActiveIngredient = (data) => axios.post(ACTIVE_INGREDIENTS_URL, data, getAuthHeaders());
export const updateActiveIngredient = (id, data) => axios.put(`${ACTIVE_INGREDIENTS_URL}/${id}`, data, getAuthHeaders());
export const deleteActiveIngredient = (id) => axios.delete(`${ACTIVE_INGREDIENTS_URL}/${id}`, getAuthHeaders());

// Categories
export const getCategories = () => axios.get(CATEGORIES_URL, getAuthHeaders());
export const getCategoryById = (id) => axios.get(`${CATEGORIES_URL}/${id}`, getAuthHeaders());
export const createCategory = (data) => axios.post(CATEGORIES_URL, data, getAuthHeaders());
export const updateCategory = (id, data) => axios.put(`${CATEGORIES_URL}/${id}`, data, getAuthHeaders());
export const deleteCategory = (id) => axios.delete(`${CATEGORIES_URL}/${id}`, getAuthHeaders());

// Drugs
export const getDrugs = () => axios.get(DRUGS_URL);
export const getDrugById = (id) => axios.get(`${DRUGS_URL}/${id}`);
export const createDrug = (data) => axios.post(`${DRUGS_URL}/add`, data, getAuthHeaders());
export const updateDrug = (id, data) => axios.put(`${DRUGS_URL}/${id}`, data, getAuthHeaders());
export const deleteDrug = (id) => axios.delete(`${DRUGS_URL}/${id}`, getAuthHeaders());

export const getOrderHistory = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:8080/api/logHistory/${userId}`, {
      headers: {
        'token': token
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};
