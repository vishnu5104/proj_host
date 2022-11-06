import { StorageProvider } from '@arcana/storage';
import { AuthProvider, AppMode } from '@arcana/auth';

let auth;
let storageProvider;

export async function getWalletInstance() {
    auth = new AuthProvider(process.env.NEXT_PUBLIC_REACT_APP_ARCANA_APP_ID);
    await auth.init({ appMode: AppMode.Full, position: 'right' });

    return auth.provider;
}

export default async function getStorageProvider(provider) {
    if (!storageProvider) {
        storageProvider = new StorageProvider({
            appId: process.env.NEXT_PUBLIC_REACT_APP_ARCANA_APP_ID,
            provider,
        });
    }

    return storageProvider;
}
