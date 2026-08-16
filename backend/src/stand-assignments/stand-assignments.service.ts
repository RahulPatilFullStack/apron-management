import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StandAssignment } from './stand-assignment.entity';
import { CreateStandAssignmentDto } from './dto/create-stand-assignment.dto';
import { QueryStandAssignmentDto } from './dto/query-stand-assignment.dto';
import { windowsOverlap } from './overlap';
import { FlightPlan } from '../flight-plans/flight-plan.entity';
import { Stand } from '../stands/stand.entity';

@Injectable()
export class StandAssignmentsService {
  constructor(
    @InjectRepository(StandAssignment)
    private readonly standAssignmentsRepository: Repository<StandAssignment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: QueryStandAssignmentDto): Promise<StandAssignment[]> {
    const qb = this.standAssignmentsRepository
      .createQueryBuilder('sa')
      .leftJoinAndSelect('sa.flightPlan', 'flightPlan')
      .leftJoinAndSelect('sa.stand', 'stand');

    if (query.standId) {
      qb.andWhere('sa.standId = :standId', { standId: query.standId });
    }
    if (query.from) {
      qb.andWhere('sa.toTime > :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('sa.fromTime < :to', { to: query.to });
    }

    qb.orderBy('sa.fromTime', 'ASC');
    return qb.getMany();
  }

  async create(dto: CreateStandAssignmentDto): Promise<StandAssignment> {
    const fromTime = new Date(dto.fromTime);
    const toTime = new Date(dto.toTime);

    return this.dataSource.transaction(async (manager) => {
      const flightPlan = await manager.findOneBy(FlightPlan, {
        id: dto.flightPlanId,
      });
      if (!flightPlan) {
        throw new NotFoundException(`Flight plan ${dto.flightPlanId} not found`);
      }

      const stand = await manager.findOneBy(Stand, { stand: dto.standId });
      if (!stand) {
        throw new NotFoundException(`Stand ${dto.standId} not found`);
      }

      // Lock existing assignments for this stand for the duration of the
      // transaction so two concurrent requests can't both pass the overlap
      // check for the same stand.
      const existing = await manager
        .createQueryBuilder(StandAssignment, 'sa')
        .setLock('pessimistic_write')
        .where('sa.standId = :standId', { standId: dto.standId })
        .getMany();

      const conflict = existing.find((assignment) =>
        windowsOverlap(assignment, { fromTime, toTime }),
      );

      if (conflict) {
        throw new ConflictException(
          `Stand ${dto.standId} already occupied between ${conflict.fromTime.toISOString()} and ${conflict.toTime.toISOString()}`,
        );
      }

      const assignment = manager.create(StandAssignment, {
        flightPlanId: dto.flightPlanId,
        standId: dto.standId,
        fromTime,
        toTime,
        remarks: dto.remarks ?? null,
      });

      return manager.save(assignment);
    });
  }
}
