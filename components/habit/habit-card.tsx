import { Habit } from '@prisma/client'
import moment from 'moment'
import React from 'react'
import { Button, Card, Dropdown } from 'react-bootstrap'

interface onChangeSignature {
    (): void
}

type HabitCardProps = {
    habit: Habit
    habitChanged: onChangeSignature
}

const HabitCard = ({ habit, habitChanged }: HabitCardProps) => {
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
                <Card.Text>
                    <b>Streak:</b> {habit.streak}
                </Card.Text>
                {dateOlderThen16HoursOrNull(habit.streakContinuedAt) ? (
                    <Button variant="success" onClick={async () => continueHabitStreak(habit.habitId)}>
                        Claim
                    </Button>
                ) : (
                    <Button variant="secondary" disabled>
                        Claim
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

        habitChanged()
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

            habitChanged()
        }
    }
}

export default HabitCard

function dateOlderThen16HoursOrNull(date: Date | null): boolean {
    if (date == null) {
        return true
    }

    if (moment().diff(moment(date), 'hours') >= 16) {
        return true
    }

    return false
}
