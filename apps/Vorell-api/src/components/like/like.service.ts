import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { LikeInput } from '../../libs/DTO/like/like.input';
import { Like, MeLiked } from '../../libs/DTO/like/like';
import { LikeGroup } from '../../libs/enums/like.enum';
import { OrdinaryInquiry } from '../../libs/DTO/watch/watch.input';
import { lookUpFavorite } from '../../libs/config';
import { Watches } from '../../libs/DTO/watch/watch';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) { }

	public async toggleLike(input: LikeInput): Promise<number> {
		const search = { memberId: input.memberId, likeRefId: input.likeRefId, likeGroup: input.likeGroup };
		const existing = await this.likeModel.findOne(search).lean();
		if (existing) {
		  const del = await this.likeModel.deleteOne({ _id: existing._id });
		  if (del.acknowledged && del.deletedCount === 1) return -1;
		  throw new BadRequestException('Failed to remove like.');
		}
	  
		try {
		  await this.likeModel.create(input);
		  return 1;
		} catch (err: any) {
		  if (err?.code === 11000) return 1; // race: someone just created it
		  console.log('ERROR, Service.model:', err.message);
		  throw new BadRequestException(Message.CREATE_FAILED);
		}
	  }
	  

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input; ///distruction
		const result = await this.likeModel.findOne({
			memberId,
			likeRefId,
			likeGroup: input.likeGroup,
		}).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteWatches(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.WATCH, memberId: memberId };

		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'watches',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteWatch',
					},
				},
				{ $unwind: '$favoriteWatch' },
				{ $match: { 'favoriteWatch.watchStatus': 'IN_STOCK' } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookUpFavorite,
							{ $unwind: '$favoriteWatch.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Watches = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteWatch);
		return result;
	}
}
