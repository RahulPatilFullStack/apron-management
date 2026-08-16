import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { FlightPlan } from './flight-plan.entity';
import { CreateFlightPlanDto } from './dto/create-flight-plan.dto';
import { UpdateFlightPlanDto } from './dto/update-flight-plan.dto';
import { QueryFlightPlanDto } from './dto/query-flight-plan.dto';

@Injectable()
export class FlightPlansService {
  constructor(
    @InjectRepository(FlightPlan)
    private readonly flightPlansRepository: Repository<FlightPlan>,
  ) {}

  async findAll(query: QueryFlightPlanDto): Promise<FlightPlan[]> {
    const qb = this.flightPlansRepository.createQueryBuilder('fp');

    if (query.search) {
      const term = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(fp.calculatedCallsign) LIKE :term', { term })
            .orWhere('LOWER(fp.carrier) LIKE :term', { term })
            .orWhere('LOWER(fp.flightNumber) LIKE :term', { term })
            .orWhere('LOWER(fp.adep) LIKE :term', { term })
            .orWhere('LOWER(fp.ades) LIKE :term', { term });
        }),
      );
    }

    if (query.flightPlanType) {
      qb.andWhere('fp.flightPlanType = :type', { type: query.flightPlanType });
    }

    if (query.originDateFrom) {
      qb.andWhere('fp.originDate >= :from', { from: query.originDateFrom });
    }

    if (query.originDateTo) {
      qb.andWhere('fp.originDate <= :to', { to: query.originDateTo });
    }

    qb.orderBy('fp.originDate', 'DESC')
      .addOrderBy('fp.id', 'DESC')
      .take(query.limit ?? 100)
      .skip(query.offset ?? 0);

    return qb.getMany();
  }

  async findOne(id: number): Promise<FlightPlan> {
    const flightPlan = await this.flightPlansRepository.findOneBy({ id });
    if (!flightPlan) {
      throw new NotFoundException(`Flight plan ${id} not found`);
    }
    return flightPlan;
  }

  /**
   * "Linked" group resolution.
   *
   * Inspecting the sample data shows `linkedFlightId` on a child plan (e.g. a
   * TowOutMovement) points to the **`ifplid` of its originating Arrival**,
   * not to another plan's `linkedFlightId`. The Arrival plan itself has
   * `linkedFlightId: null`. So a naive "same linkedFlightId" match would
   * find the sibling tow movements but miss the arrival they both link back
   * to. The rule used here: resolve a "root" identifier for the group
   * (`linkedFlightId` if present, else the plan's own `ifplid`), then return
   * every flight plan whose `ifplid` equals that root, or whose
   * `linkedFlightId` equals that root — plus the queried plan itself.
   */
  async findLinked(id: number): Promise<FlightPlan[]> {
    const flightPlan = await this.findOne(id);
    const rootId = flightPlan.linkedFlightId ?? flightPlan.ifplid;

    if (!rootId) {
      return [flightPlan];
    }

    const linked = await this.flightPlansRepository
      .createQueryBuilder('fp')
      .where('fp.ifplid = :rootId', { rootId })
      .orWhere('fp.linkedFlightId = :rootId', { rootId })
      .orderBy('fp.created', 'ASC')
      .getMany();

    if (!linked.some((plan) => plan.id === flightPlan.id)) {
      linked.push(flightPlan);
    }

    return linked;
  }

  async create(dto: CreateFlightPlanDto): Promise<FlightPlan> {
    const entity = this.flightPlansRepository.create(dto);
    return this.flightPlansRepository.save(entity);
  }

  async update(id: number, dto: UpdateFlightPlanDto): Promise<FlightPlan> {
    const flightPlan = await this.findOne(id);
    Object.assign(flightPlan, dto);
    return this.flightPlansRepository.save(flightPlan);
  }
}
