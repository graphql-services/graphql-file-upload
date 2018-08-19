import {
  Controller,
  Post,
  Request,
  Get,
  Param,
  Response,
  Query,
  Header,
  Headers,
} from '@nestjs/common';
import express from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  async uploadFile(
    @Request() req: express.Request,
    @Query() query: { [key: string]: any },
    @Headers('content-length') contentLength: string,
    @Headers('content-type') contentType: string,
  ) {
    const res = await this.appService.uploadFileStream(req);

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

  @Get('/:id')
  async getFile(@Param('id') id, @Response() res: express.Response) {
    const meta = await this.appService.getFileStream(id);

    res.setHeader('content-type', meta.file.contentType);
    res.setHeader('content-length', meta.file.size);

    meta.stream.pipe(res);
  }
}
