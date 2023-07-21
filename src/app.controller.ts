import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import WebHookDto from './dtos/WebHook.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/revalidate')
  async revalidate(@Body() body: WebHookDto): Promise<string> {
    const ips = await this.appService.getSrvEndpoints();
    this.appService.callNextRevalidate(ips, body);
    return 'OK';
  }
}
