import fetch, { Response } from 'node-fetch';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import * as FileStorage from 'file-storage';
import { resolve } from 'url';

import { ENV } from 'env';

const storage = new FileStorage(ENV.FILESTORAGE_URL || 's3://adf');

@Injectable()
export class AppService {
  async uploadFileStream(req: any): Promise<{ id: string; url: string }> {
    const uuid = v4();
    const { id } = await storage.saveStream(req, uuid);
    const url = resolve(ENV.HOST_URL, id);
    return { id, url };
  }

  async saveFile(
    file: {
      uid: string;
      size: number;
      contentType: string;
      url: string;
    },
    args?: { [key: string]: string },
  ): Promise<Response> {
    const res = await fetch(ENV.GRAPHQL_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `mutation createFile($input: FileCreateInputType) { createFile(input:$input) { id }}`,
        variables: { input: Object.assign({}, args, file) },
      }),
    });

    if (res.status !== 200) {
      throw new Error(`failed to create file, status code ${res.status}`);
    }

    return res;
  }

  async getFileStream(id: string): Promise<any> {
    return storage.getStream(id);
  }
}
