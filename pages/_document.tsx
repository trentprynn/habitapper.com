import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <meta charSet="utf-8" />
                <meta
                    name="description"
                    content="HabiTapper is an open source, privacy focused daily habit tracking web application. It's like snapchat streaks but for your daily habits!"
                />
                <meta property="og:title" content="HabiTapper" />
                <meta property="og:image" content="https://habitapper.com/default.png" />
                <meta
                    property="og:description"
                    content="HabiTapper is an open source, privacy focused daily habit tracking web application. It's like snapchat streaks but for your daily habits!"
                />
                <link rel="apple-touch-icon" href="https://habitapper.com/logo192.png" />
                <link rel="manifest" href="https://habitapper.com/manifest.json" />
                <script async defer data-collect-dnt="true" src="https://sa.habitapper.com/latest.js"></script>
                <noscript>
                    <img // eslint-disable-line
                        src="https://sa.habitapper.com/noscript.gif?collect-dnt=true"
                        alt=""
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </noscript>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
