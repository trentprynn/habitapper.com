import Head from 'next/head'
import Link from 'next/link'
import { AiFillApi } from 'react-icons/ai'
import { FaGithub, FaInstagram, FaTwitter } from 'react-icons/fa'
import { IoLogoVenmo } from 'react-icons/io5'

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
                <a href="https://www.instagram.com/habitapper/" className="p-1">
                    <FaInstagram />
                </a>
                <a href="https://account.venmo.com/u/TrentPrynn" className="p-1">
                    <IoLogoVenmo />
                </a>
                <Link href="/documentation" passHref>
                    <a className="p-1">
                        <AiFillApi />
                    </a>
                </Link>
            </footer>
        </div>
    )
}
