import { Controller, Get } from '@nestjs/common';
import { StandsService } from './stands.service';

@Controller('stands')
export class StandsController {
  constructor(private readonly standsService: StandsService) {}

  @Get()
  findAll() {
    return this.standsService.findAll();
  }
}
