const BASE_URL = 'http://localhost:3000/api';

async function checkResponse(res) {
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
        const msg = payload?.mensaje || payload?.error || 'Error en la petición';
        const err = new Error(msg);
        err.response = { status: res.status, data: payload };
        throw err;
    }
    return payload;
}

const obtenerEstructura = async () => {
    const res = await fetch(`${BASE_URL}/lugares/estructura`);
    return checkResponse(res);
};

const obtenerLugares = async () => {
    const res = await fetch(`${BASE_URL}/lugares`);
    return checkResponse(res);
};

const crearLugar = async (lugar) => {
    const res = await fetch(`${BASE_URL}/lugares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lugar)
    });
    return checkResponse(res);
};

const actualizarLugar = async (id, lugar) => {
    const res = await fetch(`${BASE_URL}/lugares/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lugar)
    });
    return checkResponse(res);
};

const eliminarLugar = async (id) => {
    const res = await fetch(`${BASE_URL}/lugares/${id}`, { method: 'DELETE' });
    return checkResponse(res);
};

// Edificios
const crearEdificio = async (edificio) => {
    const res = await fetch(`${BASE_URL}/edificios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edificio)
    });
    return checkResponse(res);
};

const actualizarEdificio = async (id, edificio) => {
    const res = await fetch(`${BASE_URL}/edificios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edificio)
    });
    return checkResponse(res);
};

const eliminarEdificio = async (id) => {
    const res = await fetch(`${BASE_URL}/edificios/${id}`, { method: 'DELETE' });
    return checkResponse(res);
};

// Salones
const crearSalon = async (salon) => {
    const res = await fetch(`${BASE_URL}/salones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon)
    });
    return checkResponse(res);
};

const actualizarSalon = async (id, salon) => {
    const res = await fetch(`${BASE_URL}/salones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salon)
    });
    return checkResponse(res);
};

const eliminarSalon = async (id) => {
    const res = await fetch(`${BASE_URL}/salones/${id}`, { method: 'DELETE' });
    return checkResponse(res);
};

export {
  obtenerEstructura,
  obtenerLugares,
  crearLugar,
  actualizarLugar,
  eliminarLugar,
  crearEdificio,
  actualizarEdificio,
  eliminarEdificio,
  crearSalon,
  actualizarSalon,
  eliminarSalon,
};