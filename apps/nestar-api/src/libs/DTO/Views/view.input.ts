import { Field, InputType } from "@nestjs/graphql";
import { ObjectId } from "bson";
import {IsNotEmpty} from "class-validator"
import { ViewGroup } from "../../enums/view.enum";



@InputType()
export class ViewInput {
    @IsNotEmpty()
    @Field( ()=>String)
    viewGroup: ViewGroup;

    @IsNotEmpty()
    @Field( ()=>String)
    viewRefId: ObjectId;

    @IsNotEmpty()
    @Field( ()=>String)
    memberId: ObjectId;

}

