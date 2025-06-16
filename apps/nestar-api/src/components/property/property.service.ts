import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthService } from '../auth/auth.service';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import { Member } from '../../libs/DTO/member/member';
import { MemberService } from '../member/member.service';
import { PropertyInput } from '../../libs/DTO/property/property.input';
import { Property } from '../../libs/DTO/property/property';
import { PropertyStatus } from '../../libs/enums/property.enum';
import moment from 'moment';
import { StatisticModifier, T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class PropertyService {
    constructor(
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        private memberService: MemberService,
        private viewService: ViewService,
    ) { }

    // CREATE PROPERTY
    public async createProperty(input: PropertyInput): Promise<Property> {
        try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'memberProperties',
                modifier: 1
            });
            return result;
        } catch (err) {
            console.log('Error, Service.model:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    // GET PROPERTY
    // public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
    //     const search: T = {
    //         _id: propertyId,
    //         propertyStatus: PropertyStatus.ACTIVE,
    //     };
    //     const targetProperty = await this.propertyModel.findOne(search).lean().exec();
    //     if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    //     if (memberId) {
    //         const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
    //         const newView = await this.viewService.recordView(viewInput);
    //         if (newView) {
    //             await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
    //             targetProperty.propertyViews++;
    //         }

    //         targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
    //     }

    //     return targetProperty;
    // }

    // // UPDATE PROPERTY
    // public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
    //     let { propertyStatus, soldAt, deletedAt } = input;
    //     const search: T = {
    //         _id: input._id,
    //         memberId: memberId,
    //         propertyStatus: PropertyStatus.ACTIVE,
    //     };
    //     if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
    //     else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

    //     const result: Property = await this.propertyModel.findOneAndUpdate(search, input, { new: true }).exec() as Property; 
    //     if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    //     if (soldAt || deletedAt) {
    //         await this.memberService.memberStatsEditor({
    //             _id: memberId,
    //             targetKey: 'memberProperties',
    //             modifier: -1,
    //         });
    //     }
    //     return result;
    // }

    // // PROPERTY STATS EDITOR
	// public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
	// 	const { _id, targetKey, modifier } = input;
	// 	return await this.propertyModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec() as Property;
	// }

}