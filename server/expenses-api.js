const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { sql, poolConnect } = require('./db')
const app = express()
const port = 3001

app.use(cors())
app.use(bodyParser.json())

// 获取所有费用
app.get('/api/expenses', async (req, res) => {
  await poolConnect
  try {
    const result = await sql.query`SELECT * FROM A_Expenses`
    res.json(result.recordset)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 新增费用
app.post('/api/expenses', async (req, res) => {
  await poolConnect
  const { Room_ID, Customer_ID, ExpItem_ID, FDate, Amount, ZnjAmount, ZnjBeginDate, ZnjEndDate, EndAmount, Note } = req.body
  try {
    const result = await sql.query`
      INSERT INTO A_Expenses (Room_ID, Customer_ID, ExpItem_ID, FDate, Amount, ZnjAmount, ZnjBeginDate, ZnjEndDate, EndAmount, Note)
      OUTPUT INSERTED.Id
      VALUES (${Room_ID}, ${Customer_ID}, ${ExpItem_ID}, ${FDate}, ${Amount}, ${ZnjAmount}, ${ZnjBeginDate}, ${ZnjEndDate}, ${EndAmount}, ${Note})
    `
    res.json({ Id: result.recordset[0].Id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 更新费用
app.put('/api/expenses/:id', async (req, res) => {
  await poolConnect
  const { Room_ID, Customer_ID, ExpItem_ID, FDate, Amount, ZnjAmount, ZnjBeginDate, ZnjEndDate, EndAmount, Note } = req.body
  try {
    const result = await sql.query`
      UPDATE A_Expenses SET
        Room_ID=${Room_ID},
        Customer_ID=${Customer_ID},
        ExpItem_ID=${ExpItem_ID},
        FDate=${FDate},
        Amount=${Amount},
        ZnjAmount=${ZnjAmount},
        ZnjBeginDate=${ZnjBeginDate},
        ZnjEndDate=${ZnjEndDate},
        EndAmount=${EndAmount},
        Note=${Note}
      WHERE Id=${req.params.id}
    `
    res.json({ changes: result.rowsAffected[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 删除费用
app.delete('/api/expenses/:id', async (req, res) => {
  await poolConnect
  try {
    const result = await sql.query`DELETE FROM A_Expenses WHERE Id=${req.params.id}`
    res.json({ changes: result.rowsAffected[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(port, () => {
  console.log(`Expenses API server running at http://192.168.1.10:${port}`)
})
