import { Habit } from '@prisma/client'
import HabitCard from 'components/habit/habit-card'
import NewHabitCard from 'components/habit/new-habit-card'
import Layout from 'components/layout/layout'
import safeJsonStringify from 'fast-safe-stringify'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { getServerSession } from 'next-auth/next'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { getHabitsForUser } from 'pages/api/habits'
import { getSettingsForUser } from 'pages/api/user/settings'
import { Button, Col, Container, Row } from 'react-bootstrap'

export default function Home({
    session,
    userSettings,
    habits,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const refreshData = () => {
        router.replace(router.asPath, undefined, { scroll: false })
    }

    return (
        <Layout>
            <div>
                <p>Signed in as {session.user.email}</p>
                <Button
                    className="m-1"
                    onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/auth/logout` })}
                >
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
                            <HabitCard habit={habit} userSettings={userSettings} habitChanged={refreshData} />
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

    const userSettings = JSON.parse(safeJsonStringify(await getSettingsForUser(session.user.id)))
    const habits = JSON.parse(safeJsonStringify(await getHabitsForUser(session.user.id)))

    return {
        props: {
            session,
            userSettings,
            habits,
        },
    }
}
