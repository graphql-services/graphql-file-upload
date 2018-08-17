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

    await this.appService.saveFile(
      {
        uid: res.id,
        size: contentLength ? parseInt(contentLength, 10) : undefined,
        contentType,
        url: res.url,
      },
      query,
    );

    return res;
  }

  @Get('/:id')
  async getFile(@Param('id') id, @Response() res) {
    return 'aaa';
    // const stream = await this.appService.getFileStream(id);
    // stream.pipe(res);
  }
}
