import 'bootstrap/dist/css/bootstrap.min.css'

import { Provider } from 'next-auth/client'

import type { AppProps } from 'next/app'
export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider session={pageProps.session}>
            <Component {...pageProps} />
        </Provider>
    )
}
