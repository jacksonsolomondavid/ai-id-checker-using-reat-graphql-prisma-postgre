require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { graphqlUploadExpress } = require("graphql-upload-minimal");
const fs = require("fs");
const path = require("path");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});


const typeDefs = fs.readFileSync(
  path.join(__dirname, "graphql", "schema.graphql"),
  "utf8"
);
const resolvers = require("./graphql/resolvers");

async function startServer() {
  const app = express();

  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 1 }));

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ prisma, req })
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  );
}

startServer();
