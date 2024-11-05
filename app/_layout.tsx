import { Stack } from "expo-router";
import {AuthProvider} from "@/contexts/auth.context";
import {SafeAreaView} from "react-native";
import { Inter_900Black, Inter_600SemiBold, Inter_500Medium, Inter_400Regular, useFonts as useInterFonts } from '@expo-google-fonts/inter';
import { Oswald_700Bold, Oswald_500Medium, Oswald_300Light, useFonts as useOswaldFonts } from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from "react";
import { useAssets } from 'expo-asset';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [interLoaded, interErrors] = useInterFonts({
        Inter_900Black, Inter_600SemiBold, Inter_500Medium, Inter_400Regular
    });
    const [oswaldLoaded, oswaldError] = useOswaldFonts({
        Oswald_700Bold, Oswald_500Medium, Oswald_300Light
    });

    useEffect(() => {
        if (oswaldLoaded || oswaldError || interLoaded || interErrors) {
            SplashScreen.hideAsync();
        }
    }, [oswaldLoaded, oswaldError, interLoaded, interErrors]);

    if (!oswaldLoaded && !oswaldError && !interLoaded && !interErrors) {
        return null;
    }

    return (
        <AuthProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaView>
        </AuthProvider>
    );
}