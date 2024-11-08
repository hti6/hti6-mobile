import * as Location from 'expo-location';
import {Alert, Linking, Platform} from 'react-native';

class LocationService {
    private static instance: LocationService;
    private isLocationAvailable: boolean | null = null;

    private constructor() {}

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async checkLocationAvailability(): Promise<boolean> {
        if (this.isLocationAvailable !== null) {
            return this.isLocationAvailable;
        }

        try {
            const providerStatus = await Location.getProviderStatusAsync();
            this.isLocationAvailable = providerStatus.locationServicesEnabled;
            return this.isLocationAvailable;
        } catch (error) {
            console.error('Location availability check failed:', error);
            this.isLocationAvailable = false;
            return false;
        }
    }

    async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Location permission request failed:', error);
            return false;
        }
    }

    async getCurrentLocation(options: {
        showSettings?: boolean;
        highAccuracy?: boolean;
    } = {}) {
        const { showSettings = true, highAccuracy = true } = options;

        try {
            // First check if location services are available
            const isAvailable = await this.checkLocationAvailability();
            if (!isAvailable) {
                if (showSettings) {
                    Alert.alert(
                        'Местоположение недоступно',
                        'Пожалуйста, включите службы геолокации в настройках устройства.',
                        [
                            { text: 'Отмена', style: 'cancel' },
                            {
                                text: 'Открыть настройки',
                                onPress: () => Platform.OS === 'ios'
                                    ? Linking.openURL('app-settings:')
                                    : Linking.openSettings()
                            }
                        ]
                    );
                }
                throw new Error('Location services are not available');
            }

            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                throw new Error('Location permission denied');
            }

            if (highAccuracy) {
                try {
                    return await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High
                    });
                } catch (error) {
                    console.warn('High accuracy location failed, trying low accuracy');
                }
            }

            // Fallback to low accuracy if high accuracy fails or wasn't requested
            return await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced
            });

        } catch (error: any) {
            console.error('Get current location error:', error);
            throw new Error(
                error.message === 'Location permission denied'
                    ? 'Для работы приложения необходим доступ к геолокации'
                    : 'Не удалось получить местоположение'
            );
        }
    }
}

export const locationService = LocationService.getInstance();