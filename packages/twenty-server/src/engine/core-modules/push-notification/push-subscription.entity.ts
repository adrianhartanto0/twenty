import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Entity({ name: 'pushSubscription', schema: 'core' })
@ObjectType('PushSubscription')
@Unique('IDX_PUSH_SUBSCRIPTION_ENDPOINT_UNIQUE', ['endpoint'])
@Index('IDX_PUSH_SUBSCRIPTION_USER_ID', ['userId'])
export class PushSubscriptionEntity {
  @Field(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;

  @Column({ nullable: false, type: 'uuid' })
  userId: string;

  @Field(() => String)
  @Column({ nullable: false, type: 'text' })
  endpoint: string;

  @Column({ nullable: false, type: 'text' })
  p256dh: string;

  @Column({ nullable: false, type: 'text' })
  auth: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'text' })
  userAgent: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  expirationTime: Date | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
