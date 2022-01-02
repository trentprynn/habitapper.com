import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from 'react-bootstrap'

export default function Nav({ session }: { session: Session | null }) {
    const router = useRouter()

    if (session === null) {
        return (
            <div>
                <Link href="/" passHref>
                    <Button className="m-1">Log In</Button>
                </Link>
            </div>
        )
    }

    return (
        <div>
            <p>Signed in as {session.user.email}</p>
            <Button
                className="m-1"
                onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_URL}/api/auth/logout` })}
            >
                Sign out
            </Button>
            {router.pathname !== '/habits' && (
                <Link href="/habits" passHref>
                    <Button className="m-1" variant="secondary">
                        Habits
                    </Button>
                </Link>
            )}
            {router.pathname !== '/user/settings' && (
                <Link href="/user/settings" passHref>
                    <Button className="m-1" variant="secondary">
                        Settings
                    </Button>
                </Link>
            )}
        </div>
    )
}
