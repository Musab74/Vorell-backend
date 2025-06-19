import { Field, InputType } from "@nestjs/graphql";
import { ObjectId } from "bson";
import {IsNotEmpty} from "class-validator"
import { ViewGroup } from "../../enums/view.enum";
import { Types } from "mongoose";



@InputType()
export class ViewInput {
    @IsNotEmpty()
    @Field( ()=>ViewGroup)
    viewGroup: ViewGroup;

    @IsNotEmpty()
    @Field( ()=>String)
    viewRefId: ObjectId;

    @IsNotEmpty()
    @Field( ()=>String)
    memberId: Types.ObjectId;

}


