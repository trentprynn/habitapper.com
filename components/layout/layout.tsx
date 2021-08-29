import Head from 'next/head'
import { FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa'

export default function Layout({ children, title = 'HabiTapper' }: any) {
    return (
        <div>
            <Head>
                <title>{title}</title>
            </Head>
            {children}
            <footer className="mt-auto py-3 text-center">
                <a href="https://github.com/trentprynn/habitapper.com" className="p-1">
                    <FaGithub />
                </a>
                <a href="https://twitter.com/TrentPrynn" className="p-1">
                    <FaTwitter />
                </a>
                <a href="https://www.instagram.com/trentprynn/" className="p-1">
                    <FaInstagram />
                </a>
            </footer>
        </div>
    )
}
