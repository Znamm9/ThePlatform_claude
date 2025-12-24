import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'QA Automation Platform API',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}
