import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerTiposContrato = async () => {
	const response = await axios.get(`${API_URL}/tipos-contrato`);
	// Aceptamos que el backend devuelva directamente un arreglo o un objeto { tiposContrato: [...] }
	if (Array.isArray(response.data)) {
		return { tiposContrato: response.data };
	}
	return response.data;
};

const crearTipoContrato = async (payload) => {
	const response = await axios.post(`${API_URL}/tipos-contrato`, payload);
	return response.data;
};

const actualizarTipoContrato = async (id, payload) => {
	const response = await axios.put(`${API_URL}/tipos-contrato/${id}`, payload);
	return response.data;
};

export { obtenerTiposContrato, crearTipoContrato, actualizarTipoContrato };
