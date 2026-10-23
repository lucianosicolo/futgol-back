import {
  BadRequestException,
} from '@nestjs/common';

import {
  CalendarEventsService,
} from './calendar-events.service';

import {
  UserRole,
} from 'src/Users/user-role.enum';


describe(
  'CalendarEventsService',
  () => {

    const repo = {
      create:
        jest.fn(),
      save:
        jest.fn(),
      find:
        jest.fn(),
      findOne:
        jest.fn(),
    };

    const categoriesRepo = {
      findOne:
        jest.fn(),
    };

    const usersRepo = {
      findOne:
        jest.fn(),
    };

    let service:
      CalendarEventsService;


    beforeEach(
      () => {

        jest.clearAllMocks();


        repo.create
          .mockImplementation(
            value =>
              value,
          );

        repo.save
          .mockImplementation(
            async value => ({
              id:
                'event-1',
              created_at:
                new Date(),
              updated_at:
                new Date(),
              ...value,
            }),
          );


        service =
          new CalendarEventsService(
            repo as any,
            categoriesRepo as any,
            usersRepo as any,
          );

      },
    );


    it(
      'creates an event with an active category and safe creator data',
      async () => {

        usersRepo.findOne
          .mockResolvedValue({
            id:
              'teacher-1',
            name:
              'Profe',
            last_name:
              'Uno',
            email:
              'private@test.com',
            phone:
              '123',
            role:
              UserRole.TEACHER,
            active:
              true,
          });

        categoriesRepo.findOne
          .mockResolvedValue({
            id:
              'category-1',
            name:
              '2013/2014',
            active:
              true,
          });


        const result =
          await service.create(
            {
              title:
                'Entrenamiento',
              type:
                'training',
              date:
                '2026-10-23',
              time:
                '18:00',
              duration_minutes:
                90,
              categoryId:
                'category-1',
            },
            'teacher-1',
          );


        expect(
          result.created_by,
        ).toEqual({
          id:
            'teacher-1',
          name:
            'Profe',
          last_name:
            'Uno',
        });


        expect(
          (result.created_by as any)
            .email,
        ).toBeUndefined();

      },
    );


    it(
      'rejects an invalid calendar date before saving',
      async () => {

        await expect(

          service.create(
            {
              title:
                'Partido',
              type:
                'match',
              date:
                '2026-02-31',
              time:
                '10:00',
              duration_minutes:
                120,
            },
            'admin-1',
          ),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );


        expect(
          repo.save,
        ).not.toHaveBeenCalled();

      },
    );


    it(
      'rejects invalid time',
      async () => {

        await expect(

          service.create(
            {
              title:
                'Actividad',
              type:
                'general',
              date:
                '2026-10-23',
              time:
                '25:90',
              duration_minutes:
                60,
            },
            'admin-1',
          ),

        ).rejects.toBeInstanceOf(
          BadRequestException,
        );

      },
    );


    it('edits an event and clears optional fields', async () => {
      repo.findOne.mockResolvedValue({
        id: 'event-1', active: true, title: 'Old',
        category: { id: 'category-1' }, location: 'Old', opponent: 'Old',
        created_by: { id: 'teacher-1', name: 'Profe', last_name: 'Uno' },
      });
      const result = await service.update('event-1', {
        title: 'Updated', type: 'training', date: '2026-10-24',
        time: '19:00', duration_minutes: 60,
      });
      expect(result.title).toBe('Updated');
      expect(result.category).toBeNull();
      expect(result.location).toBeNull();
      expect(result.opponent).toBeNull();
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('rejects edits with invalid date before saving', async () => {
      await expect(service.update('event-1', {
        title: 'Bad date', type: 'match', date: '2026-02-31',
        time: '18:00', duration_minutes: 90,
      })).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects edits to inactive events', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update('event-1', {
        title: 'Match', type: 'match', date: '2026-10-24',
        time: '18:00', duration_minutes: 90,
      })).rejects.toThrow('Calendar event not found');
      expect(repo.save).not.toHaveBeenCalled();
    });


    it('changes the assigned category and preserves opponent for matches', async () => {
      repo.findOne.mockResolvedValue({
        id: 'event-1', active: true,
        created_by: { id: 'teacher-1', name: 'Profe', last_name: 'Uno' },
      });
      categoriesRepo.findOne.mockResolvedValue({
        id: 'new-category', name: 'Sub 15', active: true,
      });
      const result = await service.update('event-1', {
        title: 'Saturday match', type: 'match', date: '2026-10-24',
        time: '10:00', duration_minutes: 90,
        categoryId: 'new-category', opponent: 'Racing',
      });
      expect(result.category.id).toBe('new-category');
      expect(result.opponent).toBe('Racing');
      expect(categoriesRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'new-category', active: true },
      });
    });

    it('rejects inactive categories on update', async () => {
      repo.findOne.mockResolvedValue({ id: 'event-1', active: true });
      categoriesRepo.findOne.mockResolvedValue(null);
      await expect(service.update('event-1', {
        title: 'Match', type: 'match', date: '2026-10-24',
        time: '18:00', duration_minutes: 90, categoryId: 'inactive',
      })).rejects.toThrow('Active category not found');
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects excessive duration on update', async () => {
      await expect(service.update('event-1', {
        title: 'Match', type: 'match', date: '2026-10-24',
        time: '18:00', duration_minutes: 601,
      })).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it(
      'soft deletes an active event',
      async () => {

        repo.findOne
          .mockResolvedValue({
            id:
              'event-1',
            active:
              true,
          });


        const result =
          await service.delete(
            'event-1',
          );


        expect(
          repo.save,
        ).toHaveBeenCalledWith(

          expect.objectContaining({
            id:
              'event-1',
            active:
              false,
          }),

        );


        expect(
          result.active,
        ).toBe(
          false,
        );

      },
    );

  },
);
