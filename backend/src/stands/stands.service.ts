import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stand } from './stand.entity';

@Injectable()
export class StandsService {
  constructor(
    @InjectRepository(Stand)
    private readonly standsRepository: Repository<Stand>,
  ) {}

  findAll(): Promise<Stand[]> {
    return this.standsRepository.find({ order: { stand: 'ASC' } });
  }

  async findOne(stand: string): Promise<Stand> {
    const found = await this.standsRepository.findOneBy({ stand });
    if (!found) {
      throw new NotFoundException(`Stand ${stand} not found`);
    }
    return found;
  }
}
