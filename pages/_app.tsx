import 'bootstrap/dist/css/bootstrap.min.css'
import type { AppProps } from 'next/app'
import { Provider } from 'next-auth/client'

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider session={pageProps.session}>
            <Component {...pageProps} />
        </Provider>
    )
}
