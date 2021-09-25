import 'bootstrap/dist/css/bootstrap.min.css';

import { SessionProvider } from 'next-auth/react';
import SSRProvider from 'react-bootstrap/SSRProvider';

import type { AppProps } from 'next/app'
export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SSRProvider>
            <SessionProvider session={pageProps.session}>
                <Component {...pageProps} />
            </SessionProvider>
        </SSRProvider>
    )
}
