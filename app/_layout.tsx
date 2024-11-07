import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native";
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

SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);

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

    const [assetsLoaded] = useAssets([
        // require('@/assets/images/logo.png'),
        require('@/assets/images/EmptyState.png'),
    ]);

    useEffect(() => {
        async function prepare() {
            try {
                const isReady = interLoaded && oswaldLoaded && assetsLoaded;

                if (isReady) {
                    setAppIsReady(true);
                    await SplashScreen.hideAsync();
                }
            } catch (error) {
                console.warn('Error loading app resources:', error);
            }
        }

        prepare();
    }, [interLoaded, oswaldLoaded, assetsLoaded]);

    if (!appIsReady) {
        return null;
    }

    return (
        <AuthProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'fade',
                        contentStyle: { backgroundColor: '#f5f5f5' },
                    }}
                />
            </SafeAreaView>
        </AuthProvider>
    );
}