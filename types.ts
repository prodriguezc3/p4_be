import type { ObjectId, OptionalId } from "mongodb";

//normales
export type Usuario = {
  id: string;
  name: string;
  email: string;
  created_at: Date;
};

export type Proyecto = {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  user_ID: string;
};

export type Tarea = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: Date;
  due_date: Date;
  project_id: string;
};

//models

export type Usuario_M = OptionalId<{
  //_id: ObjectId; -> Lo quitamos pq es redundante con la biblio de OpntionalID ya que lo pasa implicito este "comando"
  name: string;
  email: string;
  created_at: Date;
}>;

export type Proyecto_M = OptionalId<{
  //_id: ObjectId,
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  user_ID: ObjectId;
}>;

export type Tarea_M = OptionalId<{
  //_id: ObjectId,
  title: string;
  description: string;
  status: string;
  created_at: Date;
  due_date: Date;
  project_id: ObjectId;
}>;
