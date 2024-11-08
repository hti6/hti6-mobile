import React, {useCallback, useState} from 'react';
import { Stack } from 'expo-router';
import {View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform} from 'react-native';
import { SolarIcon } from '@/components/SolarIcon';
import { ProfileModal } from '@/components/ProfileModal';
import { useAuth } from '@/contexts/auth.context';
import {damageService} from "@/services/damage.service";
import {DamageRequestModal} from "@/components/DamageRequestModal";
import {usePhotoCapture} from "@/components/PhotoCapture";

export default function AppLayout() {
    const [isProfileVisible, setIsProfileVisible] = useState(false);
    const { user } = useAuth();
    const { capture } = usePhotoCapture();
    const [showModal, setShowModal] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<{
        photoUrl: string;
        location: {
            latitude: number;
            longitude: number;
            address?: string;
        };
    } | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleAddRequest = useCallback(async () => {
        if (isCapturing) return;

        try {
            setIsCapturing(true);
            const result = await capture();

            setCurrentRequest(result);
            setShowModal(true);
        } catch (error) {
            console.error('Capture error:', error);
        } finally {
            setIsCapturing(false);
        }
    }, [isCapturing]);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setCurrentRequest(null);
    }, []);

    const handleSubmitRequest = useCallback(async () => {
        if (!currentRequest) return;

        try {
            await damageService.createDamageRequest({
                longitude: currentRequest.location.longitude,
                latitude: currentRequest.location.latitude,
                photo_url: currentRequest.photoUrl,
            });

            handleCloseModal();

            Alert.alert('Успех', 'Данные успешно отправлены');
            // setRequests([...requests, newRequest]);
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Ошибка', 'Не удалось отправить заявку');
        }
    }, [currentRequest]);

    const CustomHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => setIsProfileVisible(true)}
            >
                <View style={styles.iconView}>
                    <SolarIcon name="userRoundedGray" size={24} color="#000" />
                </View>
                <View style={styles.userTexts}>
                    <Text style={styles.userName}>{user?.name || 'Неизвестный'}</Text>
                    <Text style={styles.userRole}>Сотрудник</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddRequest} style={styles.addButton}>
                {isCapturing ? <ActivityIndicator size={"small"} color={"#fff"} /> : <SolarIcon name="add" size={24} color="#fff" />}
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <Stack
                screenOptions={{
                    header: () => <CustomHeader />,
                    contentStyle: {
                        backgroundColor: '#f5f5f5',
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Главная',
                    }}
                />
            </Stack>

            <ProfileModal
                visible={isProfileVisible}
                onClose={() => setIsProfileVisible(false)}
            />
            {currentRequest && (
                <DamageRequestModal
                    visible={showModal}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitRequest}
                    location={currentRequest.location}
                    userName={user?.name || 'ЕГОРОВ НИКИТА'}
                    isSending={false}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    iconView: {
        backgroundColor: "#F7F7F8",
        borderRadius: 12,
        padding: 8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 54, // Для отступа под статусбаром
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userTexts: {
        marginLeft: 8,
    },
    userName: {
        fontSize: 16,
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
        color: '#000',
    },
    userRole: {
        fontSize: 14,
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
        color: '#6B7280',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 11,
        backgroundColor: '#E22E65',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
});