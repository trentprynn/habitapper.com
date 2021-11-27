import Layout from 'components/layout/layout'
import { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createSwaggerSpec } from 'next-swagger-doc'
import Link from 'next/link'
import { Button } from 'react-bootstrap'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <Layout title="HabiTapper Docs">
            <Link href="/" passHref>
                <Button className="m-1" variant="primary">
                    Back
                </Button>
            </Link>
            <SwaggerUI spec={spec} />
        </Layout>
    )
}
export default ApiDoc

export const getStaticProps: GetStaticProps = async (ctx) => {
    const spec: Record<string, any> = createSwaggerSpec({
        title: 'HabiTapper API Documentation',
        version: '0.1.0',
    })
    return {
        props: {
            spec,
        },
    }
}
