import getRawBody from "raw-body"
// import schema from "@lib/graphql.schema"
import type { NextApiRequest, NextApiResponse } from "next"
import { ApolloServer } from "apollo-server-micro"
import "reflect-metadata";
import { buildSchema, Resolver, Query, Arg, ObjectType, Field,ID } from "type-graphql";


@ObjectType()
export class Dog {
  @Field(() => ID)
  name: string;
}

@Resolver(Dog)
export class DogResolver {
@Query(() => [Dog])
dogs(): Dog[] {
  return [{ name: "test" }];
 }
}

const schema = await buildSchema({
  resolvers: [DogResolver],
});


const getApolloServer = (async () => {
  const apolloServer = new ApolloServer({ cache: "bounded", schema })
  await apolloServer.start()
  return apolloServer
})()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // if (req.method !== "GET" && req.method !== "POST") {
  //   return res.status(404).end()
  // }


  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");


  // Next.js v13.3.0 in dev mode sends POST requests to API routes in chunked encoding. The apollo-server-micro v3
  // package does not understand how to read the GraphQL query from chunked requests. The code can be found in
  // microApollo.ts -> graphqlMicro() -> graphqlHandler(). The request must have a regular body with content-length set
  // or a special property called "filePayload" can be set with the query object as a workaround.
  if (req.headers["transfer-encoding"] === "chunked") {
    ;(req as any).filePayload = JSON.parse((await getRawBody(req)).toString())
  }

  const apolloServer = await getApolloServer
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res)
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}


