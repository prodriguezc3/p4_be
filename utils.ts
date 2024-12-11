import type { Collection, ObjectId } from "mongodb";
import type {
  Usuario,
  Usuario_M,
  Proyecto,
  Proyecto_M,
  Tarea,
  Tarea_M,
} from "./types.ts";

export const fromModeltoUsuario = (user: Usuario_M): Usuario => ({
  id: user._id!.toString(),
  name: user.name,
  email: user.email,
  created_at: user.created_at,
});

export const fromModeltoProyecto = (proyecto: Proyecto_M): Proyecto => ({
  id: proyecto._id!.toString(),
  name: proyecto.name,
  description: proyecto.description,
  start_date: proyecto.start_date,
  end_date: proyecto.end_date,
  user_ID: proyecto.user_ID!.toString(), //Es string() porque es optionalID
});

export const fromModelToTarea = (tarea: Tarea_M): Tarea => ({
  id: tarea._id!.toString(),
  title: tarea.title,
  description: tarea.description,
  status: tarea.status,
  created_at: tarea.created_at,
  due_date: tarea.due_date,
  project_id: tarea.project_id.toString(),
});
