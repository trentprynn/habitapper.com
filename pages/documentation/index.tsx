import Layout from 'components/layout/layout'
import { createSwaggerSpec } from 'next-swagger-doc'
import { Container } from 'react-bootstrap'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocs({ spec }: { spec: Record<string, any> }) {
    return (
        <Layout>
            <Container>
                <SwaggerUI spec={spec} />
            </Container>
        </Layout>
    )
}

export async function getStaticProps() {
    const spec: Record<string, any> = createSwaggerSpec({
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'NextJS Swagger',
                version: '0.1.0',
            },
        },
    })

    return {
        props: {
            spec,
        },
    }
}
