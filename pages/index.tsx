import { signIn, getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next'
import { Button } from 'react-bootstrap'
import Layout from '../components/layout/layout'

export default function Home({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <Layout>
            <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
                <h1>HabiTapper</h1>
                <p>Feedback loop habit tracking.</p>
                <Button onClick={() => signIn()}>Sign in</Button>
            </div>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context)

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
