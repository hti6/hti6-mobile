import React, { useState } from 'react';
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
            // Проверяем доступность сервисов геолокации
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

            // Запрашиваем разрешения на геолокацию
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Нужно разрешение на использование местоположения');
            }

            // Пробуем получить локацию с высокой точностью
            try {
                return await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                    timeout: 15000 // 15 секунд таймаут
                });
            } catch (error) {
                // Если не удалось получить точную локацию, пробуем с низкой точностью
                console.warn('High accuracy location failed, trying balanced', error);
                return await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    timeout: 15000
                });
            }
        } catch (error) {
            console.error('Location error:', error);
            throw error;
        }
    };

    const capture = async () => {
        try {
            // Запрашиваем разрешения на камеру
            const cameraPermission = await Camera.requestCameraPermissionsAsync();
            if (!cameraPermission.granted) {
                throw new Error('Нужно разрешение на использование камеры');
            }

            // Получаем локацию
            const currentLocation = await getLocation();

            // Получаем адрес
            const address = await getAddressFromCoordinates(
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );

            // Открываем камеру для фото
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                // Загружаем фото на сервер
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