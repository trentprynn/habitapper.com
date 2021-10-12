import { Habit, UserSettings } from '@prisma/client'
import { habitAbleToBeClaimed } from 'common/functions/time'
import moment from 'moment'
import { useState } from 'react'
import { Button, Card, Dropdown, Spinner } from 'react-bootstrap'

interface onChangeSignature {
    (): void
}

type HabitCardProps = {
    habit: Habit
    userSettings: UserSettings | null
    habitChanged: onChangeSignature
}

const HabitCard = ({ habit, userSettings, habitChanged }: HabitCardProps) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    return (
        <Card className="h-100">
            <Card.Header className="text-end">
                <Dropdown>
                    <Dropdown.Toggle id="habit-edit-menu" variant="secondary" size="sm"></Dropdown.Toggle>
                    <Dropdown.Menu renderOnMount={true}>
                        <Dropdown.Item onClick={async () => deleteHabit(habit.habitId)}>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Card.Header>
            <Card.Body className="text-center">
                <Card.Title>{habit.name}</Card.Title>
                {error && <p className="text-danger">{error}</p>}
                <Card.Text>
                    <b>Streak:</b> {habit.streak}
                </Card.Text>
                {userSettings == null || habitAbleToBeClaimed(habit, userSettings.timeZone) ? (
                    <Button
                        variant="success"
                        disabled={loading}
                        onClick={async () => continueHabitStreak(habit.habitId)}
                    >
                        {loading ? (
                            <Spinner as="span" animation="border" role="status" size="sm">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        ) : (
                            'Claim'
                        )}
                    </Button>
                ) : (
                    <Button variant="secondary" disabled>
                        {loading ? (
                            <Spinner as="span" animation="border" role="status" size="sm">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        ) : (
                            'Claim'
                        )}
                    </Button>
                )}
            </Card.Body>
            <Card.Footer className="text-center">
                {habit.streakContinuedAt ? (
                    <small>last claimed {moment(habit.streakContinuedAt).format('L')}</small>
                ) : (
                    <small>habit not yet claimed</small>
                )}
            </Card.Footer>
        </Card>
    )

    async function continueHabitStreak(habitId: number): Promise<void> {
        setLoading(true)
        setError('')

        // make POST request to the backend to continue the
        // streak for the given habit, the request body is
        // empty as there's not request data to be sent, this
        // is more like an 'http touch' request
        var response = await fetch(`/api/habits/${habitId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: null,
        })

        // if continue streak POST call failed, log to console
        if (response.status !== 200) {
            console.log(`continue habit streak failed --> ${response.status} ${response.statusText}`)
            setError(await response.text())
            setLoading(false)
            return
        }

        habitChanged()
        setLoading(false)
    }

    async function deleteHabit(habitId: number): Promise<void> {
        if (window.confirm('Are you sure you want to delete that habit?')) {
            setLoading(true)
            setError('')

            // make DELETE call to api for given habitId
            var response = await fetch(`/api/habits/${habitId}`, {
                method: 'DELETE',
            })

            if (response.status !== 200) {
                console.log(`delete habit failed --> ${response.status} ${response.statusText}`)
                setError(await response.text())
                setLoading(true)
                return
            }

            habitChanged()
            setLoading(true)
        }
    }
}

export default HabitCard
