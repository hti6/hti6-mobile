import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image, Platform} from 'react-native';
import { SolarIcon } from './SolarIcon';
import { useAssets } from "expo-asset";

const checkmarkIcon = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none">
  <circle cx="60" cy="60" r="55" fill="#FDE8EA" stroke="#E4405C" stroke-width="2" stroke-dasharray="4 4"/>
  <path d="M40 60L55 75L80 45" stroke="#E4405C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

type DamageRequestModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => Promise<void>;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    } | null;
    userName: string;
    isSending: boolean;
};

export const CheckMarkImage = () => {
    const [assets, error] = useAssets([
        require('../assets/images/Image.png'),
    ]);

    // @ts-ignore
    return assets ? <Image style={styles.imageStyle} source={assets[0]} /> : null
}


export const DamageRequestModal = ({
                                       visible,
                                       onClose,
                                       onSubmit,
                                       location,
                                       userName,
                                       isSending,
                                   }: DamageRequestModalProps) => {
    const currentDate = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).replace(',', '');

    if (visible)
    return (
        <Modal
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.bottomIndicator} />
                    {/* Заголовок */}
                    <View style={styles.header}>
                        <Text style={styles.title}>ЗАЯВКА</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <SolarIcon name="close" color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Иконка чекмарка */}
                    <View style={styles.iconContainer}>
                        <CheckMarkImage />
                    </View>

                    {/* Информация о заявке */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <SolarIcon name="userRounded" color="#666" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Сотрудник</Text>
                                <Text style={styles.infoValue}>{userName}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <SolarIcon name="calendar" color="#666" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Дата заявки</Text>
                                <Text style={styles.infoValue}>{currentDate}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <SolarIcon name="mapPoint" color="#666" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Местоположение</Text>
                                <Text style={styles.infoValue}>
                                    { `${location?.latitude?.toFixed(6)}, ${location?.longitude?.toFixed(6)}`}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Кнопка отправки */}
                    <TouchableOpacity
                        style={[styles.submitButton, isSending && styles.submitButtonDisabled]}
                        onPress={onSubmit}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Отправить</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    ); else null
};

const styles = StyleSheet.create({
    imageStyle: {
        width: 140,
        height: 140
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    title: {
        fontSize: 32,
        color: '#000',
        fontFamily: Platform.select({
            android: 'Oswald_700Bold',
            ios: 'Oswald-Bold',
        }),
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#595F6B0D",
        borderRadius: 11,
    },
    iconContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    infoSection: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F8',
        padding: 16,
        borderRadius: 24,
        marginBottom: 4,
    },
    infoIcon: {
        backgroundColor: "#FFFFFF",
        borderRadius: 39,
        width: 48,
        height: 48,
        justifyContent: "center",
        alignItems: "center"
    },
    infoTextContainer: {
        marginLeft: 15,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontFamily: Platform.select({
            android: 'Inter_500Medium',
            ios: 'Inter-Medium',
        }),
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
    },
    submitButton: {
        backgroundColor: '#E4405C',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitButtonDisabled: {
        backgroundColor: '#ffa5b5',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Oswald-SemiBold',
    },
    bottomIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 7
    },
});