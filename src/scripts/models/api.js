import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
};

// Auth APIs
export async function register(name, email, password) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mendaftar');
    }

    return data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

export async function login(email, password) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal login');
    }

    if (data.loginResult && data.loginResult.token) {
      localStorage.setItem('token', data.loginResult.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.loginResult.userId,
        name: data.loginResult.name,
        email: email,
        isLoggedIn: true,
      }));
    }

    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

// Story APIs
export async function getStories(page = 1, size = 10, location = 0) {
  try {
    const token = getToken();
    const url = new URL(ENDPOINTS.STORIES);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', location);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil cerita');
    }

    return data.listStory || [];
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

export async function getStoryDetail(id) {
  try {
    const token = getToken();
    const url = `${ENDPOINTS.STORIES}/${id}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil detail cerita');
    }

    return data.story;
  } catch (error) {
    console.error('Error fetching story detail:', error);
    throw error;
  }
}

export async function addStory(description, photo, lat = null, lon = null) {
  try {
    const token = getToken();

    if (!token) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);

    if (lat !== null) {
      formData.append('lat', lat);
    }
    if (lon !== null) {
      formData.append('lon', lon);
    }

    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menambahkan cerita');
    }

    return data;
  } catch (error) {
    console.error('Error adding story:', error);
    throw error;
  }
}

export async function addStoryGuest(description, photo, lat = null, lon = null) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);

    if (lat !== null) {
      formData.append('lat', lat);
    }
    if (lon !== null) {
      formData.append('lon', lon);
    }

    const response = await fetch(ENDPOINTS.STORIES_GUEST, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal menambahkan cerita');
    }

    return data;
  } catch (error) {
    console.error('Error adding story as guest:', error);
    throw error;
  }
}