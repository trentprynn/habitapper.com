import safeJsonStringify from 'fast-safe-stringify'
import { useState } from 'react'
import { Button, Card, FormControl, InputGroup, Spinner } from 'react-bootstrap'

interface onChangeSignature {
    (): void
}

type NewHabitCardProps = {
    habitChanged: onChangeSignature
}

const NewHabitCard = ({ habitChanged }: NewHabitCardProps) => {
    const [loading, setLoading] = useState(false)
    const [newHabitName, setNewHabitName] = useState('')
    const [error, setError] = useState('')

    return (
        <Card className="text-center h-100">
            <Card.Body>
                <Card.Title>
                    <InputGroup size="sm" className="mb-3">
                        <FormControl value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} />
                    </InputGroup>
                    <InputGroup></InputGroup>
                </Card.Title>
                {error && <p className="text-danger">{error}</p>}
                <Card.Text>
                    <b>Streak:</b> 0
                </Card.Text>
                <Button
                    variant="primary"
                    className="m-1"
                    disabled={loading}
                    onClick={async () => addHabit(newHabitName)}
                >
                    {loading ? (
                        <Spinner as="span" animation="border" role="status" size="sm">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    ) : (
                        'Add'
                    )}
                </Button>
            </Card.Body>
            <Card.Footer>
                <small>start tracking a new habit!</small>
            </Card.Footer>
        </Card>
    )

    async function addHabit(newHabitName: string): Promise<void> {
        setLoading(true)
        setError('')

        // make POST request to the backend to continue the
        // streak for the given habit, the request body is
        // empty as there's not request data to be sent, this
        // is more like an 'http touch' request
        var response = await fetch(`/api/habits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: safeJsonStringify({
                name: newHabitName,
            }),
        })

        // if add habit POST call failed, log to console
        if (response.status !== 200) {
            console.log(`add habit failed --> ${response.status} ${response.statusText}`)
            setError(await response.text())
            setLoading(false)
            return
        }

        // here if we were able to add new habit,
        // refresh habits so user sees updated habits
        setNewHabitName('')
        habitChanged()
        setLoading(false)
    }
}

export default NewHabitCard
