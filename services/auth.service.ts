import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

type LoginResponse = {
    result: {
        token: string;
    },
    message: string;
};

type UserResponse = {
    result: {
        id: string;
        login: string;
        name: string;
    },
    message: string;
};

class AuthService {
    private static instance: AuthService;
    private token: string | null = null;
    private user: UserResponse["result"] | null = null;

    // Базовый URL вашего API
    private readonly API_URL = 'http://nvision.su/api/v1';

    private constructor() {}

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Получение токена через логин
    async login(login: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login, password }),
            });

            if (!response.ok) {
                throw new Error('Ошибка авторизации');
            }

            const data: LoginResponse = await response.json();
            await this.setToken(data.result.token);

            // После получения токена, загружаем данные пользователя
            await this.loadUser();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    // Загрузка данных пользователя
    private async loadUser(): Promise<void> {
        try {
            const token = await this.getToken();
            if (!token) throw new Error('Нет токена');

            const response = await fetch(`${this.API_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Ошибка получения данных пользователя');

            const userData: UserResponse = await response.json();
            await this.setUser(userData.result);
        } catch (error) {
            console.error('Load user error:', error);
            // Если не удалось загрузить пользователя, очищаем токен
            await this.logout();
            throw error;
        }
    }

    async refreshUserData(): Promise<void> {
        await this.loadUser();
    }

    async logout(): Promise<void> {
        try {
            const token = await this.getToken();
            await fetch(`${this.API_URL}/auth/logout`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
            this.token = null;
            this.user = null;
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getToken();
            if (!token) return false;

            // Если есть токен, но нет данных пользователя, пробуем их загрузить
            if (!this.user) {
                await this.loadUser();
            }

            return true;
        } catch {
            return false;
        }
    }

    private async setToken(token: string): Promise<void> {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        this.token = token;
    }

    async getToken(): Promise<string | null> {
        if (!this.token) {
            this.token = await AsyncStorage.getItem(TOKEN_KEY);
        }
        return this.token;
    }

    private async setUser(user: UserResponse["result"]): Promise<void> {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        this.user = user;
    }

    async getUser(): Promise<UserResponse["result"] | null> {
        if (!this.user) {
            const userData = await AsyncStorage.getItem(USER_KEY);
            this.user = userData ? JSON.parse(userData) : null;
        }
        return this.user;
    }
}

export const authService = AuthService.getInstance();