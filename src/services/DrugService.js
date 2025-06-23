import axios from 'axios';

const API_URL = 'https://localhost:8080/api/drugs';

// Add new drug
export const addDrug = async (drug, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  return await axios.post(`${API_URL}/add`, drug, config);
};

// Get drug by ID
export const getDrugById = async (id) => {
  return await axios.get(`${API_URL}/${id}`);
};

// Get all drugs
export const getAllDrugs = async () => {
  return await axios.get(API_URL);
};

// Search drugs by name
export const searchDrugsByName = async (name) => {
  return await axios.get(`${API_URL}/search?name=${name}`);
};

// Update drug
export const updateDrug = async (id, updatedDrug, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  return await axios.put(`${API_URL}/${id}`, updatedDrug, config);
};

// Delete drug
export const deleteDrug = async (id, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  return await axios.delete(`${API_URL}/${id}`, config);
};
