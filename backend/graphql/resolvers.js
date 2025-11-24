const { GraphQLUpload } = require("graphql-upload-minimal");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const JSONType = require("graphql-type-json");

module.exports = {
  Upload: GraphQLUpload,
  JSON: JSONType,

  Query: {
    verification: async (_, { id }, { prisma }) =>
      prisma.verification.findUnique({ where: { id: Number(id) } }),

    recentVerifications: async (_, { limit = 10 }, { prisma }) =>
      prisma.verification.findMany({
        orderBy: { created_at: "asc" },
        take: limit
      })
  },

  Mutation: {
    verifyID: async (_, { front }, { prisma }) => {
      const { createReadStream, filename } = await front;

      const uploadDir = path.join(__dirname, "..", "tmp");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const filePath = path.join(uploadDir, `${Date.now()}_${filename}`);
      const stream = createReadStream().pipe(fs.createWriteStream(filePath));

      await new Promise((resolve, reject) => {
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      const form = new FormData();
      form.append("id_card_front", fs.createReadStream(filePath));

      const pythonURL =
        process.env.PYTHON_SERVICE_URL || "http://localhost:8001/verify-front";

      let data;
      try {
        const res = await axios.post(pythonURL, form, {
          headers: form.getHeaders(),
          timeout: 120000
        });
        data = res.data;
      } catch (err) {
        throw new Error("Python verification failed: " + err.message);
      }

      fs.unlinkSync(filePath);

      const saved = await prisma.verification.create({
        data: {
          verdict: data.verdict,
          parsed_id_data: data.parsed_id_data,
          raw_json: data
        }
      });

      return {
        id: saved.id,
        verdict: saved.verdict,
        parsed_id_data: saved.parsed_id_data,
        raw_json: saved.raw_json,
        created_at: saved.created_at.toISOString()
      };
    }
  }
};
