import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { CaseDiameter, Movement, WatchOrigin, WatchStatus, WatchType } from '../../enums/watch.enum';

@InputType()
export class WatchUpdate{
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
  @Field(() => CaseDiameter, { nullable: true })
  caseDiameter?: CaseDiameter; // in mm

  @IsOptional()
  @Length(2, 100)
  @Field(() => Movement, { nullable: true })
  movement?: Movement;

  @IsOptional()
  @Field(() => String, { nullable: true })
  waterResistance?: number;

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
