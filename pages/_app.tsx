import 'bootstrap/dist/css/bootstrap.min.css'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import SSRProvider from 'react-bootstrap/SSRProvider'

export default function MyApp({
    Component,
    pageProps,
}: AppProps<{
    session: Session
}>) {
    return (
        <SSRProvider>
            <SessionProvider session={pageProps.session}>
                <Head>
                    {/* we set `maximum-scale=1` in the following meta tag to disable input zoom on ios devices
                        reference: https://stackoverflow.com/a/46254706 */}
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                </Head>
                <Component {...pageProps} />
            </SessionProvider>
        </SSRProvider>
    )
}
