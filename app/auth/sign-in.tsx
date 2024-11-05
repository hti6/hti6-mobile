import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Pressable, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth.context';
import { SolarIcon } from '@/components/SolarIcon';
import {useAssets} from "expo-asset";

const LogoImage = () => {
    const [assets, error] = useAssets([
        require('@/assets/images/Logo.png'),
    ]);

    return assets ? <Image style={styles.logoImage} source={assets[0]} /> : null;
}

export default function SignIn() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                router.replace('/app');
            }
        } catch (error) {
            // Обработка ошибок
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
        >
            <View style={styles.container}>
                <LogoImage />
                    <View style={styles.content}>
                        {/* Заголовок */}
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                НЕЙРО <Text style={styles.titleAccent}>ВХОД</Text>
                            </Text>
                            <Text style={styles.subtitle}>
                                Для доступа в систему необходимо заполнить данные
                            </Text>
                        </View>

                        {/* Форма */}
                        <View style={styles.form}>
                            {/* Поле логина */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Логин"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Поле пароля */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Пароль"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPassword(!showPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <SolarIcon
                                        name={!showPassword ? "eyeClosed" : "eye"}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Запомнить меня */}
                            <Pressable
                                style={styles.rememberContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View style={styles.checkbox}>
                                    {rememberMe && (
                                        <View style={styles.checkboxInner} />
                                    )}
                                </View>
                                <Text style={styles.rememberText}>Запомнить меня</Text>
                            </Pressable>
                        </View>

                        {/* Кнопка входа */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.loginButtonText}>
                                {isLoading ? 'Вход...' : 'Войти'}
                            </Text>
                        </TouchableOpacity>
                    </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    logoImage: {
        width: 350,
        height: 350,
        position: "absolute",
        right: 0
    },
    container: {
        backgroundColor: '#E4405C',
        height: `100%`,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        marginTop: 'auto',
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#FFFFFF',
        height: `78%`
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        color: '#000',
        fontFamily: Platform.select({
            android: 'Oswald_700Bold',
            ios: 'Oswald-Bold',
        }),
        marginBottom: 12,
    },
    titleAccent: {
        color: '#E22E65',
    },
    subtitle: {
        fontSize: 12,
        color: '#121315',
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
    },
    form: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 8,
        position: 'relative',
    },
    input: {
        backgroundColor: '#FAFAFB',
        borderColor: '#595F6B0A',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 20,
        fontSize: 16,
        fontFamily: Platform.select({
            android: 'Inter_500Medium',
            ios: 'Inter-Medium',
        }),
        color: '#93979F',
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#595F6B14',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#E22E65',
        borderRadius: 2,
    },
    rememberText: {
        color: '#000',
        fontSize: 14,
        fontFamily: Platform.select({
            android: 'Inter_400Regular',
            ios: 'Inter-Regular',
        }),
    },
    loginButton: {
        backgroundColor: '#E22E65',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: Platform.select({
            android: 'Inter_600SemiBold',
            ios: 'Inter-SemiBold',
        }),
    },
});