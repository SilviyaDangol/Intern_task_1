const express = require('express');
const cors = require('cors');
const client = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/',(req, res)=>{
    res.send('sup');
});

// Get all tasks
// app.get('/get_task', async (req, res) => {
//     try {
//         const result = await client.query('SELECT * FROM tasks ORDER BY task_create_date DESC');
//         res.json(result.rows);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Failed to get tasks' });
//     }
// });

// Add new task
app.post('/set_task', async (req, res) => {
    const { task } = req.body;
    try {
        const result = await client.query(
            `INSERT INTO tasks (task_name, task_status)
             VALUES ($1, 'incomplete')
                 RETURNING *`,
            [task]
        );

        res.json({
            success: true,
            message: 'Task added successfully',
            task: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to set task' });
    }
});

// Update task status
app.post('/update_status', async (req, res) => {
    const { taskId, status } = req.body;
    try {
        const result = await client.query(
            `UPDATE tasks 
             SET task_status = $1 
             WHERE task_id = $2 
             RETURNING *`,
            [status, taskId]
        );
        res.json({
            success: true,
            task: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task status' });
    }
});

// Delete task
app.post('/delete_task', async (req, res) => {
    const { taskId } = req.body;
    try {
        await client.query('DELETE FROM tasks WHERE task_id = $1', [taskId]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.post('/search_task', async (req, res) => {
    const { searchTerm } = req.body;
    try {
        let result = null;
        if (!searchTerm) {
            result = await client.query(`SELECT * FROM tasks WHERE task_status='incomplete' ORDER BY task_create_date DESC`);
            res.json(result.rows);
            return;
        }
        result = await client.query(
            `SELECT * FROM tasks
             WHERE task_name LIKE $1
             ORDER BY task_create_date DESC`,
            [`%${searchTerm}%`]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to search tasks' });
    }
});

app.listen(3000, ()=>{
    console.log(`Example app listening on port 3000`)
});