import api from "../config/api";

export const examService = {
  async getAllExams() {
    const response = await api.get("/provas");
    return response.data;
  },

  async getExamById(id) {
    const response = await api.get(`/provas/${id}`);
    return response.data;
  },

  async createExam(examData) {
    const response = await api.post("/provas", examData);
    return response.data;
  },

  async generateExam(generationData) {
    const response = await api.post("/provas/gerar", generationData);
    return response.data;
  },

  async updateExam(id, examData) {
    const response = await api.put(`/provas/${id}`, examData);
    return response.data;
  },

  async deleteExam(id) {
    const response = await api.delete(`/provas/${id}`);
    return response.data;
  },

  getStudentPdfUrl(id) {
    return `http://localhost:3333/provas/${id}/pdf/aluno`;
  },

  getTeacherPdfUrl(id) {
    return `http://localhost:3333/provas/${id}/pdf/professor`;
  },

  async downloadPdf(url) {
    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao baixar PDF");
    }

    const blob = await response.blob();
    return blob;
  },
};
