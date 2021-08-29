import { signOut, getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next'
import moment from 'moment'
import { Fragment, useState } from 'react'
import { getHabitsForUser } from '../api/habits'
import { Habit } from '@prisma/client'
import safeJsonStringify from 'safe-json-stringify'
import { useRouter } from 'next/router'
import { Button, Card, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap'
import Layout from '../../components/layout/layout'

export default function Home({
    session,
    habits,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const refreshData = () => {
        router.replace(router.asPath)
    }

    const [newHabitName, setNewHabitName] = useState('')

    return (
        <Layout>
            <p>Signed in as {session.user.email}</p>
            <Button onClick={() => signOut()}>Sign out</Button>
            <Container className="mt-3">
                <Row xs={2} md={3}>
                    {habits.map((habit: Habit) => (
                        <Col className="pt-3" key={habit.habitId}>
                            <Card className="text-center h-100">
                                <Card.Body>
                                    <Card.Title>{habit.name}</Card.Title>
                                    <Card.Text>
                                        <b>Streak:</b> {habit.streak}
                                    </Card.Text>
                                    {dateOlderThen16HoursOrNull(habit.streakContinuedAt) ? (
                                        <Button
                                            variant="success"
                                            onClick={async () => continueHabitStreak(habit.habitId)}
                                        >
                                            Claim
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" disabled>
                                            Claim
                                        </Button>
                                    )}
                                    <Button
                                        variant="danger"
                                        className="mx-1"
                                        onClick={async () => deleteHabit(habit.habitId)}
                                    >
                                        Delete
                                    </Button>
                                </Card.Body>
                                <Card.Footer>
                                    {habit.streakContinuedAt ? (
                                        <small>
                                            last claimed{' '}
                                            {moment().diff(
                                                moment(habit.streakContinuedAt),
                                                'hours'
                                            )}{' '}
                                            hours ago
                                        </small>
                                    ) : (
                                        <small>not claimed yet</small>
                                    )}
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                    <Col className="pt-3">
                        <Card className="text-center h-100">
                            <Card.Body>
                                <Card.Title>
                                    <InputGroup size="sm" className="mb-3">
                                        <FormControl
                                            value={newHabitName}
                                            onChange={(e) => setNewHabitName(e.target.value)}
                                        />
                                    </InputGroup>
                                    <InputGroup></InputGroup>
                                </Card.Title>
                                <Card.Text>
                                    <b>Streak:</b> 0
                                </Card.Text>
                                <Button
                                    variant="primary"
                                    onClick={async () => addHabit(newHabitName)}
                                >
                                    Add
                                </Button>
                            </Card.Body>
                            <Card.Footer>
                                <small>not claimed yet</small>
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Layout>
    )

    function dateOlderThen16HoursOrNull(date: Date | null): boolean {
        if (date == null) {
            return true
        }

        if (moment().diff(moment(date), 'hours') >= 16) {
            return true
        }

        return false
    }

    async function addHabit(newHabitName: string): Promise<void> {
        // make POST request to the backend to continue the
        // streak for the given habit, the request body is
        // empty as there's not request data to be sent, this
        // is more like an 'http touch' request
        var result = await fetch(`api/habits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: safeJsonStringify({
                name: newHabitName,
            }),
        })

        // if add habit POST call failed, log to console
        if (result.status !== 200) {
            console.log(`add habit failed --> ${result.status} ${result.statusText}`)
            return
        }

        // here if we were able to add new habit,
        // refresh habits so user sees updated habits
        setNewHabitName('')
        refreshData()
    }

    async function deleteHabit(habitId: number): Promise<void> {
        if (window.confirm('Are you sure you want to delete that habit?')) {
            // make DELETE call to api for given habitId
            var result = await fetch(`api/habits/${habitId}`, {
                method: 'DELETE',
            })

            if (result.status !== 200) {
                console.log(`delete habit failed --> ${result.status} ${result.statusText}`)
                return
            }

            // here if we were able to delete habit,
            // refresh habits so user sees updated habits
            refreshData()
        }
    }

    async function continueHabitStreak(habitId: number): Promise<void> {
        // make POST request to the backend to continue the
        // streak for the given habit, the request body is
        // empty as there's not request data to be sent, this
        // is more like an 'http touch' request
        var result = await fetch(`api/habits/${habitId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: null,
        })

        // if continue streak POST call failed, log to console
        if (result.status !== 200) {
            console.log(`continue habit streak failed --> ${result.status} ${result.statusText}`)
            return
        }

        // here if we were able to continue habit streak,
        // refresh habits so user sees updated streak count
        // and continue button goes away
        refreshData()
    }
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
