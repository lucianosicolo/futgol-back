import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  CategoryEntity,
} from 'src/Categories/category.entity';

import {
  UserRole,
} from 'src/Users/user-role.enum';

import {
  UserEntity,
} from 'src/Users/users.entity';

import {
  CalendarEventCreateDto,
} from './calendar-event.dto';

import {
  CalendarEventEntity,
} from './calendar-event.entity';


@Injectable()
export class CalendarEventsService {


  constructor(

    @InjectRepository(
      CalendarEventEntity,
    )
    private readonly repo:
      Repository<CalendarEventEntity>,

    @InjectRepository(
      CategoryEntity,
    )
    private readonly categoriesRepo:
      Repository<CategoryEntity>,

    @InjectRepository(
      UserEntity,
    )
    private readonly usersRepo:
      Repository<UserEntity>,

  ) {}


  private serialize(
    event:
      CalendarEventEntity,
  ) {

    return {

      id:
        event.id,

      title:
        event.title,

      type:
        event.type,

      date:
        event.date,

      time:
        event.time,

      duration_minutes:
        event.duration_minutes,

      category:
        event.category,

      location:
        event.location,

      opponent:
        event.opponent,

      created_by:
        event.created_by
          ? {
              id:
                event.created_by.id,

              name:
                event.created_by.name,

              last_name:
                event.created_by
                  .last_name,
            }
          : null,

      created_at:
        event.created_at,

      updated_at:
        event.updated_at,

    };

  }


  private validateDate(
    date:
      string,
  ):
    void {

    if (
      !/^\d{4}-\d{2}-\d{2}$/
        .test(
          date,
        )
    ) {

      throw new BadRequestException(
        'Date must use YYYY-MM-DD format',
      );

    }


    const [
      year,
      month,
      day,
    ] =
      date
        .split('-')
        .map(
          Number,
        );


    const parsed =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day,
        ),
      );


    if (
      parsed.getUTCFullYear() !==
        year ||
      parsed.getUTCMonth() !==
        month - 1 ||
      parsed.getUTCDate() !==
        day
    ) {

      throw new BadRequestException(
        'Invalid date',
      );

    }

  }


  private validateTime(
    time:
      string,
  ):
    void {

    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/
        .test(
          time,
        )
    ) {

      throw new BadRequestException(
        'Time must use HH:mm format',
      );

    }

  }


  private validateType(
    type:
      CalendarEventCreateDto['type'],
  ):
    void {

    if (
      type !==
        'training' &&
      type !==
        'match' &&
      type !==
        'general'
    ) {

      throw new BadRequestException(
        'Invalid event type',
      );

    }

  }


  async create(

    type:
      CalendarEventCreateDto,

    createdByUserId:
      string,

  ) {

    const title =
      type.title
        ?.trim();


    if (!title) {

      throw new BadRequestException(
        'Title is required',
      );

    }


    if (
      title.length >
      120
    ) {

      throw new BadRequestException(
        'Title is too long',
      );

    }


    this.validateType(
      type.type,
    );


    this.validateDate(
      type.date,
    );


    this.validateTime(
      type.time,
    );


    const duration =
      Number(
        type.duration_minutes,
      );


    if (
      !Number.isInteger(
        duration,
      ) ||
      duration <= 0 ||
      duration > 600
    ) {

      throw new BadRequestException(
        'Invalid duration',
      );

    }


    try {

      const creator =
        await this.usersRepo
          .findOne({

            where: {
              id:
                createdByUserId,
              active:
                true,
            },

          });


      if (
        !creator ||
        (
          creator.role !==
            UserRole.ADMIN &&
          creator.role !==
            UserRole.TEACHER
        )
      ) {

        throw new NotFoundException(
          'Active staff user not found',
        );

      }


      let category:
        CategoryEntity | null =
        null;


      if (
        type.categoryId
      ) {

        category =
          await this.categoriesRepo
            .findOne({

              where: {
                id:
                  type.categoryId,
                active:
                  true,
              },

            });


        if (!category) {

          throw new NotFoundException(
            'Active category not found',
          );

        }

      }


      const event =
        this.repo.create({

          title,

          type:
            type.type,

          date:
            type.date,

          time:
            type.time,

          duration_minutes:
            duration,

          category,

          location:
            type.location
              ?.trim() ||
            null,

          opponent:
            type.opponent
              ?.trim() ||
            null,

          created_by:
            creator,

          active:
            true,

        });


      const saved =
        await this.repo.save(
          event,
        );


      return this.serialize(
        saved,
      );

    } catch (
      error: any
    ) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }


  async getAll(
    date?:
      string,
  ) {

    if (date) {

      this.validateDate(
        date,
      );

    }


    try {

      const events =
        await this.repo.find({

          where:
            date
              ? {
                  date,
                  active:
                    true,
                }
              : {
                  active:
                    true,
                },

          relations: {
            category:
              true,
            created_by:
              true,
          },

          order: {
            date:
              'ASC',
            time:
              'ASC',
          },

        });


      return events.map(
        event =>
          this.serialize(
            event,
          ),
      );

    } catch (
      error: any
    ) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }



  async update(id: string, input: CalendarEventCreateDto) {
    if (!id) throw new BadRequestException('Event id is required');
    const title = input.title?.trim();
    if (!title || title.length > 120) throw new BadRequestException('Invalid title');
    this.validateType(input.type);
    this.validateDate(input.date);
    this.validateTime(input.time);
    const duration = Number(input.duration_minutes);
    if (!Number.isInteger(duration) || duration <= 0 || duration > 600) {
      throw new BadRequestException('Invalid duration');
    }
    if (input.location && input.location.trim().length > 160) {
      throw new BadRequestException('Location is too long');
    }
    if (input.opponent && input.opponent.trim().length > 120) {
      throw new BadRequestException('Opponent is too long');
    }
    const event = await this.repo.findOne({
      where: { id, active: true },
      relations: { category: true, created_by: true },
    });
    if (!event) throw new NotFoundException('Calendar event not found');
    let category: CategoryEntity | null = null;
    if (input.categoryId) {
      category = await this.categoriesRepo.findOne({
        where: { id: input.categoryId, active: true },
      });
      if (!category) throw new NotFoundException('Active category not found');
    }
    event.title = title;
    event.type = input.type;
    event.date = input.date;
    event.time = input.time;
    event.duration_minutes = duration;
    event.category = category;
    event.location = input.location?.trim() || null;
    event.opponent = input.type === 'match' ? input.opponent?.trim() || null : null;
    const saved = await this.repo.save(event);
    return this.serialize(saved);
  }

  async delete(
    id:
      string,
  ) {

    if (!id) {

      throw new BadRequestException(
        'Event id is required',
      );

    }


    try {

      const event =
        await this.repo.findOne({

          where: {
            id,
            active:
              true,
          },

        });


      if (!event) {

        throw new NotFoundException(
          'Calendar event not found',
        );

      }


      event.active =
        false;


      return await this.repo.save(
        event,
      );

    } catch (
      error: any
    ) {

      throw new HttpException(

        error.response ??
        error.message,

        error.status ??
        HttpStatus
          .INTERNAL_SERVER_ERROR,

      );

    }

  }

}
