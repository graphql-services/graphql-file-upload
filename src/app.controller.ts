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
} from '@nestjs/common';
import express from 'express';
import { createReadStream } from 'fs';
import * as multer from 'multer';
import { v4 } from 'uuid';

import { AppService } from './app.service';

const multerStorage = multer.diskStorage({
  filename(req, file, cb) {
    cb(null, v4());
  },
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: multerStorage }))
  async uploadFile(
    @UploadedFile() file,
    @Request() req: express.Request,
    @Query() query: { [key: string]: any },
    @Headers('content-length') contentLength: string,
    @Headers('content-type') contentType: string,
  ) {
    let res = null;
    if (contentType.indexOf('multipart/form-data') !== -1) {
      contentType = file.mimetype;
      contentLength = file.size;
      res = await this.appService.uploadFileStream(createReadStream(file.path));
    } else {
      res = await this.appService.uploadFileStream(req);
    }

    const ormRes = await this.appService.saveFile(
      {
        uid: res.id,
        size: contentLength ? parseInt(contentLength, 10) : undefined,
        contentType,
        url: res.url,
      },
      query,
    );

    return ormRes.file;
  }

  @Get('/upload')
  async uploadInfo() {
    return 'user POST method to upload file';
  }

  @Get('/:id')
  async getFile(@Param('id') id, @Response() res: express.Response) {
    const meta = await this.appService.getFileStream(id);

    res.setHeader('content-type', meta.file.contentType);
    res.setHeader('content-length', meta.file.size);

    meta.stream.pipe(res);
  }
}
