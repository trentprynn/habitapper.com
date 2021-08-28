import Head from 'next/head'

export default function Layout({ children, title = 'HabiTapper' }: any) {
    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>
            {children}
        </div>
    )
}
