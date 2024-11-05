// hooks/useDamageRequests.ts
import { useState, useEffect, useCallback } from 'react';
import { damageService } from '@/services/damage.service';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface DamageRequestDisplay {
    id: string;
    priority: Priority;
    coordinates: string;
    date: string;
    photo_url: string;
}

export const useDamageRequests = () => {
    const [requests, setRequests] = useState<DamageRequestDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const formatCoordinates = (latitude: number, longitude: number): string => {
        return `${latitude.toFixed(6)}° ${longitude.toFixed(6)}°`;
    };

    const transformAPIResponse = useCallback((apiData: any[]): DamageRequestDisplay[] => {
        return apiData.map((item) => ({
            id: item.id,
            priority: item.priority || 'low', // Предполагаем, что API возвращает приоритет
            coordinates: formatCoordinates(item.latitude, item.longitude),
            date: new Date(item.created_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).replace(',', ''),
            photo_url: item.photo_url
        }));
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await damageService.indexDamageRequest();
            console.log(response.result)
            const transformedData = transformAPIResponse(response.result);
            setRequests(transformedData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Ошибка при загрузке заявок'));
        } finally {
            setLoading(false);
        }
    }, [transformAPIResponse]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        refetch: fetchRequests
    };
};