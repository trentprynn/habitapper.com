import { withSwagger } from 'next-swagger-doc'

const swaggerHandler = withSwagger({
    openApiVersion: '3.0.0',
    title: 'HabiTapper API Documentation',
    version: '0.1.0',
    apiFolder: 'pages/api',
})
export default swaggerHandler()