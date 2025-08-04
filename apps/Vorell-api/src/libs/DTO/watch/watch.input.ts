import { Field, Int, InputType, ObjectType, ID } from '@nestjs/graphql';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
} from 'class-validator';
import {
  movement,
  WatchOrigin,
  WatchStatus,
  WatchType,

} from '../../enums/watch.enum';
import { ObjectId } from 'mongoose';
import { Direction } from '../../enums/common.enum';
import { availableOptions, availableWatchSorts } from '../../config';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

// --------- INPUTS -----------

@InputType()
export class WatchInput {
  @IsNotEmpty()
  @Field(() => WatchType)
  watchType: WatchType;

  @IsNotEmpty()
  @Field(() => WatchOrigin)
  watchOrigin: WatchOrigin;

  @IsNotEmpty()
  @Field(() => String)
  modelName: string;

  @IsNotEmpty()
  @Field(() => String)
  brand: string;

  @IsNotEmpty()
  @Field(() => Int)
  price: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  caseDiameter?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  movement?: movement;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  waterResistance?: number;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isLimitedEdition?: boolean;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  releaseDate?: Date;

  @IsNotEmpty()
  @Field(() => [String])
  images: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  description?: string;

  memberId?: ObjectId;
}

@InputType()
export class Input {
  @IsNotEmpty()
  @Field(() => ID)
  _id: string;

  @IsOptional()
  @Field(() => WatchType, { nullable: true })
  watchType?: WatchType;

  @IsOptional()
  @Field(() => WatchStatus, { nullable: true })
  watchStatus?: WatchStatus;

  @IsOptional()
  @Field(() => WatchOrigin, { nullable: true })
  watchOrigin?: WatchOrigin;

  @IsOptional()
  @Length(2, 100)
  @Field(() => String, { nullable: true })
  modelName?: string;

  @IsOptional()
  @Length(2, 100)
  @Field(() => String, { nullable: true })
  brand?: string;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  price?: number;

  @IsOptional()
  @Field(() => Number, { nullable: true })
  caseDiameter?: number;

  @IsOptional()
  @Length(2, 100)
  @Field(() => String, { nullable: true })
  movement?: string;

  @IsOptional()
  @Length(2, 100)
  @Field(() => String, { nullable: true })
  waterResistance?: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  images?: string[];

  @IsOptional()
  @Length(5, 500)
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isLimitedEdition?: boolean;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  releaseDate?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;
}

// Range filters

@InputType()
export class PricesRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class PeriodsRange {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

// Search Inputs

@InputType()
class WatchSearchInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  memberId?: ObjectId;

  @IsOptional()
  @Field(() => [WatchOrigin], { nullable: true })
  originList?: WatchOrigin[];

  @IsOptional()
  @Field(() => [WatchType], { nullable: true })
  typeList?: WatchType[];

  @IsOptional()
  @Field(() => [String], { nullable: true })
  brandList?: string[];

  @IsOptional()
  @IsIn(availableOptions, { each: true })
  @Field(() => [String], { nullable: true })
  options?: string[];

  @IsOptional()
  @Field(() => PricesRange, { nullable: true })
  pricesRange?: PricesRange;

  @IsOptional()
  @Field(() => PeriodsRange, { nullable: true })
  periodsRange?: PeriodsRange;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class WatchesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableWatchSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => WatchSearchInput)
  search: WatchSearchInput;
}

@InputType()
class AdminWatchSearchInput {
  @IsOptional()
  @Field(() => WatchStatus, { nullable: true })
  watchStatus?: WatchStatus;

  @IsOptional()
  @Field(() => [WatchOrigin], { nullable: true })
  originList?: WatchOrigin[];
}

@InputType()
export class AllWatchesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableWatchSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AdminWatchSearchInput)
  search: AdminWatchSearchInput;
}

@InputType()
class StoreWatchSearchInput {
  @IsOptional()
  @Field(() => WatchStatus, { nullable: true })
  watchStatus?: WatchStatus;
}

@InputType()
export class StoreWatchesInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableWatchSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => WatchSearchInput)
  search: StoreWatchSearchInput;
}

@InputType()
export class OrdinaryInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class Watches {
  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
