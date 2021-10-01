import safeJsonStringify from 'fast-safe-stringify'
import { useState } from 'react'
import { Button, Card, FormControl, InputGroup } from 'react-bootstrap'

interface onChangeSignature {
    (): void
}

type NewHabitCardProps = {
    habitChanged: onChangeSignature
}

const NewHabitCard = ({ habitChanged }: NewHabitCardProps) => {
    const [newHabitName, setNewHabitName] = useState('')

    return (
        <Card className="text-center h-100">
            <Card.Body>
                <Card.Title>
                    <InputGroup size="sm" className="mb-3">
                        <FormControl value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} />
                    </InputGroup>
                    <InputGroup></InputGroup>
                </Card.Title>
                <Card.Text>
                    <b>Streak:</b> 0
                </Card.Text>
                <Button variant="primary" className="m-1" onClick={async () => addHabit(newHabitName)}>
                    Add
                </Button>
            </Card.Body>
            <Card.Footer>
                <small>start tracking a new habit!</small>
            </Card.Footer>
        </Card>
    )

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
        habitChanged()
    }
}

export default NewHabitCard
