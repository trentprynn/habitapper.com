import { Habit, UserSettings } from '@prisma/client'
import HabitCard from 'components/habit/habit-card'
import NewHabitCard from 'components/habit/new-habit-card'
import Layout from 'components/layout/layout'
import Nav from 'components/layout/nav'
import safeJsonStringify from 'fast-safe-stringify'
import { GetServerSidePropsContext } from 'next'
import { Session } from 'next-auth'
import { unstable_getServerSession } from 'next-auth/next'
import { useRouter } from 'next/router'
import { authOptions } from 'pages/api/auth/[...nextauth]'
import { getHabitsForUser } from 'pages/api/habits'
import { getSettingsForUser } from 'pages/api/user/settings'
import { Col, Container, Row } from 'react-bootstrap'

export default function Home({
    session,
    userSettings,
    habits,
}: {
    session: Session
    userSettings: UserSettings
    habits: Habit[]
}) {
    const router = useRouter()
    const refreshData = () => {
        router.replace(router.asPath, undefined, { scroll: false })
    }

    return (
        <Layout>
            <Nav session={session}></Nav>
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
    const session = await unstable_getServerSession(context.req, context.res, authOptions)

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
