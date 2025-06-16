import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsBoolean, IsDate, IsOptional, Min } from 'class-validator';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class PropertyInput {
  @IsNotEmpty()
  @Field(() => String)
  propertyType: PropertyType;

  @Field(() => String, { defaultValue: PropertyStatus.ACTIVE })
  propertyStatus: PropertyStatus;

  @IsNotEmpty()
  @Field(() => String)
  propertyLocation: PropertyLocation;

  @IsNotEmpty()
  @Field(() => String)
  propertyAddress: string;

  @IsNotEmpty()
  @Field(() => String)
  propertyTitle: string;

  @IsNotEmpty()
  @Field(() => Float)
  propertyPrice: number;

  @IsNotEmpty()
  @Field(() => Float)
  propertySquare: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  propertyBeds: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  propertyRooms: number;

  @Field(() => Int, { defaultValue: 0 })
  propertyViews?: number;

  @Field(() => Int, { defaultValue: 0 })
  propertyLikes?: number;

  @Field(() => Int, { defaultValue: 0 })
  propertyComments?: number;

  @Field(() => Float, { defaultValue: 0 })
  propertyRank?: number;

  @IsNotEmpty()
  @Field(() => [String])
  propertyImages: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  propertyDesc?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  propertyBarter?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  propertyRent?: boolean;

  memberId?: ObjectId;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  soldAt?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  constructedAt?: Date;
}
