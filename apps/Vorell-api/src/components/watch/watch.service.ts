import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import moment from 'moment';
import { StatisticModifier, T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { WatchUpdate } from '../../libs/DTO/watch/watchUpdate';
import { lookupAuthMemberLiked, lookUpMember, shapeId } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { AllWatchesInquiry, OrdinaryInquiry, StoreWatchesInquiry, WatchesInquiry, WatchInput } from '../../libs/DTO/watch/watch.input';
import { WatchStatus } from '../../libs/enums/watch.enum';
import { Watch, Watches } from '../../libs/DTO/watch/watch';

@Injectable()
export class WatchService {
    constructor(
        @InjectModel('Watch') private readonly watchModel: Model<Watch>,
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService,


    ) { }

    // CREATE Watch
    public async createWatch(input: WatchInput): Promise<Watch> {
        try {
            const result = await this.watchModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'storeWatches',
                modifier: 1
            });
            return result;
        } catch (err) {
            console.log('Error, Service.model:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    // GET watch
    public async getWatch(memberId: ObjectId, watchId: ObjectId): Promise<Watch> {
        const search: T = {
            _id: watchId,
            WatchStatus: WatchStatus.IN_STOCK,
        };
        const targetWatch = await this.watchModel.findOne(search).exec();
        if (!targetWatch) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: watchId, viewGroup: ViewGroup.WATCH };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.watchStatsEditor({ _id: watchId, targetKey: 'watchViews', modifier: 1 });
				targetWatch.watchViews++;
			}

			targetWatch.memberData = await this.memberService.getMember(null as any, targetWatch.memberId);

			// meLiked
			const likeInput = { memberId: memberId, likeRefId: watchId, likeGroup: LikeGroup.WATCH };
			targetWatch.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}
        
        return targetWatch;

    }

	// UPDATE WATCH
    public async updateWatch(memberId: ObjectId, input: WatchUpdate): Promise<Watch> {
        let { watchStatus, soldAt, deletedAt } = input;
        const search: T = {
            _id: input._id,
            memberId: memberId,
            watchStatus: WatchStatus.IN_STOCK,
        };
        if (watchStatus === WatchStatus.SOLD) soldAt = moment().toDate();
        else if (watchStatus === WatchStatus.DELETE) deletedAt = moment().toDate();

        const result: Watch = await this.watchModel.findOneAndUpdate(search, input, { new: true }).exec() as Watch;
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        if (soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberWatches',
                modifier: -1,
            });
        }
        return result;
    }

    // watchStatsEditor
    public async watchStatsEditor(input: StatisticModifier): Promise<Watch> {
        const { _id, targetKey, modifier } = input;
        return await this.watchModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec() as Watch;
    }

    // GET watches
    public async getWatches(memberId: ObjectId, input: WatchesInquiry): Promise<Watches> {
        const match: T = { watchStatus: WatchStatus.IN_STOCK };
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        this.shapeMatchQuery(match, input);
        console.log('match:', match);

        const result = await this.watchModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            // meLiked
							lookupAuthMemberLiked(memberId),
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    //  Private method use only inside 
    private shapeMatchQuery(match: Record<string, any>, input: WatchesInquiry): void {
        const {
          memberId,
          originList,
          typeList,
          brandList,
          periodsRange,
          pricesRange,
          options,
          text,
        } = input.search;
      
        if (memberId) match.memberId = shapeId(memberId);
        if (originList && originList.length) match.watchOrigin = { $in: originList };
        if (typeList && typeList.length) match.watchType = { $in: typeList };
        if (brandList && brandList.length) match.brand = { $in: brandList };
      
        if (pricesRange) {
          match.price = {
            $gte: pricesRange.start,
            $lte: pricesRange.end,
          };
        }
      
        if (periodsRange) {
          match.createdAt = {
            $gte: periodsRange.start,
            $lte: periodsRange.end,
          };
        }
      
        if (text) {
          match.modelName = { $regex: new RegExp(text, 'i') };
        }
      
        if (options && options.length) {
          match['$or'] = options.map((option) => ({ [option]: true }));
        }
      } 
      

    // GET FAVORITES
	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
		return await this.likeService.getFavoriteWatches(memberId, input);
	}

	// GET VISITED
	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Watches> {
		return await this.viewService.getVisitedWatches(memberId, input);
	}


    //   getStoreWatches

    public async getStoreWatches(memberId: ObjectId, input: StoreWatchesInquiry): Promise<Watches> {
        const { watchStatus } = input.search;
        if (watchStatus === WatchStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

        const match: T = { memberId: memberId, watchStatus: watchStatus ?? { $ne: WatchStatus.DELETE } };
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        const result = await this.watchModel
            .aggregate([
                { $match: match },
                {
                    $sort: sort,
                },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            lookUpMember,
                            { $unwind: '$memberData' },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    // LIKE TARGET watch
	public async likeTargetWatch(memberId: ObjectId, likeRefId: ObjectId): Promise<Watch> {
		const target: any = await this.watchModel
			.findOne({ _id: likeRefId, watchStatus: WatchStatus.IN_STOCK })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: any = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.WATCH,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.watchStatsEditor({ _id: likeRefId, targetKey: 'watchLikes', modifier: modifier });
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}


    // getAllWatchesByAdmin
    public async getAllWatchesByAdmin(input: AllWatchesInquiry): Promise<Watches> {
        const { watchStatus, originList } = input.search;
        const match: T = {};
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        if (watchStatus) match.watchStatus = watchStatus;
        if (originList) match.originList = { $in: originList };

        const result = await this.watchModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        lookUpMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ]);

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        return result[0];
    }

    // UPDATE WATCH BY ADMIN
    public async updateWatchByAdmin(input: WatchUpdate): Promise<Watch> {
        let { watchStatus, soldAt, deletedAt } = input;
        const search: T = {
            _id: input._id,
            watchStatus: WatchStatus.IN_STOCK,
        };
        if (watchStatus === WatchStatus.SOLD) soldAt = moment().toDate();
        else if (watchStatus === WatchStatus.DELETE) deletedAt = moment().toDate();

        const result = await this.watchModel.findOneAndUpdate(search, input, { new: true }).exec();
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        if (soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'storeWatches',
                modifier: -1,
            });
        }
        return result;
    }

    // DELETE WATCH BY ADMIN
    public async removeWatchByAdmin(watchId: ObjectId): Promise<Watch> {
        const search: T = { _id: watchId, WatchStatus: WatchStatus.DELETE };
        const result = await this.watchModel.findOneAndDelete(search).exec();
        if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

        return result;
    }

}