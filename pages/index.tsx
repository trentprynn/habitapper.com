import { signIn, getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next'
import { Button } from 'react-bootstrap'

export default function Home({}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <div>
            <p>Not signed in</p>
            <Button onClick={() => signIn()}>Sign in</Button>
        </div>
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
