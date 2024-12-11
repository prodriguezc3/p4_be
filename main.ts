//Paula Rodriguez Cubas y Sarah Rojas

import { MongoClient, ObjectId } from "mongodb";
import type { Usuario_M, Proyecto_M, Tarea_M } from "./types.ts";
import {
  fromModeltoUsuario,
  fromModeltoProyecto,
  fromModelToTarea,
} from "./utils.ts";

const url = Deno.env.get("MONGO_URL");

if (!url) {
  console.error("Sin conexion");
  Deno.exit(1);
}

const client = new MongoClient(url);
await client.connect();
console.info("Conectado a MongoDB :)");

const DB = client.db("PRAC4-BE");

const UsuarioCollection = DB.collection<Usuario_M>("Usuarios");
const ProyectosCollection = DB.collection<Proyecto_M>("Proyectos");
const TareaCollection = DB.collection<Tarea_M>("Tareas");

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  const searchParam = url.searchParams;

  if (method === "GET") {
    if (path === "/users") {
      const usersDB = await UsuarioCollection.find().toArray();
      const users = usersDB.map((u) => ({
        id: u._id!,
        name: u.name,
        email: u.email,
        created_at: u.created_at,
      }));
      return new Response(JSON.stringify(users), { status: 300 });
    } else if (path === "/projects") {
      const projectsDB = await ProyectosCollection.find().toArray();
      const projectsWithID = projectsDB.filter((p) => p.user_ID);
      const projects = projectsWithID.map(fromModeltoProyecto);
      return new Response(JSON.stringify(projects), { status: 200 });
    } else if (path === "/tasks") {
      const tasksDB = await TareaCollection.find().toArray();
      const tasks = tasksDB.map(fromModelToTarea);
      return new Response(JSON.stringify(tasks), { status: 300 });
    } else if (path === "/tasks/by_project") {
      //Esta consulta no me funciona, supuestamente todo esta bien pero solo me sale [] cuando busco
      const project_Id = url.searchParams.get("project_id");

      if (!project_Id) {
        return new Response(
          "Error 405: ID del proyecto inválido o no proporcionado",
          {
            status: 405,
          }
        );
      }

      const objectId = new ObjectId(project_Id);

      const tasks = await TareaCollection.find({
        project_id: objectId,
      }).toArray();

      return new Response(JSON.stringify(tasks), { status: 300 });
    }
  } else if (method === "POST") {
    if (path === "/users") {
      const user = await req.json();

      if (!user.name || !user.email) {
        return new Response(
          "Error 400 :Debe meter al menos un nombre y un email",
          {
            status: 400,
          }
        );
      }

      const comprobarUserRepetido = await UsuarioCollection.findOne({
        email: user.email,
      });
      if (comprobarUserRepetido) {
        return new Response(
          `Error 402: Ya existe un usuario con el email ${user.email}`,
          {
            status: 402,
          }
        );
      }

      user.created_at = user.created_at || new Date(); //Para crear la fecha

      const { insertedId } = await UsuarioCollection.insertOne(user);

      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          name: user.name,
          email: user.email,
          created_at: user.created_at, //Si no se pone nada no sale
        }),
        { status: 301 }
      );
    } else if (path === "/projects") {
      const project = await req.json();

      if (!project.name || !project.user_ID) {
        return new Response(
          "Error 401: Debe meter al menos un nombre de proyecto y una ID de usuario",
          {
            status: 401,
          }
        );
      }

      const comprobarProjectRepetido = await ProyectosCollection.findOne({
        name: project.name,
      });
      if (comprobarProjectRepetido) {
        return new Response(
          `Error 401: Ya existe un proyecto con el nombre ${project.name}`,
          {
            status: 401,
          }
        );
      }

      project.start_date = project.start_date || new Date(); //Crear la fecha start
      project.end_date = project.end_date || null; //Para crear la fecha end

      const { insertedId } = await ProyectosCollection.insertOne(project);

      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          name: project.name,
          description: project.description,
          start_date: project.start_date,
          end_date: project.end_date,
          user_ID: project.user_ID,
        }),
        { status: 301 }
      );
    } else if (path === "/tasks") {
      const tasks = await req.json();

      if (!tasks.title || !tasks.project_id) {
        return new Response(
          "Error 401: Debe meter al menos un nombre de tarea y una ID de proyecto",
          {
            status: 401,
          }
        );
      }

      if (!tasks.status) {
        //Para poner por defecto el estado pending
        tasks.status = "pending";
      }

      const comprobarTaskRepetida = await TareaCollection.findOne({
        title: tasks.title,
      });
      if (comprobarTaskRepetida) {
        return new Response(
          `Error 401: Ya existe una tarea con el título ${tasks.title}`,
          {
            status: 401,
          }
        );
      }

      tasks.created_at = tasks.created_at || new Date(); //Para crear la fecha
      const { insertedId } = await TareaCollection.insertOne(tasks);

      return new Response(
        JSON.stringify({
          id: insertedId.toString(),
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          created_at: tasks.created_at,
          due_date: tasks.due_date,
          project_id: tasks.project_id,
        }),
        { status: 301 }
      );
    }
  } else if (method === "DELETE") {
    if (path === "/users") {
      const id = searchParam.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({
            error: "Se necesita el ID para eliminar al usuario",
          }),
          { status: 200 }
        );
      }
      const objectId = ObjectId.createFromHexString(id); //Uso esta funcion porque si no me salia deprecated. He buscado referencias en foros resueltos de Stack Overflow
      const user = await UsuarioCollection.findOne({ _id: objectId });

      if (!user) {
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          { status: 404 }
        );
      }

      await UsuarioCollection.deleteOne({ _id: objectId }); //Elimina el user
      return new Response(JSON.stringify({ message: "Usuario eliminado" }), {
        status: 200,
      });
    } else if (path === "/projects") {
      const id = searchParam.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({
            error: "Se necesita el ID para eliminar el proyecto",
          }),
          { status: 200 }
        );
      }

      const objectId = ObjectId.createFromHexString(id);
      const project = await ProyectosCollection.findOne({ _id: objectId });

      if (!project) {
        return new Response(
          JSON.stringify({ error: "Proyecto no encontrado" }),
          { status: 404 }
        );
      }

      await ProyectosCollection.deleteOne({ _id: objectId }); //Eliminamos el projecto
      return new Response(JSON.stringify({ message: "Proyecto eliminado" }), {
        status: 200,
      });
    } else if (path === "/tasks") {
      const id = searchParam.get("id");

      if (!id) {
        return new Response(
          JSON.stringify({
            error: "Se necesita el ID para eliminar la tarea",
          }),
          { status: 200 }
        );
      }

      const objectId = new ObjectId(id);
      const task = await TareaCollection.findOne({ _id: objectId });

      if (!task) {
        return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
          status: 404,
        });
      }

      await TareaCollection.deleteOne({ _id: objectId }); //Se elimina la tarea
      return new Response(JSON.stringify({ message: "Tarea eliminada" }), {
        status: 200,
      });
    }
  }

  return new Response("Endpoint not found", { status: 404 });
};

Deno.serve({ port: 3000 }, handler);
