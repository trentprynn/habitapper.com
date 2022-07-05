import Layout from 'components/layout/layout'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { unstable_getServerSession } from 'next-auth'
import { signIn } from 'next-auth/react'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { Button } from 'react-bootstrap'

export default function Home({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <Layout>
            <div className="pt-5 d-flex flex-column justify-content-center align-items-center">
                <h1>HabiTapper</h1>
                <p>feedback loop habit tracking.</p>
                <Button className="m-1" onClick={() => signIn('auth0')}>
                    Sign in
                </Button>
            </div>
        </Layout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    if (session) {
        // if the user is already logged in, redirect them to their
        // habits page
        return {
            redirect: {
                destination: '/habits',
                permanent: false,
            },
        }
    }

    // otherwise stay here and allow them to
    // log in or create an account
    return {
        props: {},
    }
}
