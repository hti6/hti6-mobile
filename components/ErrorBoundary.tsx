import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Updates from 'expo-updates';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Здесь можно добавить логирование ошибок в сервис аналитики
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (error) {
            // Если не удалось перезагрузить через Updates, перезагружаем JS
            if (__DEV__) {
                console.log('Development mode - skipping reload');
            } else {
                console.error('Failed to reload app:', error);
            }
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Что-то пошло не так</Text>
                    <Text style={styles.message}>
                        Произошла непредвиденная ошибка. Пожалуйста, перезапустите приложение.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.handleRestart}
                    >
                        <Text style={styles.buttonText}>Перезапустить</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontFamily: Platform.select({
            android: 'Oswald_500Medium',
            ios: 'Oswald-Medium',
        }),
        color: '#000',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#E22E65',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Platform.select({
            android: 'Inter_600SemiBold',
            ios: 'Inter-SemiBold',
        }),
    },
});