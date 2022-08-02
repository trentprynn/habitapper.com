import { withSwagger } from 'next-swagger-doc'

const openApiSpec = withSwagger({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HabiTapper API Documentation',
            version: '0.1.0',
        },
    },
    apiFolder: 'pages/api',
})

export default openApiSpec()
