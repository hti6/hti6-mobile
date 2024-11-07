import React, { useCallback, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Image,
    Platform,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    type ImageStyle,
    type ViewStyle,
    type TextStyle,
} from 'react-native';
import { useAssets } from "expo-asset";
import { useDamageRequests } from "@/hooks/useDamageRequests";
import { SolarIcon } from '@/components/SolarIcon';

// Типизация
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface Request {
    id: string;
    priority: Priority;
    coordinates: string;
    date: string;
}

interface PriorityData {
    icon: string;
    text: string;
    color: string;
    backgroundColor: string;
}

interface RequestCardProps {
    request: Request;
}

interface EmptyStateProps {
    error?: Error | null;
}

// Константы
const SCREEN_HEIGHT = Dimensions.get('window').height;
const COLORS = {
    primary: '#E4405C',
    background: '#f5f5f5',
    white: '#fff',
    black: '#000',
    gray: '#6B7280',
    text: '#121315',
    border: '#E5E7EB',
} as const;

const PRIORITY_MAP: Record<Priority, PriorityData> = {
    low: {
        icon: 'star',
        text: 'Низкая',
        color: '#595F6B',
        backgroundColor: '#595F6B0D'
    },
    medium: {
        icon: 'bolt',
        text: 'Средняя',
        color: '#CE7B00',
        backgroundColor: '#F291001A'
    },
    high: {
        icon: 'fire',
        text: 'Высокая',
        color: '#FA5300',
        backgroundColor: '#FA53001A'
    },
    critical: {
        icon: 'warning',
        text: 'Критичная',
        color: '#D91528',
        backgroundColor: '#D915281A'
    }
};

// Компоненты
const EmptyStateImage = memo(() => {
    const [assets] = useAssets([require('@/assets/images/EmptyState.png')]);

    if (!assets) return null;

    return <Image
        style={styles.emptyImage}
        source={assets[0]}
        resizeMode="contain"
    />;
});

EmptyStateImage.displayName = 'EmptyStateImage';

const RequestCard = memo<RequestCardProps>(({ request }) => {
    const priorityData = PRIORITY_MAP[request.priority];
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.priorityContainer}>
                    <View style={[
                        styles.cardIcon,
                        { backgroundColor: priorityData.backgroundColor }
                    ]}>
                        <SolarIcon
                            name={priorityData.icon}
                            size={16}
                            color={priorityData.color}
                        />
                    </View>
                    <View style={[
                        styles.cardText,
                        { backgroundColor: priorityData.backgroundColor }
                    ]}>
                        <Text style={[
                            styles.priorityText,
                            { color: priorityData.color }
                        ]}>
                            {priorityData.text}
                        </Text>
                    </View>
                </View>
                <Text style={styles.dateText}>{request.date}</Text>
            </View>

            <Text style={styles.idText} numberOfLines={1}>
                {request.id}
            </Text>
            <Text style={styles.coordinatesText} numberOfLines={2}>
                {request.coordinates}
            </Text>
        </View>
    );
});

RequestCard.displayName = 'RequestCard';

const EmptyState = memo<EmptyStateProps>(({ error }) => (
    <View style={styles.emptyContainer}>
        <EmptyStateImage />
        <Text style={styles.emptyTitle}>
            {error ? 'ПРОИЗОШЛА ОШИБКА' : 'У ВАС ПОКА НЕТ ЗАЯВОК'}
        </Text>
        <Text style={styles.emptySubtitle}>
            {error ? error.message : 'Для создания заявки нажмите на кнопку "+"'}
        </Text>
    </View>
));

EmptyState.displayName = 'EmptyState';

// Основной компонент
const HomeScreen = () => {
    const { requests = [], loading, error, refetch } = useDamageRequests();

    const handleRefresh = useCallback(() => {
        refetch?.();
    }, [refetch]);

    if (loading && requests.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                bounces={true}
            >
                {requests.length > 0 ? (
                    <View style={styles.content}>
                        {requests.map((request, index) => (
                            <RequestCard
                                key={`request-${request.id || index}`}
                                request={request}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyStateWrapper}>
                        <EmptyState error={error} />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// Стили
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateWrapper: {
        flex: 1,
        minHeight: SCREEN_HEIGHT - 100, // Учитываем возможный header и отступы
    },
    cardIcon: {
        width: 24,
        height: 24,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    cardText: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    } as ViewStyle,
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: 16,
        marginBottom: 8,
        elevation: Platform.select({ android: 2, default: 0 }),
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    } as ViewStyle,
    priorityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    } as ViewStyle,
    priorityText: {
        fontSize: 14,
        fontFamily: Platform.select({
            android: 'Inter_600SemiBold',
            ios: 'Inter-SemiBold',
        }),
    } as TextStyle,
    dateText: {
        fontSize: 14,
        color: COLORS.gray,
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
    } as TextStyle,
    idText: {
        fontSize: 22,
        color: COLORS.black,
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
        marginBottom: 10,
    } as TextStyle,
    coordinatesText: {
        fontSize: 14,
        color: COLORS.text,
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
    } as TextStyle,
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        marginTop: 8,
    } as ViewStyle,
    emptyImage: {
        width: 140,
        height: 140,
        marginBottom: 24,
    } as ImageStyle,
    emptyTitle: {
        fontSize: 22,
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'center',
    } as TextStyle,
    emptySubtitle: {
        fontSize: 14,
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
        color: COLORS.black,
        marginBottom: 8,
        textAlign: 'center',
    } as TextStyle,
});

export default memo(HomeScreen);