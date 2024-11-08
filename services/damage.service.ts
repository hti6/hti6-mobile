import { authService } from './auth.service';

type DamageRequest = {
    longitude: number;
    latitude: number;
    photo_url: string;
};

interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

class DamageService {
    private readonly API_URL = 'http://nvision.su/api/v1';
    private readonly REQUEST_TIMEOUT = 30000;

    private async handleResponse(response: Response) {
        if (!response.ok) {
            let errorData: ApiError;
            try {
                errorData = await response.json();
            } catch {
                errorData = {
                    message: 'Произошла неизвестная ошибка',
                    status: response.status
                };
            }

            switch (response.status) {
                case 401:
                    await authService.logout();
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова');
                case 403:
                    throw new Error('Нет доступа к данному ресурсу');
                case 404:
                    throw new Error('Ресурс не найден');
                case 422:
                    throw new Error(errorData.message || 'Неверные данные запроса');
                case 429:
                    throw new Error('Слишком много запросов. Пожалуйста, подождите');
                case 500:
                case 502:
                case 503:
                    throw new Error('Сервис временно недоступен. Попробуйте позже');
                default:
                    throw new Error(errorData.message || 'Произошла ошибка при выполнении запроса');
            }
        }
        return response.json();
    }

    private async makeRequest(endpoint: string, options: RequestInit) {
        const token = await authService.getToken();
        if (!token) {
            throw new Error('Не авторизован');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

        try {
            const response = await fetch(`${this.API_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
                signal: controller.signal,
            });

            return await this.handleResponse(response);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Превышено время ожидания запроса');
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async createDamageRequest(data: DamageRequest) {
        try {
            return await this.makeRequest('/user/damage_requests', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Create damage request error:', error);
            throw error;
        }
    }

    async indexDamageRequest() {
        try {
            return await this.makeRequest('/user/damage_requests', {
                method: 'GET',
            });
        } catch (error) {
            console.error('Index damage request error:', error);
            throw error;
        }
    }
}

export const damageService = new DamageService();