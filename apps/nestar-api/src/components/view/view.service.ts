import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { T } from '../../libs/types/common';
import { ViewInput } from '../../libs/DTO/Views/view.input';
import { View } from '../../libs/DTO/Views/view';
import { Properties } from '../../libs/DTO/property/property';
import { OrdinaryInquiry } from '../../libs/DTO/property/property.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookUpVisit } from '../../libs/config';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  public async recordView(input: ViewInput): Promise<View | null> {
    const exist = await this.checkView(input);
    if (!exist) {
      return await this.viewModel.create(input);
    } else return null;
  }

  private async checkView(input: ViewInput): Promise<View | null> {
    const { memberId, viewRefId } = input;
    const search: T = {
      memberId: memberId,
      viewRefId: viewRefId,
    };
  

    return await this.viewModel.findOne(search).exec();
  }

  public async getVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.PROPERTY, memberId: memberId };

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'properties',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedProperty',
					},
				},
				{ $unwind: '$visitedProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookUpVisit,
							{ $unwind: '$visitedProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedProperty);
		return result;
	}
}