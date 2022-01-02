import Layout from 'components/layout/layout'
import Nav from 'components/layout/nav'
import { GetServerSidePropsContext } from 'next'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { Container } from 'react-bootstrap'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs({ session }: { session: Session | null }) {
    return (
        <Layout>
            <Nav session={session}></Nav>
            <Container>
                <SwaggerUI url={`${process.env.NEXT_PUBLIC_URL}/api/open-api`} />
            </Container>
        </Layout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context, authOptions)

    return {
        props: {
            session,
        },
    }
}
