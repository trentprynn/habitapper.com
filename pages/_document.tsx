import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
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
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument
