import { config } from 'dotenv';

config({});

interface IENV {
  PORT: string;
  GRAPHQL_URL: string;
  FILESTORAGE_URL: string;
  HOST_URL: string;
  GRAPHQL_UPLOAD_MUTATION: string;
  GRAPHQL_FETCH_QUERY: string;
}

export const ENV: IENV = process.env as any;

ENV.GRAPHQL_UPLOAD_MUTATION =
  ENV.GRAPHQL_UPLOAD_MUTATION ||
  `mutation createFile($input: FileRawCreateInput!) {
  createFile(input:$input) {
      id
      uid
      size
      contentType
      url
  }
}`;

ENV.GRAPHQL_FETCH_QUERY =
  ENV.GRAPHQL_FETCH_QUERY ||
  `query file($uid: ID) {
  file(filter: { uid: $uid }) {
      id
      uid
      size
      contentType
  }
}`;
