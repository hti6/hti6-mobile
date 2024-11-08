import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { AuthProvider } from "@/contexts/auth.context";
import {
    Inter_900Black,
    Inter_600SemiBold,
    Inter_500Medium,
    Inter_400Regular,
    useFonts as useInterFonts
} from '@expo-google-fonts/inter';
import {
    Oswald_700Bold,
    Oswald_500Medium,
    Oswald_300Light,
    useFonts as useOswaldFonts
} from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';
import { useAssets } from 'expo-asset';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync().catch(console.warn);

const REQUIRED_ASSETS = [
    require('@/assets/images/EmptyState.png'),
    require('@/assets/images/Logo.png'),
];

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);

    // Load fonts
    const [interLoaded] = useInterFonts({
        Inter_900Black,
        Inter_600SemiBold,
        Inter_500Medium,
        Inter_400Regular,
    });

    const [oswaldLoaded] = useOswaldFonts({
        Oswald_700Bold,
        Oswald_500Medium,
        Oswald_300Light,
    });

    const [assetsLoaded] = useAssets(REQUIRED_ASSETS);

    const prepareResources = useCallback(async () => {
        try {
            const isResourcesReady = interLoaded && oswaldLoaded && assetsLoaded;

            if (isResourcesReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
                await SplashScreen.hideAsync();
                setIsReady(true);
            }
        } catch (error) {
            console.error('Failed to prepare resources:', error);
            setLoadError(error instanceof Error ? error : new Error('Failed to load resources'));
        }
    }, [interLoaded, oswaldLoaded, assetsLoaded]);

    useEffect(() => {
        prepareResources();
    }, [prepareResources]);

    if (!isReady) {
        return null;
    }

    if (loadError) {
        return (
            <View style={styles.errorContainer}>
                <div></div>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <AuthProvider>
                <View style={styles.container}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            animation: 'fade',
                            animationDuration: 200,
                            contentStyle: styles.contentStyle,
                            navigationBarColor: '#ffffff',
                            statusBarStyle: 'dark',
                            statusBarColor: 'transparent',
                            statusBarTranslucent: true,
                        }}
                    />
                </View>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentStyle: {
        backgroundColor: '#f5f5f5',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    }
});