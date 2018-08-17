# graphql-file-upload

File upload microservice with GraphQL connector.

Files are uploaded using `POST /upload` as binary and downloaded using `GET /:id`.

## Docker usage

```
# docker-compose.yml
version: '2'
services:
  file-uploader:
    image: graphql/file-upload
    environment:
      # url for sending createFile mutation
      - GRAPHQL_URL: http://api.example.com/graphql
      # for more options see https://www.npmjs.com/package/file-storage
      - FILESTORAGE_URL: s3://asdadf:adfdf@bucket_name?region=us-east-1
      # hostname for full url path
      - HOST_URL: http://files.example.com
```

## GraphQL connection

Each time the file is uploaded to `POST /upload` graphql createFile mutation is sent to `GRAPHQL_URL`.

GraphQL mutation has following format:

```
# query:
mutation createFile($input: FileCreateInputType) {
    createFile(input:$input) {
        id
    }
}

# variables:
{
    "input": {
        uid: "abcdefafdsdfs",
        size: 123, # from request.headers['content-length']
        contentType: "image/jpg", # from request.headers['content-type']
        url: "http://files.example.com/abcdefafdsdfs"
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
