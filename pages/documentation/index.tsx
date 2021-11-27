import Layout from 'components/layout/layout'
import Link from 'next/link'
import { Button } from 'react-bootstrap'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs() {
    return (
        <Layout>
            <Link href="/" passHref>
                <Button className="m-1" variant="primary">
                    Back
                </Button>
            </Link>
            <SwaggerUI url={`${process.env.NEXT_PUBLIC_URL}/api/open-api`} />
        </Layout>
    )
}
