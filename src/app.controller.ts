import {
  Controller,
  Post,
  Request,
  Get,
  Param,
  Response,
  Query,
  Header,
  UploadedFile,
  UseInterceptors,
  FileInterceptor,
  Headers,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import express from 'express';
import { createReadStream, access } from 'fs';
import * as multer from 'multer';
import { v4 } from 'uuid';

import { AppService } from './app.service';
import { log } from 'logger';

const multerStorage = multer.diskStorage({
  filename(req, file, cb) {
    cb(null, v4());
  },
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/healthcheck')
  async healthcheck(): Promise<string> {
    return 'OK';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: multerStorage }))
  async uploadFile(
    @UploadedFile() file,
    @Request() req: express.Request,
    @Query() query: { [key: string]: any },
    @Headers('content-length') contentLength: string,
    @Headers('content-type') contentType: string,
    @Headers('authorization') authorizationHeader?: string,
  ) {
    let res = null;
    let name;
    if (contentType.indexOf('multipart/form-data') !== -1) {
      contentType = file.mimetype;
      contentLength = file.size;
      name = file.originalname;
      log(`starting upload from filepath ${file.path}`);
      res = await this.appService.uploadFileStream(createReadStream(file.path));
      log(`finished upload from filepath ${file.path}`);
    } else {
      log(`starting upload from request stream`);
      res = await this.appService.uploadFileStream(req);
      log(`finished upload from request stream`);
    }

    const data = {
      uid: res.id,
      size: contentLength ? parseInt(contentLength, 10) : undefined,
      contentType,
      url: res.url,
      name,
    };
    log(`saving file, input:`, JSON.stringify(data));
    const ormRes = await this.appService.saveFile(data, query, {
      authorization: authorizationHeader,
    });
    log(`saved file, result:`, JSON.stringify(ormRes.file));

    return ormRes.file;
  }

  @Get('/upload')
  async uploadInfo() {
    return 'user POST method to upload file';
  }

  @Get('/:id')
  async getFile(
    @Param('id') id,
    @Response() res: express.Response,
    @Headers('authorization') authorization?: string,
    @Query('access_token') accessToken?: string,
  ) {
    try {
      if (accessToken) {
        authorization = `Bearer ${accessToken}`;
      }

      const meta = await this.appService.getFileStream(id, { authorization });

      res.setHeader('content-type', meta.file.contentType);
      res.setHeader('content-length', meta.file.size);

      meta.stream.pipe(res);
    } catch (err) {
      if (err.code === 'NoSuchKey') {
        throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
