import mongoose from "mongoose";

export function validateObjectId(request, reply, done) {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return reply.status(400).send({ error: "ID inválido" });
  }

  done();
}
