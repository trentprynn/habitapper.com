import 'bootstrap/dist/css/bootstrap.min.css'

import { SessionProvider } from 'next-auth/react'

// TODO: import SSRProvider from react-bootstrap itself when it's available
//       https://github.com/react-bootstrap/react-bootstrap/issues/6026
import { SSRProvider } from '@restart/ui/ssr'

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
