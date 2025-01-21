const { Client } = require('pg')

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'todo',
    password: 'root',
    port: 5432
})

// Initialize connection
const initializeDatabase = async () => {
    try {
        await client.connect()
        console.log("Connected to database")

        // Create table
        await client.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                task_id SERIAL PRIMARY KEY,
                task_name VARCHAR(255) NOT NULL,
                task_create_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                task_status VARCHAR(255) NOT NULL
            )
        `)
        console.log("Table created or already exists")

        return true
    } catch (error) {
        console.error("Database initialization error:", error)
        throw error
    }
}

// Initialize the database when this module is imported
initializeDatabase()
    .catch(error => {
        console.error("Failed to initialize database:", error)
        process.exit(1)
    })

// Export the connected client
module.exports = client