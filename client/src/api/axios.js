import axios from 'axios'

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isLocal ? 'http://localhost:5000/api' : 'https://taskflow-98es.onrender.com/api';

const API = axios.create({
  baseURL
})

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token')
  if (token) req.headers.Authorization = `Bearer ${token}`
  return req
})

export default API
