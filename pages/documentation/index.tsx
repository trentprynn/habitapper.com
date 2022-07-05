import Layout from 'components/layout/layout'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import dynamic from 'next/dynamic'
import { Container } from 'react-bootstrap'
import 'swagger-ui-react/swagger-ui.css'

// @ts-ignore
const SwaggerUI = dynamic<{ spec: Record<string, any> }>(import('swagger-ui-react'), { ssr: false })

function ApiDoc({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <Layout>
            <Container>
                <SwaggerUI spec={spec} />
            </Container>
        </Layout>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const spec: Record<string, any> = createSwaggerSpec({
        apiFolder: 'pages/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'HabiTapper API Documentation',
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

export default ApiDoc
