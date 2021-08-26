import { signOut, getSession } from 'next-auth/client'
import { GetServerSideProps } from 'next'
import { InferGetServerSidePropsType } from 'next'
import moment from 'moment'
import { Fragment, useState } from 'react'
import { getHabitsForUser } from '../api/habits'
import { Habit } from '@prisma/client'
import safeJsonStringify from 'safe-json-stringify'
import { useRouter } from 'next/router'
import { Table, Button } from 'react-bootstrap'

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
        <Fragment>
            <p>Signed in as {session.user.email}</p>
            <Button onClick={() => signOut()}>Sign out</Button>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Streak</th>
                        <th>Last Claimed</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {habits &&
                        habits.map((habit: Habit) => (
                            <tr key={habit.habitId}>
                                <td>{habit.name}</td>
                                <td>{habit.streak}</td>
                                <td>
                                    <Fragment>
                                        {habit.streakContinuedAt == null ? (
                                            <div>N/A</div>
                                        ) : (
                                            <div>
                                                {moment(habit.streakContinuedAt).format(
                                                    'M/D/Y h:m a'
                                                )}
                                            </div>
                                        )}
                                    </Fragment>
                                </td>
                                <Fragment>
                                    {UTCDateOlderThan24HoursOrNull(habit.streakContinuedAt) ? (
                                        <Fragment>
                                            <td>Available</td>
                                            <td>
                                                <Button
                                                    variant="success"
                                                    onClick={async () =>
                                                        continueHabitStreak(habit.habitId)
                                                    }
                                                >
                                                    Claim
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="mx-1"
                                                    onClick={async () => deleteHabit(habit.habitId)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </Fragment>
                                    ) : (
                                        <Fragment>
                                            <td>Not Available</td>
                                            <td>
                                                <Button variant="secondary" disabled>
                                                    Claim
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="mx-1"
                                                    onClick={async () => deleteHabit(habit.habitId)}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </Fragment>
                                    )}
                                </Fragment>
                            </tr>
                        ))}
                    <tr>
                        <td>
                            <input
                                type="text"
                                value={newHabitName}
                                onChange={(e) => setNewHabitName(e.target.value)}
                            ></input>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                            <Button variant="primary" onClick={async () => addHabit(newHabitName)}>
                                Add
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </Table>
        </Fragment>
    )

    function UTCDateOlderThan24HoursOrNull(utcDate: any): boolean {
        if (utcDate == null) {
            return true
        }

        if (moment().diff(moment(utcDate), 'hours') > 24) {
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
