import Head from 'next/head'
import Link from 'next/link'
import React from 'react'
import { AiFillApi } from 'react-icons/ai'
import { FaGithub, FaInstagram, FaTwitter } from 'react-icons/fa'
import { IoLogoVenmo } from 'react-icons/io5'

export default function Layout({ children, title = 'HabiTapper' }: { children: any; title?: string }) {
    return (
        <React.Fragment>
            <Head>
                <title>{title}</title>
            </Head>
            {children}
            <footer className="my-3 text-center">
                <a href="https://github.com/trentprynn/habitapper.com" className="me-2">
                    <FaGithub />
                </a>
                <a href="https://twitter.com/TrentPrynn" className="me-2">
                    <FaTwitter />
                </a>
                <a href="https://www.instagram.com/habitapper/" className="me-2">
                    <FaInstagram />
                </a>
                <a href="https://account.venmo.com/u/TrentPrynn" className="me-2">
                    <IoLogoVenmo />
                </a>
                <Link href="/api/docs" passHref>
                    <a className="me-2">
                        <AiFillApi />
                    </a>
                </Link>
            </footer>
        </React.Fragment>
    )
}
