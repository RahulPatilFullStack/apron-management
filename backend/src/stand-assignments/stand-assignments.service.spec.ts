import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { StandAssignmentsService } from './stand-assignments.service';
import { StandAssignment } from './stand-assignment.entity';
import { FlightPlan } from '../flight-plans/flight-plan.entity';
import { Stand } from '../stands/stand.entity';

describe('StandAssignmentsService', () => {
  const flightPlan = { id: 1 } as FlightPlan;
  const stand = { stand: 'F70' } as Stand;

  const existingAssignment = {
    id: 1,
    standId: 'F70',
    flightPlanId: 2,
    fromTime: new Date('2026-03-06T10:00:00Z'),
    toTime: new Date('2026-03-06T12:00:00Z'),
    remarks: null,
  } as StandAssignment;

  function buildManager(existing: StandAssignment[]) {
    const findOneBy = jest.fn((entity: unknown, criteria: { id?: number; stand?: string }) => {
      if (entity === FlightPlan) {
        return Promise.resolve(criteria.id === flightPlan.id ? flightPlan : null);
      }
      if (entity === Stand) {
        return Promise.resolve(criteria.stand === stand.stand ? stand : null);
      }
      return Promise.resolve(null);
    });

    const qb = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(existing),
    };

    return {
      findOneBy,
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      create: jest.fn((_entity, data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 99, ...data })),
    };
  }

  async function buildService(existing: StandAssignment[]) {
    const manager = buildManager(existing);
    const dataSource = {
      transaction: jest.fn((cb: (m: unknown) => unknown) => cb(manager)),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        StandAssignmentsService,
        { provide: getRepositoryToken(StandAssignment), useValue: {} },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    return moduleRef.get(StandAssignmentsService);
  }

  it('creates an assignment when there is no overlap', async () => {
    const service = await buildService([existingAssignment]);

    const result = await service.create({
      flightPlanId: 1,
      standId: 'F70',
      fromTime: '2026-03-06T13:00:00Z',
      toTime: '2026-03-06T14:00:00Z',
    });

    expect(result).toMatchObject({ flightPlanId: 1, standId: 'F70' });
  });

  it('rejects an assignment that overlaps an existing one', async () => {
    const service = await buildService([existingAssignment]);

    await expect(
      service.create({
        flightPlanId: 1,
        standId: 'F70',
        fromTime: '2026-03-06T11:00:00Z',
        toTime: '2026-03-06T11:30:00Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFoundException when the flight plan does not exist', async () => {
    const service = await buildService([]);

    await expect(
      service.create({
        flightPlanId: 999,
        standId: 'DOES_NOT_EXIST',
        fromTime: '2026-03-06T13:00:00Z',
        toTime: '2026-03-06T14:00:00Z',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
