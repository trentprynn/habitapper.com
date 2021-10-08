import { Habit } from '@prisma/client'
import HabitCard from 'components/habit/habit-card'
import NewHabitCard from 'components/habit/new-habit-card'
import Layout from 'components/layout/layout'
import safeJsonStringify from 'fast-safe-stringify'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getHabitsForUser } from 'pages/api/habits'
import { Button, Col, Container, Row } from 'react-bootstrap'

export default function Home({ session, habits }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const refreshData = () => {
        router.replace(router.asPath)
    }

    return (
        <Layout>
            <div>
                <p>Signed in as {session.user.email}</p>
                <Button className="m-1" onClick={() => signOut()}>
                    Sign out
                </Button>
                <Link href="/user/settings" passHref>
                    <Button className="m-1" variant="secondary">
                        Settings
                    </Button>
                </Link>
            </div>
            <Container className="mt-3">
                <Row xs={2} md={3}>
                    {habits.map((habit: Habit) => (
                        <Col className="pt-3" key={habit.habitId}>
                            <HabitCard habit={habit} habitChanged={refreshData} />
                        </Col>
                    ))}
                    <Col className="pt-3">
                        <NewHabitCard habitChanged={refreshData} />
                    </Col>
                </Row>
            </Container>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context)

    if (!session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    const habits = JSON.parse(safeJsonStringify(await getHabitsForUser(session.user.id)))

    return {
        props: {
            session,
            habits,
        },
    }
}
