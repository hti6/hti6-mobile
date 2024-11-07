import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, Platform} from 'react-native';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'expo-router';
import { SolarIcon } from './SolarIcon';

export type ProfileModalProps = {
    visible: boolean;
    onClose: () => void;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose }) => {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/auth/sign-in');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>

                    <View style={styles.bottomIndicator} />

                    <View style={styles.header}>
                        <Text style={styles.title}>ПРОФИЛЬ</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <SolarIcon name="close" color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <SolarIcon name="userRounded" color="#666" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Сотрудник</Text>
                                <Text style={styles.infoValue}>
                                    {typeof user?.name === 'string' ? user.name : 'Не указано'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <SolarIcon name="briefcase" color="#666" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Должность</Text>
                                <Text style={styles.infoValue}>-</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <SolarIcon name="papers" color="#666" />
                            </View>
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Отдел</Text>
                                <Text style={styles.infoValue}>-</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <SolarIcon name="logout" color="#FF3B30" />
                        <Text style={styles.logoutText}>Выйти</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: 30,
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
        top: -15,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#595F6B0D",
        borderRadius: 11,
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
        flex: 1,
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
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E22E651A',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    logoutText: {
        color: '#E22E65',
        fontSize: 16,
        marginLeft: 8,
        fontFamily: Platform.select({
            android: 'Inter_600SemiBold',
            ios: 'Inter-SemiBold',
        }),
    },
    bottomIndicator: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20
    },
});