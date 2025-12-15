import axios from "axios";

interface LoginResponse {
    username: string;
    message: string;
}

export const loginAction = async (email: string, password: string): Promise<LoginResponse | null> => {
    const credentials = btoa(`${email}:${password}`);
    const authHeader = `Basic ${credentials}`;
    try {
        const response = await axios.post<LoginResponse>('http://localhost:5146/login', {
            email,
            password
        }, {
            headers: {
                Authorization: authHeader,
                ContentType: 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return null;
    }
}

export function getCredentials(): string | null {
    return sessionStorage.getItem('credentials');
}

export function getAuthHeader(): string | null {
    const credentials = getCredentials();
    return credentials ? `Basic ${credentials}` : null;
}