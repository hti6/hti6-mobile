import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/auth.context';

export default function Index() {
    const { isAuthenticated } = useAuth();

    return <Redirect href={isAuthenticated ? '/app' : '/auth/sign-in'} />;
}