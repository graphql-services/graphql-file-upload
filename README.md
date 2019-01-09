# graphql-file-upload

[![Build Status](https://travis-ci.org/graphql-services/graphql-file-upload.svg?branch=master)](https://travis-ci.org/graphql-services/graphql-file-upload)

File upload microservice with GraphQL connector.

Files are uploaded using `POST /upload` as binary and downloaded using `GET /:id`.

## Docker usage

```
# docker-compose.yml
version: '2'
services:
  file-uploader:
    image: graphql/file-upload
    ports:
      - 3000:80
    environment:
      # url for sending createFile mutation
      - GRAPHQL_URL: http://api.example.com/graphql
      # for more options see https://www.npmjs.com/package/file-storage
      - FILESTORAGE_URL: s3://asdadf:adfdf@bucket_name?region=us-east-1
      # hostname for full url path
      - HOST_URL: http://files.example.com
```

## GraphQL connection

### Uploading file

Each time the file is uploaded to `POST /upload` graphql createFile mutation is sent to `GRAPHQL_URL`.

GraphQL mutation has following format:

```
# you can use your query GRAPHQL_UPLOAD_MUTATION:
mutation createFile($input: FileRawCreateInput!) {
    createFile(input:$input) {
        id
        uid
        size
        contentType
        url
    }
}

# variables:
{
    "input": {
        "uid": "abcdefafdsdfs",
        "size": 123, # from request.headers['content-length']
        "contentType": "image/jpg", # from request.headers['content-type']
        "url": "http://files.example.com/abcdefafdsdfs"
    }
}
```

You can also add input variables using query string:

```
# POST /upload?blah=foo => variables:
{
    "input": {
        "blah":"foo",
        "uid": "abcdefafdsdfs",
        "size": 123, # from request.headers['content-length']
        "contentType": "image/jpg", # from request.headers['content-type']
        "url": "http://files.example.com/abcdefafdsdfs"
    }
}
```

### Fetching file

Each time the file is fetch from `GET /:id` graphql file query is sent to `GRAPHQL_URL`.

GraphQL query has following format:

```
# you can use your query GRAPHQL_FETCH_QUERY:
query file($uid: ID) {
    file(filter: { uid: $uid }) {
        uid
        size
        contentType
    }
}

# variables:
{
    "uid": "abcdefafdsdfs"
}
```
