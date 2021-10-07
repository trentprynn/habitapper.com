import Layout from 'components/layout/layout'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Button } from 'react-bootstrap'

export default function Home({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()

    return (
        <Layout>
            <div className="pt-5 d-flex flex-column justify-content-center align-items-center">
                <h1>HabiTapper</h1>
                <p>feedback loop habit tracking.</p>
                <Button className="m-1" onClick={() => signIn()}>
                    Sign in
                </Button>
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
