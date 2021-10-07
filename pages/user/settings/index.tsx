import { UserSettings } from '.prisma/client'
import Layout from 'components/layout/layout'
import safeJsonStringify from 'fast-safe-stringify'
import moment from 'moment-timezone'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { getSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getSettingsForUser } from 'pages/api/user/settings'
import { useState } from 'react'
import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import 'react-bootstrap-typeahead/css/Typeahead.css'

export default function Home({ session, settings }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter()
    const refreshData = () => {
        router.replace(router.asPath)
    }

    // load the user's previously saved timezone into a 
    // string array, this may be empty if the user has never 
    // saved their timezone previously
    let startingTz: string[] = []
    if (settings && settings.timeZone) {
        startingTz = [settings.timeZone]
    }

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [userTz, setUserTz] = useState<string[]>(startingTz)

    return (
        <Layout>
            <div>
                <p>Signed in as {session.user.email}</p>
                <Button className="m-1" onClick={() => signOut()}>
                    Sign out
                </Button>
                <Link href="/habits">
                    <Button href="/habits" className="m-1" variant="secondary">
                        Habits
                    </Button>
                </Link>
            </div>
            <Container className="mt-3">
                {error ? (
                    <Row className="justify-content-md-center">
                        <Col md={6}>
                            <p className="text-danger">{error}</p>
                        </Col>
                    </Row>
                ) : (
                    <div></div>
                )}
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <p>
                            <b>Currently saved time zone:</b> {settings ? settings.timeZone : 'none'}
                        </p>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select time zone</Form.Label>
                            <Typeahead
                                id="timezone-selector"
                                onChange={(selectedTz) => {
                                    setUserTz(selectedTz)
                                }}
                                options={moment.tz.names()}
                                placeholder="Choose a timezone..."
                                selected={userTz}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Button
                            variant="primary"
                            className="mt-3"
                            disabled={loading}
                            onClick={async () => saveSettings(userTz[0])}
                        >
                            {loading ? (
                                <Spinner as="span" animation="border" role="status" size="sm">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            ) : (
                                'Save'
                            )}
                        </Button>
                    </Col>
                </Row>
            </Container>
        </Layout>
    )

    async function saveSettings(timeZone: string): Promise<void> {
        setLoading(true)
        setError('')

        // make POST request to the backend to continue save
        // the time zone for the user
        var response = await fetch(`/api/user/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: safeJsonStringify({
                timeZone: timeZone,
            }),
        })

        // if save settings POST call failed, log to console
        if (response.status !== 200) {
            console.log(`save settings failed --> ${response.status} ${response.statusText}`)
            setError(await response.text())
            setLoading(false)
            return
        }

        // here if we were able to save settings
        refreshData()
        setLoading(false)
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

    const settings = JSON.parse(safeJsonStringify(await getSettingsForUser(session.user.id))) as UserSettings | null

    return {
        props: {
            session,
            settings,
        },
    }
}
