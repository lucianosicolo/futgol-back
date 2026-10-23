import {
  NoticesService,
} from './notices.service';

import {
  UserRole,
} from 'src/Users/user-role.enum';


describe(
  'NoticesService recipient resolution',
  () => {

    it(
      'deduplicates active responsible users',
      () => {

        const responsible = {
          id:
            'responsible-1',
          role:
            UserRole.RESPONSIBLE,
          active:
            true,
        };


        const service =
          new NoticesService(
            {} as any,
            {} as any,
            {} as any,
          );


        const result =
          (
            service as any
          ).collectRecipients([

            {
              user:
                responsible,
              responsibles: [
                responsible,
              ],
            },

            {
              user:
                null,
              responsibles: [
                responsible,
              ],
            },

          ]);


        expect(
          result,
        ).toEqual([
          responsible,
        ]);

      },
    );

  },
);
