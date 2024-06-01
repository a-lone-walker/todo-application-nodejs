let express = require("express");
let path = require("path");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let app = express();
app.use(express.json());
let dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Listening to port 3000");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
  }
};

initializeDbAndServer();

//API 1
app.get("/todos/", async (request, response) => {
  try {
    let { status, priority, search_q } = request.query;
    if (status !== undefined && priority !== undefined) {
      status = status.replace("%20", " ");
      let query = `
            SELECT *
            FROM todo 
            WHERE status = ?, priority = ?`;
      let dbResponse = await db.all(query, [status, priority]);
      response.send(dbResponse);
    }
    if (status !== undefined) {
      status = status.replace("%20", " ");
      let query = `
            SELECT *
            FROM todo 
            WHERE status = ?`;
      let dbResponse = await db.all(query, [status]);
      response.send(dbResponse);
    }
    if (priority !== undefined) {
      let query = `
            SELECT *
            FROM todo 
            WHERE priority = ?`;
      let dbResponse = await db.all(query, [priority]);
      response.send(dbResponse);
    }
    if (search_q !== undefined) {
      let query = `
            SELECT *
            FROM todo 
            WHERE todo LIKE '%${search_q}%'`;
      let dbResponse = await db.all(query);
      response.send(dbResponse);
    }
  } catch (error) {
    console.log(`API 1: ${error}`);
  }
});

//API 2
app.get("/todo/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let query = `
        SELECT * FROM todo
        WHERE id = ?;`;
    let dbResponse = await db.get(query, [todoId]);
    response.send(dbResponse);
  } catch (error) {
    console.log(`API 2: ${error}`);
  }
});

//API 3
app.post("/todos/", async (request, response) => {
  try {
    let { id, todo, priority, status } = request.body;
    let query = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES(?,?,?,?)`;
    let dbResponse = await db.run(query, [id, todo, priority, status]);
    response.send("Todo Successfully Added");
  } catch (error) {
    console.log(`API 3: ${error}`);
  }
});

//API 4
app.put("/todo/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let { status, priority } = request.body;
    if (priority !== undefined) {
      let query = `
        UPDATE todo 
        SET status = ?
        WHERE id = ?`;
      let dbResponse = await db.get(query, [status, todoId]);
      response.send("Status Updated");
    }
    if (status !== undefined) {
      let query = `
        UPDATE todo 
        SET status = "DONE"
        WHERE id = ?`;
      let dbResponse = await db.get(query, [priority, todoId]);
      response.send("Priority Updated");
    }
  } catch (error) {
    console.log(`API 4: ${error}`);
  }
});

//API 5
app.delete("/todo/:todoId/", async (request, response) => {
  try {
    let { todoId } = request.params;
    let query = `
        DELETE FROM todo
        WHERE id = ?`;
    let dbResponse = await db.run(query, [todoId]);
    response.send("Todo Deleted");
  } catch (error) {
    console.log(`API 5: ${error}`);
  }
});

module.exports = app;
