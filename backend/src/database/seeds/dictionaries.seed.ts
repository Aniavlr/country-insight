import { DataSource } from 'typeorm';

import { City } from '../../modules/dictionaries/entities/city.entity.js';
import { Category } from '../../modules/dictionaries/entities/category.entity.js';
import { Format } from '../../modules/dictionaries/entities/format.entity.js';
import { AgeLimit } from '../../modules/dictionaries/entities/age-limit.entity.js';
import { OrganizerType } from '../../modules/dictionaries/entities/organizer-type.entity.js';
import { TicketType } from '../../modules/dictionaries/entities/ticket-type.entity.js';
import { OrderStatus } from '../../modules/dictionaries/entities/order-status.entity.js';
import { ETicketStatus } from '../../modules/dictionaries/entities/e-ticket-status.entity.js';
import { EventStatus } from '../../modules/dictionaries/entities/event-status.entity.js';
import { VerificationStatus } from '../../modules/dictionaries/entities/verification-status.entity.js';
import { ReminderType } from '../../modules/dictionaries/entities/reminder-type.entity.js';
import { NotificationType } from '../../modules/dictionaries/entities/notification-type.entity.js';
import { Badge } from '../../modules/dictionaries/entities/badge.entity.js';

export async function seedDictionaries(dataSource: DataSource): Promise<void> {
  console.log('Seeding dictionaries...');

  // ======================
  // 1. Cities
  // ======================
  const cityRepo = dataSource.getRepository(City);
  await cityRepo.upsert(
    [
      { name: 'Минск', region: 'Минская область', lat: 53.9045, lon: 27.5615 },
      {
        name: 'Гомель',
        region: 'Гомельская область',
        lat: 52.4345,
        lon: 30.9754,
      },
      {
        name: 'Гродно',
        region: 'Гродненская область',
        lat: 53.6884,
        lon: 23.8258,
      },
      {
        name: 'Витебск',
        region: 'Витебская область',
        lat: 55.1904,
        lon: 30.2049,
      },
      {
        name: 'Могилёв',
        region: 'Могилёвская область',
        lat: 53.9007,
        lon: 30.3314,
      },
      {
        name: 'Брест',
        region: 'Брестская область',
        lat: 52.0976,
        lon: 23.7341,
      },
      {
        name: 'Бобруйск',
        region: 'Могилёвская область',
        lat: 53.144,
        lon: 29.2214,
      },
      {
        name: 'Барановичи',
        region: 'Брестская область',
        lat: 53.1327,
        lon: 26.0139,
      },
      { name: 'Борисов', region: 'Минская область', lat: 54.2279, lon: 28.505 },
      {
        name: 'Пинск',
        region: 'Брестская область',
        lat: 52.1229,
        lon: 26.0951,
      },
      {
        name: 'Мозырь',
        region: 'Гомельская область',
        lat: 52.0495,
        lon: 29.2456,
      },
      { name: 'Лида', region: 'Гродненская область', lat: 53.8833, lon: 25.3 },
      { name: 'Орша', region: 'Витебская область', lat: 54.5081, lon: 30.4175 },
      {
        name: 'Солигорск',
        region: 'Минская область',
        lat: 52.7876,
        lon: 27.5422,
      },
      {
        name: 'Молодечно',
        region: 'Минская область',
        lat: 54.3167,
        lon: 26.85,
      },
      {
        name: 'Полоцк',
        region: 'Витебская область',
        lat: 55.4856,
        lon: 28.7781,
      },
      { name: 'Жодино', region: 'Минская область', lat: 54.0983, lon: 28.3328 },
      { name: 'Слуцк', region: 'Минская область', lat: 53.0272, lon: 27.5597 },
      {
        name: 'Кобрин',
        region: 'Брестская область',
        lat: 52.2139,
        lon: 24.3567,
      },
      {
        name: 'Слоним',
        region: 'Гродненская область',
        lat: 53.0947,
        lon: 25.3211,
      },
    ],
    ['name'],
  );
  console.log('cities upserted');

  // ======================
  // 2. Categories
  // ======================
  const categoryRepo = dataSource.getRepository(Category);
  await categoryRepo.upsert(
    [
      { name: 'Еда и напитки', slug: 'food-drinks', icon: 'utensils' },
      { name: 'Мастер-классы', slug: 'workshops', icon: 'palette' },
      { name: 'События', slug: 'events', icon: 'calendar' },
      { name: 'Музыка', slug: 'music', icon: 'music' },
      { name: 'Культура', slug: 'culture', icon: 'landmark' },
      { name: 'Активности', slug: 'activities', icon: 'running' },
    ],
    ['slug'],
  );
  console.log('categories upserted');

  // ======================
  // 3. Formats (вайбы)
  // ======================
  const formatRepo = dataSource.getRepository(Format);
  await formatRepo.upsert(
    [
      { name: 'Уютно', slug: 'cozy' },
      { name: 'Шумно', slug: 'loud' },
      { name: 'Романтично', slug: 'romantic' },
      { name: 'Интеллектуально', slug: 'intellectual' },
      { name: 'Семейно', slug: 'family' },
    ],
    ['slug'],
  );
  console.log('formats upserted');

  // ======================
  // 4. Age Limits
  // ======================
  const ageLimitRepo = dataSource.getRepository(AgeLimit);
  if ((await ageLimitRepo.count()) === 0) {
    await ageLimitRepo.insert([
      { value: '0+' },
      { value: '6+' },
      { value: '12+' },
      { value: '16+' },
      { value: '18+' },
    ]);
    console.log('age_limits');
  } else {
    console.log('age_limits already seeded');
  }

  // ======================
  // 5. Organizer Types
  // ======================
  const organizerTypeRepo = dataSource.getRepository(OrganizerType);
  if ((await organizerTypeRepo.count()) === 0) {
    await organizerTypeRepo.insert([
      { name: 'Компания' },
      { name: 'Ресторан' },
      { name: 'Частное лицо' },
    ]);
    console.log('organizer_types');
  } else {
    console.log('organizer_types already seeded');
  }

  // ======================
  // 6. Ticket Types
  // ======================
  const ticketTypeRepo = dataSource.getRepository(TicketType);
  if ((await ticketTypeRepo.count()) === 0) {
    await ticketTypeRepo.insert([
      { name: 'Бесплатное' },
      { name: 'Платное' },
      { name: 'Donation' },
      { name: 'По брони' },
    ]);
    console.log('ticket_types');
  } else {
    console.log('ticket_types already seeded');
  }

  // ======================
  // 7. Order Statuses
  // ======================
  const orderStatusRepo = dataSource.getRepository(OrderStatus);
  if ((await orderStatusRepo.count()) === 0) {
    await orderStatusRepo.insert([
      { name: 'Ожидает оплаты' },
      { name: 'Оплачен' },
      { name: 'Отменён' },
      { name: 'Возврат' },
    ]);
    console.log('order_statuses');
  } else {
    console.log('order_statuses already seeded');
  }

  // ======================
  // 8. E-Ticket Statuses
  // ======================
  const eTicketStatusRepo = dataSource.getRepository(ETicketStatus);
  if ((await eTicketStatusRepo.count()) === 0) {
    await eTicketStatusRepo.insert([
      { name: 'Ожидает оплаты' },
      { name: 'Активен' },
      { name: 'Использован' },
      { name: 'Отменён' },
    ]);
    console.log('e_ticket_statuses');
  } else {
    console.log('e_ticket_statuses already seeded');
  }

  // ======================
  // 9. Event Statuses
  // ======================
  const eventStatusRepo = dataSource.getRepository(EventStatus);
  if ((await eventStatusRepo.count()) === 0) {
    await eventStatusRepo.insert([
      { name: 'Черновик' },
      { name: 'На модерации' },
      { name: 'Одобрено' },
      { name: 'Отклонено' },
      { name: 'Отменено' },
      { name: 'Завершено' },
    ]);
    console.log('event_statuses');
  } else {
    console.log('event_statuses already seeded');
  }

  // ======================
  // 10. Verification Statuses
  // ======================
  const verificationStatusRepo = dataSource.getRepository(VerificationStatus);
  if ((await verificationStatusRepo.count()) === 0) {
    await verificationStatusRepo.insert([
      { name: 'На проверке' },
      { name: 'Одобрен' },
      { name: 'Отклонён' },
    ]);
    console.log('verification_statuses');
  } else {
    console.log('verification_statuses already seeded');
  }

  // ======================
  // 11. Reminder Types
  // ======================
  const reminderTypeRepo = dataSource.getRepository(ReminderType);
  if ((await reminderTypeRepo.count()) === 0) {
    await reminderTypeRepo.insert([
      { name: 'За 24 часа' },
      { name: 'За 1 час' },
    ]);
    console.log('reminder_types');
  } else {
    console.log('reminder_types already seeded');
  }

  // ======================
  // 12. Notification Types
  // ======================
  const notificationTypeRepo = dataSource.getRepository(NotificationType);
  if ((await notificationTypeRepo.count()) === 0) {
    await notificationTypeRepo.insert([
      { name: 'Новое событие у подписки' },
      { name: 'Отмена события' },
      { name: 'Билет' },
      { name: 'Напоминание' },
      { name: 'Возврат' },
      { name: 'Модерация' },
    ]);
    console.log('notification_types');
  } else {
    console.log('notification_types already seeded');
  }

  // ======================
  // 13. Badges
  // ======================
  const badgeRepo = dataSource.getRepository(Badge);
  await badgeRepo.upsert(
    [
      {
        name: 'Первый шаг',
        description: 'Посетил первое событие',
        condition: 'events_attended >= 1',
      },
      {
        name: 'Посетил 5 событий',
        description: 'Посетил 5 событий',
        condition: 'events_attended >= 5',
      },
      {
        name: 'Посетил 10 событий',
        description: 'Посетил 10 событий',
        condition: 'events_attended >= 10',
      },
      {
        name: 'Ночной житель города',
        description: 'Посетил 3 ночных события (после 22:00)',
        condition: 'night_events >= 3',
      },
    ],
    ['name'],
  );
  console.log('badges upserted');

  console.log('Dictionaries seeding completed\n');
}
