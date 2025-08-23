import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";
import { WatchType, WatchStatus, WatchOrigin, Movement } from "../../enums/watch.enum";
import { Member, TotalCounter } from "../member/member";
import { MeLiked } from "../like/like";

@ObjectType()
export class Watch {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => WatchType)
  watchType: WatchType;

  @Field(() => WatchStatus)
  watchStatus: WatchStatus;

  @Field(() => WatchOrigin)
  watchOrigin: WatchOrigin;

  @Field(() => String)
  modelName: string;

  @Field(() => String)
  brand: string;

  @Field(() => Number)
  price: number;

  @Field(() => String, { nullable: true })
  caseDiameter?: string; // in mm

  @Field(() => Movement, { nullable: true })
  movement?: Movement;

  @Field(() => String, { nullable: true })
  waterResistance?: number;

  @Field(() => Boolean)
  isLimitedEdition: boolean;

  @Field(() => Date, { nullable: true })
  releaseDate?: Date;

  @Field(() => Int)
  watchViews: number;

  @Field(() => Int)
  likes: number;

  @Field(() => Int)
  comments: number;

  @Field(() => Int)
  rank: number;

  @Field(() => [String])
  images: string[];

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date, { nullable: true })
  soldAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Member, { nullable: true })
  memberData?: Member;

  /** from aggregation **/
  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];
}

@ObjectType()
export class Watches {
  @Field(() => [Watch])
  list: Watch[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
