import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";


const uploadLink = createUploadLink({
uri: "http://localhost:4000/graphql",
credentials: 'same-origin'
});


const client = new ApolloClient({
link: uploadLink,
cache: new InMemoryCache()
});


export default client;