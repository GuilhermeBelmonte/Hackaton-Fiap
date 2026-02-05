import { Prova } from "../models/Prova.model.js";

export class ProvaRepository {
  async findAll() {
    return await Prova.find().sort({ createdAt: -1 });
  }

  async findPaginated(skip, limit) {
    return await Prova.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  async count() {
    return await Prova.countDocuments();
  }

  async findById(id) {
    return await Prova.findById(id);
  }

  async create(provaData) {
    const novaProva = new Prova(provaData);
    return await novaProva.save();
  }

  async update(id, updateData) {
    return await Prova.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Prova.findByIdAndDelete(id);
  }
}

export default new ProvaRepository();
