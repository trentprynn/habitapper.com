import Head from 'next/head'

export default function Layout({ children, title = 'HabiTapper' }: any) {
    return (
        <div>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <script async defer src="https://sa.habitapper.com/latest.js"></script>
                <noscript>
                    <img
                        src="https://sa.habitapper.com/noscript.gif"
                        alt=""
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </noscript>
            </Head>
            {children}
        </div>
    )
}
