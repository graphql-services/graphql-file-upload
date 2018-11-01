import fetch from 'node-fetch';
import { Injectable, HttpException } from '@nestjs/common';
import { v4 } from 'uuid';
import * as FileStorage from 'file-storage';
import { resolve } from 'url';

import { ENV } from 'env';

const storage = new FileStorage(ENV.FILESTORAGE_URL || 's3://adf');

interface FileType {
  uid: string;
  size: number;
  contentType: string;
  url: string;
  name?: string;
}

@Injectable()
export class AppService {
  async uploadFileStream(req: any): Promise<{ id: string; url: string }> {
    const uuid = v4();
    const { id } = await storage.saveStream(req, uuid);
    const url = resolve(ENV.HOST_URL, id);
    return { id, url };
  }

  private getDataFromGraphQLResponse(response: any): any {
    const data = response.data;
    if (!data) {
      return null;
    }
    const firstKey = Object.keys(data)[0];
    return firstKey ? data[firstKey] : null;
  }

  async saveFile(
    file: FileType,
    args?: { [key: string]: string },
    headers?: { [key: string]: string },
  ): Promise<{ file: FileType }> {
    const res = await fetch(ENV.GRAPHQL_URL, {
      method: 'POST',
      headers: { ...(headers || {}), 'content-type': 'application/json' },
      body: JSON.stringify({
        query: ENV.GRAPHQL_UPLOAD_MUTATION,
        variables: { input: Object.assign({}, file, args) },
      }),
    });

    if (res.status !== 200) {
      const text = await res.text();
      throw new HttpException(
        `failed to create file, response: ${text}`,
        res.status,
      );
    }

    const json = await res.json();
    return { file: this.getDataFromGraphQLResponse(json) };
  }

  async getFileStream(id: string): Promise<{ file: FileType; stream: any }> {
    const res = await fetch(ENV.GRAPHQL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: ENV.GRAPHQL_FETCH_QUERY,
        variables: { uid: id },
      }),
    });

    if (res.status !== 200) {
      const text = await res.text();
      throw new HttpException(
        `failed to fetch file, response: ${text}`,
        res.status,
      );
    }

    const json = await res.json();
    const file = this.getDataFromGraphQLResponse(json);

    return { stream: await storage.getStream(id), file };
  }
}
