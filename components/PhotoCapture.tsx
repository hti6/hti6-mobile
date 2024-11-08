import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

type PhotoCaptureProps = {
    onCapture: (data: {
        photoUrl: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string;
        };
    }) => void;
};

export const usePhotoCapture = () => {
    const uploadImage = async (uri: string): Promise<string> => {
        try {
            const formData = new FormData();
            const fileExtension = uri.split('.').pop();

            formData.append('files', {
                uri: uri,
                name: `photo.${fileExtension}`,
                type: `image/${fileExtension}`,
            } as any);

            const response = await fetch('https://api.indock.ru/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке изображения');
            }

            const data = await response.json();
            return data[0];
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Не удалось загрузить изображение');
        }
    };

    const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
        try {
            const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (address) {
                return `г. ${address.city}, ${address.street} ${address.streetNumber || ''}`.trim();
            }
        } catch (error) {
            console.error('Error getting address:', error);
        }
        return null;
    };

    const getLocation = async () => {
        try {
            const providerStatus = await Location.getProviderStatusAsync();

            if (!providerStatus.locationServicesEnabled) {
                throw new Error(
                    Platform.select({
                        ios: 'Включите службы геолокации в настройках устройства',
                        android: 'Включите GPS в настройках устройства',
                        default: 'Службы геолокации недоступны'
                    })
                );
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Нужно разрешение на использование местоположения');
            }

            try {
                return await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.BestForNavigation,
                });
            } catch (error) {
                console.warn('High accuracy location failed, trying balanced', error);
                return await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });
            }
        } catch (error) {
            console.error('Location error:', error);
            throw error;
        }
    };

    const capture = async () => {
        try {
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            if (!cameraPermission.granted) {
                throw new Error('Нужно разрешение на использование камеры');
            }

            const currentLocation = await getLocation();

            const address = await getAddressFromCoordinates(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const photoUrl = await uploadImage(result.assets[0].uri);

                return {
                    photoUrl,
                    location: {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        address
                    }
                };
            }

            throw new Error('Фото не было сделано');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Ошибка', error.message);
            } else {
                Alert.alert('Ошибка', 'Произошла неизвестная ошибка');
            }
            throw error;
        }
    };

    return { capture };
};