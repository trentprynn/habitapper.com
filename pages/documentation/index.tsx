import Layout from 'components/layout/layout'
import Nav from 'components/layout/nav'
import { GetServerSidePropsContext } from 'next'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs({ session }: { session: Session }) {
    return (
        <Layout>
            <Nav session={session}></Nav>
            <SwaggerUI url={`${process.env.NEXT_PUBLIC_URL}/api/open-api`} />
        </Layout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context, authOptions)
    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    return {
        props: {
            session,
        },
    }
}
