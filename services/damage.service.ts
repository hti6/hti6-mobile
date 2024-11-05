import { authService } from './auth.service';

type DamageRequest = {
    longitude: number;
    latitude: number;
    photo_url: string;
};

class DamageService {
    private readonly API_URL = 'http://nvision.su/api/v1';

    async createDamageRequest(data: DamageRequest): Promise<any> {
        const token = await authService.getToken();

        if (!token) {
            throw new Error('Не авторизован');
        }

        const response = await fetch(`${this.API_URL}/user/damage_requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ошибка при отправке заявки');
        }

        return response.json();
    }

    async indexDamageRequest(): Promise<any> {
        const token = await authService.getToken();

        if (!token) {
            throw new Error('Не авторизован');
        }
        console.log(token)
        const response = await fetch(`${this.API_URL}/user/damage_requests`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ошибка при загрузке заявок');
        }

        return response.json();
    }
}

export const damageService = new DamageService();