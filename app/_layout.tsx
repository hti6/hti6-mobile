import { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
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
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SystemUI from 'expo-system-ui';
import Constants from 'expo-constants';

// Prevent auto hide of splash screen
SplashScreen.preventAutoHideAsync().catch(console.warn);

const REQUIRED_ASSETS = [
    require('@/assets/images/EmptyState.png'),
    require('@/assets/images/Logo.png'),
    // Add other required assets here
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

    // Load assets
    const [assetsLoaded] = useAssets(REQUIRED_ASSETS);

    // Configure system UI
    useEffect(() => {
        const configureSystemUI = async () => {
            try {
                await SystemUI.setBackgroundColorAsync('#ffffff');
            } catch (error) {
                console.warn('Failed to configure system UI:', error);
            }
        };

        configureSystemUI();
    }, []);

    // Prepare app resources
    const prepareResources = useCallback(async () => {
        try {
            // Add any additional async resource loading here
            // For example, fetching initial config, etc.

            const isResourcesReady = interLoaded && oswaldLoaded && assetsLoaded;

            if (isResourcesReady) {
                // Set a small timeout to prevent flicker
                await new Promise(resolve => setTimeout(resolve, 100));
                await SplashScreen.hideAsync();
                setIsReady(true);
            }
        } catch (error) {
            console.error('Failed to prepare resources:', error);
            setLoadError(error instanceof Error ? error : new Error('Failed to load resources'));
        }
    }, [interLoaded, oswaldLoaded, assetsLoaded]);

    // Effect for preparing resources
    useEffect(() => {
        prepareResources();
    }, [prepareResources]);

    // Show nothing while preparing
    if (!isReady) {
        return null;
    }

    // If there was an error loading resources, you might want to show a custom error screen
    if (loadError) {
        return (
            <View style={styles.errorContainer}>
                <ErrorBoundary>
                    {/* Add your custom error component here */}
                </ErrorBoundary>
            </View>
        );
    }

    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
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