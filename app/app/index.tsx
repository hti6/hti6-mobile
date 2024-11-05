import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/auth.context';
import { SolarIcon } from '@/components/SolarIcon';
import {useAssets} from "expo-asset";
import {damageService} from "@/services/damage.service";
import {useDamageRequests} from "@/hooks/useDamageRequests";

// Типы для заявок
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Request = {
    id: string;
    priority: Priority;
    coordinates: string;
    date: string;
};

const EmptyStateImage = () => {
    const [assets, error] = useAssets([
        require('@/assets/images/EmptyState.png'),
    ]);

    return assets ? <Image style={styles.emptyImage} source={assets[0]} /> : null;
}

const RequestCard = ({ request }: { request: Request }) => {
    const getPriorityData = (priority: Priority) => {
        switch (priority) {
            case 'low':
                return { icon: 'star', text: 'Низкая', color: '#595F6B', backgroundColor: '#595F6B0D' };
            case 'medium':
                return { icon: 'bolt', text: 'Средняя', color: '#CE7B00', backgroundColor: '#F291001A'  };
            case 'high':
                return { icon: 'fire', text: 'Высокая', color: '#FA5300', backgroundColor: '#FA53001A'  };
            case 'critical':
                return { icon: 'warning', text: 'Критичная', color: '#D91528', backgroundColor: '#D915281A'  };
        }
    };

    const priorityData = getPriorityData(request.priority);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.priorityContainer}>
                    <View style={[styles.cardIcon, {backgroundColor: priorityData.backgroundColor}]}>
                        <SolarIcon name={priorityData.icon} size={16} color={priorityData.color} />
                    </View>
                    <View style={[styles.cardText, { backgroundColor: priorityData.backgroundColor }]}>
                        <Text style={[styles.priorityText, { color: priorityData.color }]}>
                            {priorityData.text}
                        </Text>
                    </View>
                </View>
                <Text style={styles.dateText}>{request.date}</Text>
            </View>

            <Text style={styles.idText}>{request.id}</Text>
            <Text style={styles.coordinatesText}>{request.coordinates}</Text>
        </View>
    );
};

// Компонент пустого состояния
const EmptyState = ({ error }: { error?: Error | null }) => (
    <View style={styles.emptyContainer}>
        <EmptyStateImage />
        <Text style={styles.emptyTitle}>
            {error ? 'ПРОИЗОШЛА ОШИБКА' : 'У ВАС ПОКА НЕТ ЗАЯВОК'}
        </Text>
        <Text style={styles.emptySubtitle}>
            {error ? error.message : 'Для создания заявки нажмите на кнопку "+"'}
        </Text>
    </View>
);

export default function HomeScreen() {
    const { requests, loading, error, refetch } = useDamageRequests();

    if (loading && requests.length === 0) {
        return (
            <SafeAreaView style={[styles.container]}>
                <ActivityIndicator size="large" color="#E4405C" />
            </SafeAreaView>
        );
    }

    console.log(requests);

    return (
        <SafeAreaView style={styles.container}>
            {/* Контент */}
            {requests.length > 0 ? (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refetch}
                            colors={['#E4405C']}
                            tintColor="#E4405C"
                        />
                    }
                >
                    {requests.map((request, index) => (
                        <RequestCard key={index} request={request} />
                    ))}
                </ScrollView>
            ) : (
                <EmptyState error={error} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userTexts: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontFamily: 'Oswald-Medium',
        color: '#000',
    },
    userRole: {
        fontSize: 14,
        fontFamily: 'Oswald-Regular',
        color: '#6B7280',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E4405C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    // Стили для карточки
    cardIcon: {
        width: 24,
        height: 24,
        borderRadius: 7,
        justifyContent: "center",
        alignItems: "center"
    },
    cardText: {
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        marginBottom: 8
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    priorityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    priorityText: {
        fontSize: 14,
        fontFamily: Platform.select({
            android: 'Inter_600SemiBold',
            ios: 'Inter-SemiBold',
        }),
    },
    dateText: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
    },
    idText: {
        fontSize: 22,
        color: '#000',
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
        marginBottom: 10,
    },
    coordinatesText: {
        fontSize: 14,
        color: '#121315',
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
    },
    // Стили для пустого состояния
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: "#fff",
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        marginTop: 8
    },
    emptyImage: {
        width: 140,
        height: 140,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
        color: '#000',
        marginBottom: 8,
    },
});